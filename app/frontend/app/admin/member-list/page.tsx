"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export default function MemberListPage() {
  const [users, setUsers] = useState([
    {
      id: "USR001",
      user_name: "user001",
      member_name: "User 001",
      sponsor: "user000",
      placement: "user000",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-09-01 08:00:00",
      kyc_status: "Verified",
      date_placed: "2023-09-01 08:00:00",
      wallet: 1200,
      total_earnings: 1200,
    },
    {
      id: "USR002",
      user_name: "user002",
      member_name: "User 002",
      sponsor: "user001",
      placement: "user001",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-09-02 09:00:00",
      kyc_status: "Pending",
      date_placed: "2023-09-02 09:00:00",
      wallet: 1500,
      total_earnings: 1500,
    },
    {
      id: "USR003",
      user_name: "user003",
      member_name: "User 003",
      sponsor: "user001",
      placement: "user002",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-09-03 10:00:00",
      kyc_status: "Rejected",
      date_placed: "2023-09-03 10:00:00",
      wallet: 2000,
      total_earnings: 2000,
    },
    {
      id: "USR004",
      user_name: "user004",
      member_name: "User 004",
      sponsor: "user002",
      placement: "user002",
      position: "RIGHT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-09-04 11:00:00",
      kyc_status: "Verified",
      date_placed: "2023-09-04 11:00:00",
      wallet: 1100,
      total_earnings: 1100,
    },
    {
      id: "USR005",
      user_name: "user005",
      member_name: "User 005",
      sponsor: "user002",
      placement: "user003",
      position: "LEFT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-09-05 12:00:00",
      kyc_status: "Pending",
      date_placed: "2023-09-05 12:00:00",
      wallet: 1700,
      total_earnings: 1700,
    },
    {
      id: "USR006",
      user_name: "user006",
      member_name: "User 006",
      sponsor: "user003",
      placement: "user003",
      position: "RIGHT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-09-06 08:30:00",
      kyc_status: "Verified",
      date_placed: "2023-09-06 08:30:00",
      wallet: 2200,
      total_earnings: 2200,
    },
    {
      id: "USR007",
      user_name: "user007",
      member_name: "User 007",
      sponsor: "user003",
      placement: "user004",
      position: "LEFT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-09-07 09:45:00",
      kyc_status: "Verified",
      date_placed: "2023-09-07 09:45:00",
      wallet: 3000,
      total_earnings: 3000,
    },
    {
      id: "USR008",
      user_name: "user008",
      member_name: "User 008",
      sponsor: "user004",
      placement: "user004",
      position: "RIGHT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-09-08 10:15:00",
      kyc_status: "Rejected",
      date_placed: "2023-09-08 10:15:00",
      wallet: 900,
      total_earnings: 900,
    },
    {
      id: "USR009",
      user_name: "user009",
      member_name: "User 009",
      sponsor: "user004",
      placement: "user005",
      position: "LEFT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-09-09 11:20:00",
      kyc_status: "Pending",
      date_placed: "2023-09-09 11:20:00",
      wallet: 1600,
      total_earnings: 1600,
    },
    {
      id: "USR010",
      user_name: "user010",
      member_name: "User 010",
      sponsor: "user005",
      placement: "user005",
      position: "RIGHT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-09-10 12:30:00",
      kyc_status: "Verified",
      date_placed: "2023-09-10 12:30:00",
      wallet: 2500,
      total_earnings: 2500,
    },

    {
      id: "USR011",
      user_name: "user011",
      member_name: "User 011",
      sponsor: "user005",
      placement: "user006",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-09-11 08:10:00",
      kyc_status: "Verified",
      date_placed: "2023-09-11 08:10:00",
      wallet: 1300,
      total_earnings: 1300,
    },
    {
      id: "USR012",
      user_name: "user012",
      member_name: "User 012",
      sponsor: "user006",
      placement: "user006",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-09-12 09:25:00",
      kyc_status: "Pending",
      date_placed: "2023-09-12 09:25:00",
      wallet: 1800,
      total_earnings: 1800,
    },
    {
      id: "USR013",
      user_name: "user013",
      member_name: "User 013",
      sponsor: "user006",
      placement: "user007",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-09-13 10:35:00",
      kyc_status: "Verified",
      date_placed: "2023-09-13 10:35:00",
      wallet: 2700,
      total_earnings: 2700,
    },
    {
      id: "USR014",
      user_name: "user014",
      member_name: "User 014",
      sponsor: "user007",
      placement: "user007",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-09-14 11:50:00",
      kyc_status: "Verified",
      date_placed: "2023-09-14 11:50:00",
      wallet: 3200,
      total_earnings: 3200,
    },
    {
      id: "USR015",
      user_name: "user015",
      member_name: "User 015",
      sponsor: "user007",
      placement: "user008",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-09-15 12:05:00",
      kyc_status: "Rejected",
      date_placed: "2023-09-15 12:05:00",
      wallet: 1000,
      total_earnings: 1000,
    },
    {
      id: "USR016",
      user_name: "user016",
      member_name: "User 016",
      sponsor: "user008",
      placement: "user008",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-09-16 08:40:00",
      kyc_status: "Verified",
      date_placed: "2023-09-16 08:40:00",
      wallet: 1900,
      total_earnings: 1900,
    },
    {
      id: "USR017",
      user_name: "user017",
      member_name: "User 017",
      sponsor: "user008",
      placement: "user009",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-09-17 09:55:00",
      kyc_status: "Pending",
      date_placed: "2023-09-17 09:55:00",
      wallet: 2600,
      total_earnings: 2600,
    },
    {
      id: "USR018",
      user_name: "user018",
      member_name: "User 018",
      sponsor: "user009",
      placement: "user009",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-09-18 10:20:00",
      kyc_status: "Verified",
      date_placed: "2023-09-18 10:20:00",
      wallet: 3500,
      total_earnings: 3500,
    },
    {
      id: "USR019",
      user_name: "user019",
      member_name: "User 019",
      sponsor: "user009",
      placement: "user010",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-09-19 11:15:00",
      kyc_status: "Verified",
      date_placed: "2023-09-19 11:15:00",
      wallet: 1400,
      total_earnings: 1400,
    },
    {
      id: "USR020",
      user_name: "user020",
      member_name: "User 020",
      sponsor: "user010",
      placement: "user010",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-09-20 12:45:00",
      kyc_status: "Pending",
      date_placed: "2023-09-20 12:45:00",
      wallet: 2000,
      total_earnings: 2000,
    },

    {
      id: "USR021",
      user_name: "user021",
      member_name: "User 021",
      sponsor: "user010",
      placement: "user011",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-09-21 08:00:00",
      kyc_status: "Verified",
      date_placed: "2023-09-21 08:00:00",
      wallet: 2800,
      total_earnings: 2800,
    },
    {
      id: "USR022",
      user_name: "user022",
      member_name: "User 022",
      sponsor: "user011",
      placement: "user011",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-09-22 09:10:00",
      kyc_status: "Verified",
      date_placed: "2023-09-22 09:10:00",
      wallet: 3600,
      total_earnings: 3600,
    },
    {
      id: "USR023",
      user_name: "user023",
      member_name: "User 023",
      sponsor: "user011",
      placement: "user012",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-09-23 10:20:00",
      kyc_status: "Rejected",
      date_placed: "2023-09-23 10:20:00",
      wallet: 1100,
      total_earnings: 1100,
    },
    {
      id: "USR024",
      user_name: "user024",
      member_name: "User 024",
      sponsor: "user012",
      placement: "user012",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-09-24 11:30:00",
      kyc_status: "Verified",
      date_placed: "2023-09-24 11:30:00",
      wallet: 2100,
      total_earnings: 2100,
    },
    {
      id: "USR025",
      user_name: "user025",
      member_name: "User 025",
      sponsor: "user012",
      placement: "user013",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-09-25 12:40:00",
      kyc_status: "Pending",
      date_placed: "2023-09-25 12:40:00",
      wallet: 2900,
      total_earnings: 2900,
    },

    {
      id: "USR026",
      user_name: "user026",
      member_name: "User 026",
      sponsor: "user013",
      placement: "user013",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-09-26 08:15:00",
      kyc_status: "Verified",
      date_placed: "2023-09-26 08:15:00",
      wallet: 3700,
      total_earnings: 3700,
    },
    {
      id: "USR027",
      user_name: "user027",
      member_name: "User 027",
      sponsor: "user013",
      placement: "user014",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-09-27 09:25:00",
      kyc_status: "Verified",
      date_placed: "2023-09-27 09:25:00",
      wallet: 1500,
      total_earnings: 1500,
    },
    {
      id: "USR028",
      user_name: "user028",
      member_name: "User 028",
      sponsor: "user014",
      placement: "user014",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-09-28 10:35:00",
      kyc_status: "Pending",
      date_placed: "2023-09-28 10:35:00",
      wallet: 2200,
      total_earnings: 2200,
    },
    {
      id: "USR029",
      user_name: "user029",
      member_name: "User 029",
      sponsor: "user014",
      placement: "user015",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-09-29 11:45:00",
      kyc_status: "Verified",
      date_placed: "2023-09-29 11:45:00",
      wallet: 3000,
      total_earnings: 3000,
    },
    {
      id: "USR030",
      user_name: "user030",
      member_name: "User 030",
      sponsor: "user015",
      placement: "user015",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-09-30 12:55:00",
      kyc_status: "Verified",
      date_placed: "2023-09-30 12:55:00",
      wallet: 4000,
      total_earnings: 4000,
    },

    {
      id: "USR031",
      user_name: "user031",
      member_name: "User 031",
      sponsor: "user015",
      placement: "user016",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-10-01 08:05:00",
      kyc_status: "Rejected",
      date_placed: "2023-10-01 08:05:00",
      wallet: 1200,
      total_earnings: 1200,
    },
    {
      id: "USR032",
      user_name: "user032",
      member_name: "User 032",
      sponsor: "user016",
      placement: "user016",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-10-02 09:15:00",
      kyc_status: "Verified",
      date_placed: "2023-10-02 09:15:00",
      wallet: 2300,
      total_earnings: 2300,
    },
    {
      id: "USR033",
      user_name: "user033",
      member_name: "User 033",
      sponsor: "user016",
      placement: "user017",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-10-03 10:25:00",
      kyc_status: "Pending",
      date_placed: "2023-10-03 10:25:00",
      wallet: 3100,
      total_earnings: 3100,
    },
    {
      id: "USR034",
      user_name: "user034",
      member_name: "User 034",
      sponsor: "user017",
      placement: "user017",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-10-04 11:35:00",
      kyc_status: "Verified",
      date_placed: "2023-10-04 11:35:00",
      wallet: 4200,
      total_earnings: 4200,
    },
    {
      id: "USR035",
      user_name: "user035",
      member_name: "User 035",
      sponsor: "user017",
      placement: "user018",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-10-05 12:45:00",
      kyc_status: "Verified",
      date_placed: "2023-10-05 12:45:00",
      wallet: 1400,
      total_earnings: 1400,
    },

    {
      id: "USR036",
      user_name: "user036",
      member_name: "User 036",
      sponsor: "user018",
      placement: "user018",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-10-06 08:20:00",
      kyc_status: "Pending",
      date_placed: "2023-10-06 08:20:00",
      wallet: 2400,
      total_earnings: 2400,
    },
    {
      id: "USR037",
      user_name: "user037",
      member_name: "User 037",
      sponsor: "user018",
      placement: "user019",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-10-07 09:30:00",
      kyc_status: "Verified",
      date_placed: "2023-10-07 09:30:00",
      wallet: 3300,
      total_earnings: 3300,
    },
    {
      id: "USR038",
      user_name: "user038",
      member_name: "User 038",
      sponsor: "user019",
      placement: "user019",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-10-08 10:40:00",
      kyc_status: "Verified",
      date_placed: "2023-10-08 10:40:00",
      wallet: 4500,
      total_earnings: 4500,
    },
    {
      id: "USR039",
      user_name: "user039",
      member_name: "User 039",
      sponsor: "user019",
      placement: "user020",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-10-09 11:50:00",
      kyc_status: "Rejected",
      date_placed: "2023-10-09 11:50:00",
      wallet: 1500,
      total_earnings: 1500,
    },
    {
      id: "USR040",
      user_name: "user040",
      member_name: "User 040",
      sponsor: "user020",
      placement: "user020",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-10-10 12:00:00",
      kyc_status: "Verified",
      date_placed: "2023-10-10 12:00:00",
      wallet: 2600,
      total_earnings: 2600,
    },

    {
      id: "USR041",
      user_name: "user041",
      member_name: "User 041",
      sponsor: "user020",
      placement: "user021",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-10-11 08:10:00",
      kyc_status: "Pending",
      date_placed: "2023-10-11 08:10:00",
      wallet: 3400,
      total_earnings: 3400,
    },
    {
      id: "USR042",
      user_name: "user042",
      member_name: "User 042",
      sponsor: "user021",
      placement: "user021",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-10-12 09:20:00",
      kyc_status: "Verified",
      date_placed: "2023-10-12 09:20:00",
      wallet: 4600,
      total_earnings: 4600,
    },
    {
      id: "USR043",
      user_name: "user043",
      member_name: "User 043",
      sponsor: "user021",
      placement: "user022",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-10-13 10:30:00",
      kyc_status: "Verified",
      date_placed: "2023-10-13 10:30:00",
      wallet: 1600,
      total_earnings: 1600,
    },
    {
      id: "USR044",
      user_name: "user044",
      member_name: "User 044",
      sponsor: "user022",
      placement: "user022",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-10-14 11:40:00",
      kyc_status: "Pending",
      date_placed: "2023-10-14 11:40:00",
      wallet: 2700,
      total_earnings: 2700,
    },
    {
      id: "USR045",
      user_name: "user045",
      member_name: "User 045",
      sponsor: "user022",
      placement: "user023",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-10-15 12:50:00",
      kyc_status: "Verified",
      date_placed: "2023-10-15 12:50:00",
      wallet: 3500,
      total_earnings: 3500,
    },
    {
      id: "USR046",
      user_name: "user046",
      member_name: "User 046",
      sponsor: "user023",
      placement: "user023",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-10-16 08:00:00",
      kyc_status: "Verified",
      date_placed: "2023-10-16 08:00:00",
      wallet: 4800,
      total_earnings: 4800,
    },
    {
      id: "USR047",
      user_name: "user047",
      member_name: "User 047",
      sponsor: "user023",
      placement: "user024",
      position: "LEFT",
      membership: "Bronze",
      type: "PS",
      created_at: "2023-10-17 09:10:00",
      kyc_status: "Rejected",
      date_placed: "2023-10-17 09:10:00",
      wallet: 1700,
      total_earnings: 1700,
    },
    {
      id: "USR048",
      user_name: "user048",
      member_name: "User 048",
      sponsor: "user024",
      placement: "user024",
      position: "RIGHT",
      membership: "Silver",
      type: "PS",
      created_at: "2023-10-18 10:20:00",
      kyc_status: "Verified",
      date_placed: "2023-10-18 10:20:00",
      wallet: 2800,
      total_earnings: 2800,
    },
    {
      id: "USR049",
      user_name: "user049",
      member_name: "User 049",
      sponsor: "user024",
      placement: "user025",
      position: "LEFT",
      membership: "Gold",
      type: "PS",
      created_at: "2023-10-19 11:30:00",
      kyc_status: "Pending",
      date_placed: "2023-10-19 11:30:00",
      wallet: 3600,
      total_earnings: 3600,
    },
    {
      id: "USR050",
      user_name: "user050",
      member_name: "User 050",
      sponsor: "user025",
      placement: "user025",
      position: "RIGHT",
      membership: "Platinum",
      type: "PS",
      created_at: "2023-10-20 12:40:00",
      kyc_status: "Verified",
      date_placed: "2023-10-20 12:40:00",
      wallet: 5000,
      total_earnings: 5000,
    },
  ]);

  const frameworks = [
    "Next.js",
    "SvelteKit",
    "Nuxt.js",
    "Remix",
    "Astro",
  ] as const;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [openPlaceSlot, setOpenPlaceSlot] = useState(false);
  const [openCreateSlot, setOpenCreateSlot] = useState(false);
  const [openSlotLimit, setOpenSlotLimit] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();

    return users.filter(
      (u) =>
        u.user_name.toLowerCase().includes(s) ||
        u.member_name.toLowerCase().includes(s) ||
        u.membership.toLowerCase().includes(s),
    );
  }, [search, users]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div> */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="size-4" />
            </div>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              type="text"
              placeholder="Search users..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Place Slot */}
        <div className="flex flex-wrap items-center gap-2">
          <Sheet open={openPlaceSlot} onOpenChange={setOpenPlaceSlot}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Place Slot
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Place Slot</SheetTitle>
              </SheetHeader>

              <div className="no-scrollbar overflow-y-auto px-4">
                <form>
                  <FieldGroup>
                    <FieldSet>
                      <FieldGroup>
                        <Field>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            placeholder="Enter Owners Username"
                          />
                        </Field>
                        <Field>
                          <Label htmlFor="placement">Placement</Label>
                          <Input id="placement" placeholder="Placement" />
                        </Field>
                        <Field>
                          <Label htmlFor="position">Position</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LEFT">LEFT</SelectItem>
                              <SelectItem value="RIGHT">RIGHT</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </FieldGroup>
                    </FieldSet>
                  </FieldGroup>
                </form>
                <SheetFooter>
                  <Button onClick={() => setOpenPlaceSlot(false)}>
                    Place Slot
                  </Button>
                  <Button variant="outline" type="submit">
                    Auto Position
                  </Button>
                  <SheetClose asChild>
                    <Button variant="destructive">Cancel</Button>
                  </SheetClose>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>

          {/* Create Slot */}
          <Sheet open={openCreateSlot} onOpenChange={setOpenCreateSlot}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Create Slot
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create Slot</SheetTitle>
              </SheetHeader>

              <div className="no-scrollbar overflow-y-auto px-4">
                <form>
                  <FieldGroup>
                    <FieldSet>
                      <FieldGroup>
                        <Field>
                          <Label htmlFor="code">Code</Label>
                          <Input id="code" placeholder="Enter Code" />
                        </Field>
                        <Field>
                          <Label htmlFor="pin">Pin</Label>
                          <Input id="pin" placeholder="Enter Pin" />
                        </Field>
                        <Field>
                          <Label htmlFor="slotOwner">Slot Owner</Label>
                          <Input
                            id="slotOwner"
                            placeholder="Enter Owner Name"
                          />
                        </Field>
                        <Field>
                          <Label htmlFor="sponsor">Sponsor</Label>
                          <Input
                            id="sponsor"
                            placeholder="Enter Sponsor (Username)"
                          />
                        </Field>
                      </FieldGroup>
                    </FieldSet>
                  </FieldGroup>
                </form>
                <SheetFooter>
                  <Button onClick={() => setOpenCreateSlot(false)}>
                    Create Slot
                  </Button>
                  <Button variant="outline" type="submit">
                    Get Code
                  </Button>
                  <SheetClose asChild>
                    <Button variant="destructive">Cancel</Button>
                  </SheetClose>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>

          {/* Slot Limit/Member */}
          <Sheet open={openSlotLimit} onOpenChange={setOpenSlotLimit}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Slot Limit/Member
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Slot Limit/Member</SheetTitle>
              </SheetHeader>

              <div className="no-scrollbar overflow-y-auto px-4">
                <form>
                  <FieldGroup>
                    <FieldSet>
                      <FieldGroup>
                        <Field>
                          <div className="flex gap-2">
                            <Checkbox id="terms" />
                            <Label htmlFor="terms">Update All Slot</Label>
                          </div>
                        </Field>
                        <Field>
                          <Label htmlFor="slotOwner">Slot Owner</Label>
                          <Input
                            id="slotOwner"
                            placeholder="Enter Owner Name"
                          />
                        </Field>
                        <Field>
                          <Label htmlFor="slotLimit">Slot Limit</Label>
                          <Input id="slotLimit" type="number" />
                        </Field>
                      </FieldGroup>
                    </FieldSet>
                  </FieldGroup>
                </form>
                <SheetFooter>
                  <Button onClick={() => setOpenSlotLimit(false)}>
                    Submit
                  </Button>
                  <Button variant="outline" type="submit">
                    Auto Position
                  </Button>
                  <SheetClose asChild>
                    <Button variant="destructive">Cancel</Button>
                  </SheetClose>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="size-4 mr-1" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Enter the details for the new member.
                </DialogDescription>
              </DialogHeader>
              <form>
                <FieldGroup>
                  <FieldSet>
                    <FieldGroup>
                      <Field>
                        <Label htmlFor="slotSponsorUsername">
                          Slot Sponsor Username
                        </Label>
                        <Input
                          id="slotSponsorUsername"
                          placeholder="Enter Sponsor Username"
                        />
                      </Field>
                      <Field>
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="Enter Username" />
                      </Field>
                      <Field>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" placeholder="Enter Email Address" />
                      </Field>
                      <FieldGroup className="grid grid-cols-3">
                        <Field>
                          <FieldLabel htmlFor="firstName">
                            First Name
                          </FieldLabel>
                          <Input
                            id="firstName"
                            placeholder="Enter First Name"
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="mid">Middle Name</FieldLabel>
                          <Input id="mid" placeholder="Enter Middle Name" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                          <Input id="lastName" placeholder="Enter Last Name" />
                        </Field>
                      </FieldGroup>

                      <Field>
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          type="tel"
                          placeholder="+63 (123) 123-4567"
                        />
                      </Field>

                      <Field>
                        <Label htmlFor="countryCurrency">
                          Country / Currency
                        </Label>
                        <Select>
                          <SelectTrigger id="countryCurrency">
                            <SelectValue placeholder="countryCurrency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="philippines">
                              Philippines
                            </SelectItem>
                            <SelectItem value="japan">Japan</SelectItem>
                            <SelectItem value="usa">USA</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter Password"
                        />
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                </FieldGroup>
              </form>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-md border md:min-h-min">
        <Dialog>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Username</TableHead>
                <TableHead className="text-center">Member Name</TableHead>
                <TableHead className="text-center">Sponsor</TableHead>
                <TableHead className="text-center">Placement</TableHead>
                <TableHead className="text-center">Position</TableHead>
                <TableHead className="text-center">Membership</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Date Created</TableHead>
                <TableHead className="text-center">KYC Status</TableHead>
                <TableHead className="text-center">Date Placed</TableHead>
                <TableHead className="text-center">Wallet</TableHead>
                <TableHead className="text-center">Total Earnings</TableHead>
                <TableHead className="text-center" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  {/* <TableCell>{user.id}</TableCell> */}
                  <TableCell className="text-center">
                    {user.user_name}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.member_name}
                  </TableCell>
                  <TableCell className="text-center">{user.sponsor}</TableCell>
                  <TableCell className="text-center">
                    {user.placement}
                  </TableCell>
                  <TableCell className="text-center">{user.position}</TableCell>
                  <TableCell className="text-center">
                    {user.membership}
                  </TableCell>
                  <TableCell className="text-center">{user.type}</TableCell>
                  <TableCell className="text-center">
                    {user.created_at}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        user.kyc_status === "Inactive"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {user.kyc_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.date_placed}
                  </TableCell>
                  <TableCell className="text-center">{user.wallet}</TableCell>
                  <TableCell className="text-center">
                    {user.total_earnings}
                  </TableCell>

                  {/* <TableCell className="w-px">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <DialogTrigger>View</DialogTrigger>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell> */}

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* View */}
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="size-4" />
                          <span>View</span>
                        </Button>
                      </DialogTrigger>

                      {/* Delete */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setUsers((prev) =>
                            prev.filter((u) => u.id !== user.id),
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <span>Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedUser && (
            <DialogContent className="sm:max-w-4xl max-h-sm overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Slot Information</DialogTitle>
              </DialogHeader>

              {selectedUser && (
                <Tabs defaultValue="overview" className="w-full h-full">
                  <TabsList variant="line" className="grid grid-cols-4">
                    <TabsTrigger value="information">Information</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="information">
                    <form>
                      <div className="text-center py-5">
                        <DialogTitle>Slot Information</DialogTitle>
                      </div>
                      <FieldGroup>
                        <FieldSet>
                          <FieldGroup className="grid grid-cols-3">
                            <Field>
                              <FieldLabel htmlFor="username">
                                Username
                              </FieldLabel>
                              <Input
                                id="username"
                                placeholder="Enter Username"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="slotOwner">
                                Slot Owner
                              </FieldLabel>
                              <Input
                                id="slotOwner"
                                placeholder="Administrator"
                                disabled
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="sponsor">Sponsor</FieldLabel>
                              <Input id="sponsor" placeholder="--" disabled />
                            </Field>
                          </FieldGroup>

                          <FieldGroup className="grid grid-cols-3">
                            <Field>
                              <FieldLabel htmlFor="membershipPackage">
                                Membership Package
                              </FieldLabel>
                              <Combobox items={frameworks}>
                                <ComboboxInput placeholder="Membership Package" />
                                <ComboboxContent>
                                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                                  <ComboboxList>
                                    {(item) => (
                                      <ComboboxItem key={item} value={item}>
                                        {item}
                                      </ComboboxItem>
                                    )}
                                  </ComboboxList>
                                </ComboboxContent>
                              </Combobox>
                            </Field>

                            <Field>
                              <FieldLabel htmlFor="slotOwner">
                                Slot Owner
                              </FieldLabel>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="blocked">
                                    Blocked
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>

                            <Field>
                              <FieldLabel htmlFor="emailStatus">
                                Email Status
                              </FieldLabel>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="activated">
                                    Activated
                                  </SelectItem>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                          </FieldGroup>

                          <FieldGroup className="grid grid-cols-3">
                            <Field>
                              <FieldLabel htmlFor="slotOwner">
                                KYC Status
                              </FieldLabel>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="noValidID">
                                    No Valid ID
                                  </SelectItem>
                                  <SelectItem value="verified">
                                    Verified
                                  </SelectItem>
                                  <SelectItem value="rejected">
                                    Rejected
                                  </SelectItem>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>

                            <Field>
                              <FieldLabel htmlFor="storeName">
                                Store Name
                              </FieldLabel>
                              <Input
                                id="storeName"
                                placeholder="Enter Store Name"
                              />
                            </Field>
                          </FieldGroup>
                        </FieldSet>
                      </FieldGroup>

                      <div className="text-center py-5">
                        <DialogTitle>Member Information</DialogTitle>
                      </div>
                      <FieldGroup>
                        <FieldSet>
                          <FieldGroup className="grid grid-cols-3">
                            <Field>
                              <FieldLabel htmlFor="firstName">
                                First Name
                              </FieldLabel>
                              <Input
                                id="firstName"
                                placeholder="Enter First Name"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="middleName">
                                Middle Name
                              </FieldLabel>
                              <Input
                                id="middleName"
                                placeholder="Enter Middle Name"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="lastName">
                                Last Name
                              </FieldLabel>
                              <Input
                                id="lastName"
                                placeholder="Enter Last Name"
                              />
                            </Field>
                          </FieldGroup>

                          <FieldGroup className="grid grid-cols-3">
                            <Field>
                              <FieldLabel htmlFor="email">Email</FieldLabel>
                              <Input id="email" placeholder="Enter Email" />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="ContactNumber">
                                Contact Number
                              </FieldLabel>
                              <Input
                                id="ContactNumber"
                                placeholder="Enter Contact Number"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="countryCurrency">
                                Country/Currency
                              </FieldLabel>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="philippines">
                                    Philippines (PHP)
                                  </SelectItem>
                                  <SelectItem value="japan">
                                    Japan (JPY)
                                  </SelectItem>
                                  <SelectItem value="usa">
                                    USA (USD)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                          </FieldGroup>
                        </FieldSet>
                      </FieldGroup>

                      <div className="text-center py-5">
                        <DialogTitle>Beneficiary Information</DialogTitle>
                      </div>
                      <FieldGroup>
                        <FieldSet>
                          <FieldGroup className="grid grid-cols-3">
                            <Field>
                              <FieldLabel htmlFor="beneficiaryFirstName">
                                Beneficiary First Name
                              </FieldLabel>
                              <Input
                                id="beneficiaryFirstName"
                                placeholder="Enter First Name"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="beneficiaryMiddleName">
                                Beneficiary Middle Name
                              </FieldLabel>
                              <Input
                                id="beneficiaryMiddleName"
                                placeholder="Enter Middle Name"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="beneficiaryLastName">
                                Beneficiary Last Name
                              </FieldLabel>
                              <Input
                                id="beneficiaryLastName"
                                placeholder="Enter Last Name"
                              />
                            </Field>
                          </FieldGroup>

                          <FieldGroup className="grid grid-cols-3">
                            <Field>
                              <FieldLabel htmlFor="contactNumber">Contact Number</FieldLabel>
                              <Input id="contactNumber" placeholder="Enter Contact Number" />
                            </Field>
                          </FieldGroup>
                        </FieldSet>
                      </FieldGroup>
                    </form>
                  </TabsContent>

                  <TabsContent value="details">
                    <form>
                      <div className="text-center py-5">
                        <DialogTitle>Slot Details</DialogTitle>
                      </div>

                      <div className="text-center py-5">
                        <DialogTitle>Member Details</DialogTitle>
                      </div>

                      <div className="text-center py-5">
                        <DialogTitle>Member's Valid ID</DialogTitle>
                      </div>
                      
                    </form>
                  </TabsContent>

                  <TabsContent value="reports">
                    <Card>
                      <CardHeader>
                        <CardTitle>Reports</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        (Add reports here)
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings">
                    <Card>
                      <CardHeader>
                        <CardTitle>Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        (Add settings form here)
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Update Slot Information</Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="itemsPerPage">Rows per page</Label>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(val) => {
              setItemsPerPage(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-5 justify-between items-center">
          <Label>
            Page {currentPage} of {totalPages}
          </Label>
          <div>
            <Pagination>
              <PaginationContent>
                <PaginationFirst onClick={() => setCurrentPage(1)} />
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                />
                <PaginationLast onClick={() => setCurrentPage(totalPages)} />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
