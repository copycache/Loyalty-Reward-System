import Image from "next/image";

export default function StorePage() {
  const sections = [
    {
      id: "department_store",
      title: "Department Store",
      description:
        "Variety. That's the simplest word we can say. The White Cart Department Store sections offers wide-range of products. We have well over thousands of supplies, be it through your everyday home products, office materials, fashion, kids kinds of stuff, and more; our wide range of products can cater to all of that.",
      image: "/images/store/department_store.jpg",
    },
    {
      id: "grocery_store",
      title: "Grocery Store",
      description:
        "The White Cart Grocery Corner enables you to start your sari-sari store. We supply fast selling grocery items in selected areas in the Metro and nearby provinces.",
      image: "/images/store/grocery_store.jpg",
    },
    {
      id: "merchant_hub",
      title: "Merchant Hub",
      description:
        "Filipinos are global citizens. Put them anywhere and they will excel. Resilience, persistence, good work ethic and the desire to succeed not just for himself but for his loved ones make the Filipino shine wherever he goes. And since we are now in the age of globalization, there is no doubt that the time of the Filipinos has come.\n\nZent aims to help Filipinos to market their products Luzon, Visayas, Mindanao and even abroad!\n\nHere are the products from The White Cart Merchants that you will surely love.\n\nNOW ACCEPTING distributors and resellers",
      image: "/images/store/merchant_hub.jpg",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="py-16 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <Image
            src="/images/logo/client-logo.png"
            alt="Logo"
            width={200}
            height={60}
            className="mx-auto mb-6"
          />
        </div>
      </section>

      {/* Store Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl space-y-16">
          {sections.map((section) => (
            <div key={section.id} id={section.id}>
              <h2 className="text-xl font-bold mb-2">{section.title}</h2>
              <hr className="mb-6" />
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.description}
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
