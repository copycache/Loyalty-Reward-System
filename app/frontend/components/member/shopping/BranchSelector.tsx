import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2 } from "lucide-react";

interface BranchSelectorProps {
    onBranchChange: (branchId: string) => void;
    selectedBranchId?: string;
}

export function BranchSelector({ onBranchChange, selectedBranchId }: BranchSelectorProps) {
    const { token } = useAuthStore();
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const fetchBranches = async () => {
            try {
                const res = await apiPost("/api/getbranch_ecom", {}, token);
                // Legacy expects array response
                const data = res?.data || res || [];
                if (Array.isArray(data)) {
                    setBranches(data);
                    // Select first branch if none selected and check localStorage
                    if (!selectedBranchId && data.length > 0) {
                         const saved = localStorage.getItem("member_branch_id");
                         const defaultBranch = saved || String(data[0].branch_id || data[0].id);
                         onBranchChange(defaultBranch);
                    }
                }
            } catch (e) {
                console.error("Failed to load branches", e);
            }
            setLoading(false);
        };
        fetchBranches();
    }, [token]);

    if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

    if (branches.length === 0) return null;

    return (
        <div className="w-[200px]">
             <Select 
                value={selectedBranchId || ""} 
                onValueChange={(val) => {
                    localStorage.setItem("member_branch_id", val);
                    onBranchChange(val);
                }}
            >
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                    {branches.map((b: any) => (
                         <SelectItem key={b.branch_id || b.id} value={String(b.branch_id || b.id)}>
                             {b.branch_name || b.name}
                         </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
