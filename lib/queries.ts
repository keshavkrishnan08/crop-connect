import { supabase } from "@/lib/supabase";
import {
    type Profile, type Listing, type ListingType, type Contract, type Terms,
    type ContractStatus, type NegotiationMessage, type BoardNode, type BoardEdge,
    type Delivery, type NodeType, type NodeStatus,
} from "@/lib/types";
import { buildSchedule, defaultBoard, DEFAULT_EDGES, contractValueCents } from "@/lib/contract";

const FARM = "farm:profiles!contracts_farm_id_fkey(*)";
const BUYER = "buyer:profiles!contracts_buyer_id_fkey(*)";

// ---------------- PROFILES ----------------
export async function upsertProfile(p: Partial<Profile> & { id: string }) {
    const { data, error } = await supabase.from("profiles").upsert(p).select().single();
    if (error) throw error;
    return data as Profile;
}

export async function getProfile(id: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    return data as Profile | null;
}

// ---------------- LISTINGS ----------------
export async function createListing(input: {
    owner_id: string; type: ListingType; title: string; terms: Terms;
    price_ceiling_cents?: number | null; location_label?: string | null; lat?: number | null; lng?: number | null;
}) {
    const { data, error } = await supabase.from("listings").insert(input).select().single();
    if (error) throw error;
    return data as Listing;
}

export async function getMyListings(ownerId: string) {
    const { data } = await supabase
        .from("listings")
        .select("*, owner:profiles!listings_owner_id_fkey(*)")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
    return (data ?? []) as Listing[];
}

