import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
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
