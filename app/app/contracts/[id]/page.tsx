import { ContractWorkspace } from "@/components/contract/ContractWorkspace";

export default function ContractPage({ params }: { params: { id: string } }) {
    return <ContractWorkspace id={params.id} />;
}