/** Open listings of a given type for discovery (RLS already limits to active). */
export async function getOpenListings(type?: ListingType) {
    let q = supabase
        .from("listings")
        .select("*, owner:profiles!listings_owner_id_fkey(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
    if (type) q = q.eq("type", type);
    const { data } = await q;
    return (data ?? []) as Listing[];
}

export async function getListing(id: string) {
    const { data } = await supabase
        .from("listings")
        .select("*, owner:profiles!listings_owner_id_fkey(*)")
        .eq("id", id)
        .single();
    return data as Listing | null;
}

export async function setListingStatus(id: string, status: Listing["status"]) {
    await supabase.from("listings").update({ status }).eq("id", id);
}

// ---------------- CONTRACTS ----------------
const CONTRACT_SELECT = `*, ${FARM}, ${BUYER}`;

export async function getMyContracts(userId: string) {
    const { data } = await supabase
        .from("contracts")
        .select(CONTRACT_SELECT)
        .or(`farm_id.eq.${userId},buyer_id.eq.${userId}`)
        .order("updated_at", { ascending: false });
    return (data ?? []) as Contract[];
}

export async function getContract(id: string) {
    const { data } = await supabase.from("contracts").select(CONTRACT_SELECT).eq("id", id).single();
    if (!data) return null;
    const [versions, deliveries] = await Promise.all([
        supabase.from("contract_versions").select("*").eq("contract_id", id).order("version"),
        supabase.from("deliveries").select("*").eq("contract_id", id).order("seq"),
    ]);
    return { ...(data as Contract), versions: versions.data ?? [], deliveries: deliveries.data ?? [] } as Contract;
}

/**
 * Propose a new contract from a counterparty listing.
 * `me` is the proposing party; `farmId`/`buyerId` resolve the two sides.
 */
export async function proposeContract(input: {
    listing: Listing; meId: string; meRole: "farm" | "buyer"; terms: Terms; note?: string;
}) {
    const otherId = input.listing.owner_id;
    const farm_id = input.meRole === "farm" ? input.meId : otherId;
    const buyer_id = input.meRole === "buyer" ? input.meId : otherId;
    const { data, error } = await supabase
        .from("contracts")
        .insert({ listing_id: input.listing.id, farm_id, buyer_id, terms: input.terms, status: "proposed", current_version: 1 })
        .select()
        .single();
    if (error) throw error;
    const contract = data as Contract;
    await supabase.from("contract_versions").insert({
        contract_id: contract.id, version: 1, terms: input.terms, proposed_by: input.meId, note: input.note ?? null,
    });
    await supabase.from("negotiation_messages").insert({
        contract_id: contract.id, sender_id: input.meId, kind: "system",
        body: `Contract proposed for ${input.terms.crop}.`, version_ref: 1,
    });
    return contract;
}

/** Counter — push a new version and flip status to countered. */
export async function counterContract(contract: Contract, meId: string, terms: Terms, note?: string) {
    const version = contract.current_version + 1;
    await supabase.from("contract_versions").insert({
        contract_id: contract.id, version, terms, proposed_by: meId, note: note ?? null,
    });
    await supabase.from("contracts").update({
        terms, current_version: version, status: "countered", farm_confirmed: false, buyer_confirmed: false,
    }).eq("id", contract.id);
    await supabase.from("negotiation_messages").insert({
        contract_id: contract.id, sender_id: meId, kind: "counter",
        body: note || "Proposed revised terms.", version_ref: version,
    });
}

export async function declineContract(contract: Contract, meId: string, note?: string) {
    await supabase.from("contracts").update({ status: "closed" }).eq("id", contract.id);
    await supabase.from("negotiation_messages").insert({
        contract_id: contract.id, sender_id: meId, kind: "decline", body: note || "Declined.",
    });
}

/**
 * Confirm the current terms. When both parties have confirmed, the contract
 * activates: schedule + supply-chain board are generated, listing marked matched.
 */
export async function confirmContract(contract: Contract, meId: string) {
    const isFarm = contract.farm_id === meId;
    const patch = isFarm ? { farm_confirmed: true } : { buyer_confirmed: true };
    const bothConfirmed = isFarm ? contract.buyer_confirmed : contract.farm_confirmed;

    if (bothConfirmed) {
        await supabase.from("contracts").update({ ...patch, status: "active" }).eq("id", contract.id);
        await generateScheduleAndBoard(contract);
        if (contract.listing_id) await setListingStatus(contract.listing_id, "matched");
    } else {
        const status: ContractStatus = "agreed";
        await supabase.from("contracts").update({ ...patch, status }).eq("id", contract.id);
    }
    await supabase.from("negotiation_messages").insert({
        contract_id: contract.id, sender_id: meId, kind: "accept",
        body: bothConfirmed ? "Confirmed — contract is now active." : "Confirmed these terms. Awaiting the other party.",
    });
}

async function generateScheduleAndBoard(contract: Contract) {
    // deliveries
    const { count } = await supabase.from("deliveries").select("*", { count: "exact", head: true }).eq("contract_id", contract.id);
    if (!count) {
        const rows = buildSchedule(contract.terms).map((d) => ({
            contract_id: contract.id, seq: d.seq, scheduled_date: d.date, quantity: d.quantity, status: "scheduled" as const,
        }));
        if (rows.length) await supabase.from("deliveries").insert(rows);
    }
    // board
    const { count: nodeCount } = await supabase.from("board_nodes").select("*", { count: "exact", head: true }).eq("contract_id", contract.id);
    if (!nodeCount) {
        const nodes = defaultBoard().map((n, i) => ({
            contract_id: contract.id, type: n.type, label: n.label, x: n.x, y: n.y,
            status: (i === 0 ? "active" : "pending") as NodeStatus, highlighted: i === 0,
        }));
        const { data: inserted } = await supabase.from("board_nodes").insert(nodes).select();
        if (inserted) {
            const edges = DEFAULT_EDGES
                .filter(([a, b]) => inserted[a] && inserted[b])
                .map(([a, b]) => ({ contract_id: contract.id, source: inserted[a].id, target: inserted[b].id, label: null }));
            if (edges.length) await supabase.from("board_edges").insert(edges);
        }
    }
}

export async function renewContract(contract: Contract, meId: string, terms: Terms) {
    const newStart = new Date(contract.terms.term_end);
    const span = +new Date(contract.terms.term_end) - +new Date(contract.terms.term_start);
    const newEnd = new Date(+newStart + span);
    const renewed: Terms = { ...terms, term_start: newStart.toISOString().slice(0, 10), term_end: newEnd.toISOString().slice(0, 10) };
    await supabase.from("contracts").update({
        terms: renewed, status: "active", farm_confirmed: true, buyer_confirmed: true,
        current_version: contract.current_version + 1,
    }).eq("id", contract.id);
    await supabase.from("contract_versions").insert({
        contract_id: contract.id, version: contract.current_version + 1, terms: renewed, proposed_by: meId, note: "Renewal",
    });
    await generateScheduleAndBoard({ ...contract, terms: renewed });
}

export async function completeContract(contract: Contract, meId: string, outcome: "completed" | "closed") {
    await supabase.from("contracts").update({ status: outcome }).eq("id", contract.id);
    await supabase.from("completion_records").insert({ contract_id: contract.id, party_id: meId, outcome, notes: null });
}

// ---------------- MESSAGES ----------------
export async function getMessages(contractId: string) {
    const { data } = await supabase
        .from("negotiation_messages")
        .select("*, sender:profiles!negotiation_messages_sender_id_fkey(*)")
        .eq("contract_id", contractId)
        .order("created_at");
    return (data ?? []) as NegotiationMessage[];
}

export async function sendMessage(contractId: string, senderId: string, body: string) {
    const { data } = await supabase
        .from("negotiation_messages")
        .insert({ contract_id: contractId, sender_id: senderId, kind: "message", body })
        .select("*, sender:profiles!negotiation_messages_sender_id_fkey(*)")
        .single();
    return data as NegotiationMessage;
}

// ---------------- BOARD ----------------
export async function getBoard(contractId: string) {
    const [nodes, edges] = await Promise.all([
        supabase.from("board_nodes").select("*").eq("contract_id", contractId),
        supabase.from("board_edges").select("*").eq("contract_id", contractId),
    ]);
    return { nodes: (nodes.data ?? []) as BoardNode[], edges: (edges.data ?? []) as BoardEdge[] };
}

export async function addNode(contractId: string, n: { type: NodeType; label: string; x: number; y: number }) {
    const { data } = await supabase.from("board_nodes").insert({ contract_id: contractId, ...n, status: "pending" }).select().single();
    return data as BoardNode;
}

export async function updateNode(id: string, patch: Partial<Pick<BoardNode, "x" | "y" | "label" | "status" | "highlighted" | "type">>) {
    await supabase.from("board_nodes").update(patch).eq("id", id);
}

export async function deleteNode(id: string) {
    await supabase.from("board_nodes").delete().eq("id", id);
}

export async function addEdge(contractId: string, source: string, target: string) {
    const { data } = await supabase.from("board_edges").insert({ contract_id: contractId, source, target, label: null }).select().single();
    return data as BoardEdge;
}

export async function deleteEdge(id: string) {
    await supabase.from("board_edges").delete().eq("id", id);
}

/** Move the product highlight to one node (clears others). */
export async function highlightNode(contractId: string, nodeId: string) {
    await supabase.from("board_nodes").update({ highlighted: false }).eq("contract_id", contractId);
    await supabase.from("board_nodes").update({ highlighted: true, status: "active" }).eq("id", nodeId);
}

// ---------------- DELIVERIES ----------------
export async function setDeliveryStatus(id: string, status: Delivery["status"]) {
    await supabase.from("deliveries").update({ status }).eq("id", id);
}

/** Upcoming scheduled deliveries across all my contracts (RLS-scoped). */
export async function getUpcomingDeliveries(limit = 6) {
    const { data } = await supabase
        .from("deliveries")
        .select(`*, contract:contracts!inner(id, terms, farm_id, buyer_id, ${FARM}, ${BUYER})`)
        .eq("status", "scheduled")
        .order("scheduled_date", { ascending: true })
        .limit(limit);
    return (data ?? []) as (Delivery & { contract: Contract })[];
}

/** All board nodes + edges for my active/renewed contracts — for the Supply Hub. */
export async function getHubData(userId: string) {
    const { data: contracts } = await supabase
        .from("contracts")
        .select(CONTRACT_SELECT)
        .or(`farm_id.eq.${userId},buyer_id.eq.${userId}`)
        .in("status", ["active", "renewed"]);
    const list = (contracts ?? []) as Contract[];
    const boards = await Promise.all(
        list.map(async (c) => {
            const { nodes, edges } = await getBoard(c.id);
            return { contract: c, nodes, edges };
        }),
    );
    return boards.filter((b) => b.nodes.length > 0);
}

export { contractValueCents };
