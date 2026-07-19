"use client";

import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const POLICIES: Record<string, { title: string; content: React.ReactNode }> = {
  shipping: {
    title: "Shipping & Returns Policy",
    content: (
      <div className="space-y-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping Information</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>We ship nationwide in the Philippines via standard courier services.</li>
                <li>Flat rate shipping fee of ₱150 applies to all orders.</li>
                <li>Orders are processed within 1-3 business days.</li>
                <li>Delivery typically takes 3-7 business days depending on location.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>Returns & Refunds</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>Products may be returned within 7 days of receipt if unopened and in original packaging.</li>
                <li>Defective products will be replaced at no additional cost.</li>
                <li>Refunds are processed within 5-10 business days after approval.</li>
                <li>Please contact our support team for return authorization.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="tos">
            <AccordionTrigger>Terms of Service</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                By using our services, you agree to our terms and conditions. We reserve
                the right to modify our policies at any time. Please review our terms
                regularly.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    ),
  },
  faq: {
    title: "Frequently Asked Questions",
    content: (
      <Accordion type="single" collapsible>
        <AccordionItem value="q1">
          <AccordionTrigger>How do I become a member?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              Simply purchase a starter pack for ₱2,000 and choose any 4 bottles. You&apos;ll
              automatically be enrolled in our rewards program.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q2">
          <AccordionTrigger>Are there monthly fees?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              No. There are absolutely no monthly fees. You pay once and earn for life.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q3">
          <AccordionTrigger>How does the rewards system work?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              Our 10-level rewards system pays you commissions when you refer others. Simply share
              your referral link and earn from every purchase in your network.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q4">
          <AccordionTrigger>What products do you offer?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              We offer 100% organic wellness products including Haircare Mist, Skincare Mist,
              and Wellness Extract.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
};

export default function PoliciesPage() {
  const params = useParams();
  const policyKey = params.policy as string;
  const policy = POLICIES[policyKey];

  if (!policy) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Policy Not Found</h1>
        <p className="text-muted-foreground">The requested policy page does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{policy.title}</h1>
      {policy.content}
    </div>
  );
}
