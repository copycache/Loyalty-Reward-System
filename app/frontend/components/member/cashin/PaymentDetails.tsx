import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentDetailsProps {
    method: any;
}

export function PaymentDetails({ method }: PaymentDetailsProps) {
    if (!method) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <Card className="bg-muted/50 border-dashed">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                    Payment Instructions
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
                <div className="font-semibold text-lg">{method.name || method.cash_in_method_name}</div>
                
                {/* Account Number or Details */}
                {(method.account_number || method.cash_in_method_account_number) && (
                    <div className="flex items-center justify-between p-2 bg-background rounded border">
                        <div>
                            <p className="text-xs text-muted-foreground">Account Number</p>
                            <p className="font-mono font-medium">{method.account_number || method.cash_in_method_account_number}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(method.account_number || method.cash_in_method_account_number)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Account Name */}
                {(method.account_name || method.cash_in_method_account_name) && (
                     <div className="flex items-center justify-between p-2 bg-background rounded border">
                        <div>
                            <p className="text-xs text-muted-foreground">Account Name</p>
                            <p className="font-medium">{method.account_name || method.cash_in_method_account_name}</p>
                        </div>
                    </div>
                )}

                 {/* Description / Notes */}
                 {(method.description || method.cash_in_method_description) && (
                    <div className="text-muted-foreground whitespace-pre-line">
                        {method.description || method.cash_in_method_description}
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
