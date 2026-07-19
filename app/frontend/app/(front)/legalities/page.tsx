"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LegalitiesPage() {
  const [birIndex, setBirIndex] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const prevBIR = () => setBirIndex((prev) => (prev === 0 ? 1 : 0));
  const nextBIR = () => setBirIndex((prev) => (prev === 1 ? 0 : 1));

  return (
    <div>
      <section className="py-16 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">LEGALITIES</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl space-y-16">
          {/* SEC Certificate */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl font-bold mb-4">SEC Certification</h2>
              <p className="text-muted-foreground leading-relaxed">
                Domus Naturae is officially registered with the Securities and Exchange
                Commission (SEC). This confirms our legitimacy and dedication to transparency,
                ensuring trust for all our clients and partners.
              </p>
            </div>
            <div
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setModalImage("/images/certificates/SEC.jpg")}
            >
              <Image
                src="/images/certificates/SEC.jpg"
                alt="SEC Certificate"
                width={500}
                height={700}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* BIR Certificate */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl font-bold mb-4">BIR Certificate</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our BIR Certificate of Registration reflects our commitment to fulfill tax
                obligations and regulatory transparency as a duly recognized taxpayer under the
                Bureau of Internal Revenue.
              </p>
            </div>
            <div className="relative group">
              <div className="overflow-hidden rounded-lg shadow-md">
                <div
                  className="flex transition-transform duration-500"
                  style={{ transform: `translateX(-${birIndex * 100}%)` }}
                >
                  <div className="w-full shrink-0">
                    <Image
                      src="/images/certificates/BIR_CERTIFICATE_1.png"
                      alt="BIR Certificate Page 1"
                      width={500}
                      height={700}
                      className="w-full h-auto cursor-pointer"
                      onClick={() =>
                        setModalImage("/images/certificates/BIR_CERTIFICATE_1.png")
                      }
                    />
                  </div>
                  <div className="w-full shrink-0">
                    <Image
                      src="/images/certificates/BIR_CERTIFICATE_2.png"
                      alt="BIR Certificate Page 2"
                      width={500}
                      height={700}
                      className="w-full h-auto cursor-pointer"
                      onClick={() =>
                        setModalImage("/images/certificates/BIR_CERTIFICATE_2.png")
                      }
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80"
                onClick={prevBIR}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80"
                onClick={nextBIR}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Business Permit */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl font-bold mb-4">Business Permit</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Business Permit granted to Domus Naturae affirms our compliance with local
                business regulations, allowing us to operate legitimately and responsibly in our
                community.
              </p>
            </div>
            <div
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setModalImage("/images/certificates/BUSINESS_PERMIT.png")}
            >
              <Image
                src="/images/certificates/BUSINESS_PERMIT.png"
                alt="Business Permit"
                width={500}
                height={700}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={!!modalImage} onOpenChange={() => setModalImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogTitle className="sr-only">Certificate Preview</DialogTitle>
          {modalImage && (
            <Image
              src={modalImage}
              alt="Zoomed Certificate"
              width={800}
              height={1100}
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
