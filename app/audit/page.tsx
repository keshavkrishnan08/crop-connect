import { redirect } from "next/navigation";

/** The self-serve audit was replaced by a meeting request. Old links land on the form. */
export default function AuditPage() {
    redirect("/contact");
}
