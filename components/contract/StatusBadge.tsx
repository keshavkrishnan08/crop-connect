import { Badge } from "@/components/ui/kit";
import { CONTRACT_STATUS_META, type ContractStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ContractStatus }) {
    const meta = CONTRACT_STATUS_META[status];
    const tone = meta.tone === "muted" ? "muted" : meta.tone;
    return <Badge tone={tone as never} dot>{meta.label}</Badge>;
}
