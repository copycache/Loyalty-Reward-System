import Image from "next/image";

export default function MembershipPage() {
  const packages = [
    "/images/package/iqon enroller bonus packes icon 1.png",
    "/images/package/iqon enroller bonus packes icon 2.png",
    "/images/package/iqon enroller bonus packes icon 3.png",
    "/images/package/iqon enroller bonus packes icon 4.png",
    "/images/package/iqon enroller bonus packes icon 5.png",
  ];

  return (
    <div>
      {/* Hero */}
      <section className="py-16 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">Membership</h1>
        </div>
      </section>

      {/* Desktop Layout */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Desktop: 2 columns */}
          <div className="hidden md:grid grid-cols-2 gap-6">
            <div className="space-y-6">
              {[packages[0], packages[2], packages[4]].map((src, idx) => (
                <Image
                  key={idx}
                  src={src}
                  alt={`Package ${idx * 2 + 1}`}
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
            <div className="space-y-6">
              {[packages[1], packages[3]].map((src, idx) => (
                <Image
                  key={idx}
                  src={src}
                  alt={`Package ${idx * 2 + 2}`}
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Mobile: single column */}
          <div className="md:hidden space-y-6">
            {packages.map((src, idx) => (
              <Image
                key={idx}
                src={src}
                alt={`Package ${idx + 1}`}
                width={600}
                height={400}
                className="w-full h-auto rounded-lg"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
