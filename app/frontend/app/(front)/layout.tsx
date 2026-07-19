import { FrontHeader } from "@/components/front-header";
import { FrontFooter } from "@/components/front-footer";

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <FrontHeader />
      <main className="flex-1">{children}</main>
      <FrontFooter />
    </div>
  );
}
