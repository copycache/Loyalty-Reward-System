"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

const formatPath = (path: string) => {
  return path
    .replace("/admin/", "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // console.log(formatPath(pathname));
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <div className="text-lg font-semibold">{formatPath(pathname)}</div>
          </div>
          <div className="fade-bottom absolute w-full backdrop-blur-lg"></div>
          <div className="max-w-container relative mx-auto"></div>
          <div className="flex items-center gap-2 px-4">
            <ModeToggle />
          </div>
        </header>

        <Separator />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
