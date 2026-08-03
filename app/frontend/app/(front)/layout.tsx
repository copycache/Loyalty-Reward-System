import { Header } from "@/components/front/header";
import { FrontFooter } from "@/components/front/footer";

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="pt-16 sm:pt-20">{children}</main>
      <FrontFooter />
    </div>
  );
}
