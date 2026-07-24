"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface SlotData {
  slot_id: number;
  slot_no: string;
  name: string;
  email: string;
  slot_sponsor_no: string;
  membership_name: string;
  slot_status: string;
  wallet: string | number;
  slot_date_created: string;
}

interface Props {
  loading: boolean;
  members: SlotData[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (member: SlotData) => void;
}

function KycBadge({ status }: { status: number }) {
  if (status === 1)
    return <Badge className="bg-green-100 text-green-800">Verified</Badge>;

  if (status === 2)
    return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;

  return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

export default function MembersTable({
  loading,
  members,
  page,
  totalPages,
  onPageChange,
  onView,
}: Props) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Member Name</TableHead>
              <TableHead>Sponsor</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Total Earnings</TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-10 text-muted-foreground"
                >
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => (
                <TableRow key={m.slot_id}>
                  <TableCell>{m.slot_no}</TableCell>

                  <TableCell>{m.name}</TableCell>

                  <TableCell>{m.slot_sponsor_no || "—"}</TableCell>

                  <TableCell>{m.slot_sponsor_no || "—"}</TableCell>

                  <TableCell>{m.slot_sponsor_no || "—"}</TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {m.membership_name}
                    </Badge>
                  </TableCell>

                  <TableCell>{m.slot_sponsor_no || "—"}</TableCell>

                  <TableCell>{m.slot_date_created}</TableCell>

                  <TableCell>
                    <KycBadge status={Number(m.slot_status)} />
                  </TableCell>

                  <TableCell>{m.wallet}</TableCell>

                  <TableCell>{m.slot_date_created}</TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(m)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p>
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}