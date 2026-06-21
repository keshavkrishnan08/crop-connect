import { createClient } from "@supabase/supabase-js";

// Correct project (the one the schema was applied to): Interview / iszclgghrubxmshllwwc
const URL = "https://iszclgghrubxmshllwwc.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzemNsZ2docnVieG1zaGxsd3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzczMzgsImV4cCI6MjA5NjUxMzMzOH0.Pf5n67hYAehrWo_GmA9nAmPrblD3M58VvZoo2RQgYSw";
console.log("URL:", URL, "| key:", KEY.slice(0, 10) + "...");

const supabase = createClient(URL, KEY);
let fails = 0;
const check = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"} · ${msg}`); };

const email = `sim+${Date.now()}@cropconnect.test`;
const password = "test123456";

const { data: signUp, error: suErr } = await supabase.auth.signUp({ email, password });
check(!suErr, `sign up (${email}) ${suErr ? "-> " + suErr.message : "ok"}`);

if (!signUp?.session) {
    console.log("\nNOTE: no session on signup -> email confirmation is ON in this project.");
    console.log("The schema and RLS still exist; UI sign-in will require email confirm until you disable it in Supabase Auth settings.");
    process.exit(suErr ? 1 : 0);
}

const uid = signUp.user.id;
check(!!uid, `got user id ${uid?.slice(0, 8)}…`);

// profile auto-created by trigger?
const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
check(!!prof, "trigger auto-created a profile row");

// insert own restaurant (RLS: own_insert)
const { error: rErr } = await supabase.from("restaurants").upsert({ user_id: uid, name: "Sim Bistro", location: "Test City", onboarded: true }, { onConflict: "user_id" });
check(!rErr, `insert restaurant ${rErr ? "-> " + rErr.message : "ok"}`);

// insert a sourcing item + delivery + order
const itemId = "s_sim_" + Date.now();
const { error: iErr } = await supabase.from("sourcing_items").insert({ id: itemId, user_id: uid, crop: "rainbow carrots", qty_per_week: 30, price_ceiling: 3, stage: "agreed" });
check(!iErr, `insert sourcing_item ${iErr ? "-> " + iErr.message : "ok"}`);
const { error: dErr } = await supabase.from("deliveries").insert({ id: "dl_sim_" + Date.now(), item_id: itemId, user_id: uid, date: "2026-07-01", qty: 30, status: "scheduled" });
check(!dErr, `insert delivery ${dErr ? "-> " + dErr.message : "ok"}`);
const { error: oErr } = await supabase.from("orders").insert({ id: "o_sim_" + Date.now(), user_id: uid, item_id: itemId, crop: "rainbow carrots", total_cost: 720, status: "agreed" });
check(!oErr, `insert order ${oErr ? "-> " + oErr.message : "ok"}`);

// read back own data
const { data: items } = await supabase.from("sourcing_items").select("*").eq("user_id", uid);
check((items?.length ?? 0) >= 1, `read back own sourcing items (${items?.length})`);

// can read shared farms catalog
const { data: farms } = await supabase.from("farms").select("id");
check((farms?.length ?? 0) >= 6, `read shared farms catalog (${farms?.length})`);

// RLS isolation: a fresh anonymous client (no auth) must NOT see the row
const anon = createClient(URL, KEY);
const { data: leaked } = await anon.from("sourcing_items").select("*").eq("id", itemId);
check((leaked?.length ?? 0) === 0, "RLS blocks unauthenticated read of another account's data");

// cleanup
await supabase.from("sourcing_items").delete().eq("user_id", uid);
await supabase.from("restaurants").delete().eq("user_id", uid);

console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILURES"}`);
process.exit(fails === 0 ? 0 : 1);
