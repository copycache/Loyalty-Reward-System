import Image from "next/image";

export default function AboutPage() {
  return (
    <div>
      {/* Title */}
      <section className="py-16 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">
            <span>ABOUT US</span>
          </h1>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-zinc-900 text-white rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">VISION</h2>
              <p className="text-white/80 leading-relaxed">
                We envision a world where indigenous wisdom meets modern wellness — where every
                home enjoys healthier lives, every farmer works with dignity, and every community
                flourishes in harmony with nature. At the heart of this vision is our promise: to
                create world-class products that stand the test of time — crafted with care,
                trusted by generations, and rooted in authenticity.
              </p>
            </div>
            {/* Mission */}
            <div className="bg-zinc-900 text-white rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">MISSION</h2>
              <p className="text-white/80 leading-relaxed">
                Our mission is simple yet powerful: to uplift indigenous farmers by creating
                sustainable livelihoods, while delivering natural solutions that restore
                confidence, beauty, and wellness to every customer we touch. When farmers thrive,
                communities grow. When customers heal, lives transform. This is the cycle of
                Domus Naturae.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="container mx-auto max-w-5xl" />

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <span>Our Story</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Domus Naturae began with a conviction: nature has the power to heal people — and
                uplift communities.
              </p>
              <p>
                In 2014, we planted our first seeds in the highlands of Abra. By 2018, after
                years of nurturing rosemary, lemongrass, pine, and other botanicals, we unlocked
                the incredible potential of our own farm-to-bottle extracts. What started as
                farming soon grew into a purpose — to bring natural healing from the soil
                straight into your hands.
              </p>
              <p>
                Today, more than 200,000 people trust Domus Naturae, with over 17,000 heartfelt
                testimonials pouring in — stories of regrowth, renewal, and transformation that
                inspire us every single day.
              </p>
              <p>
                But beyond oils and extracts, every bottle carries a deeper story: the hands of
                our farmers, the hopes of their families, and the belief that natural wellness
                should be within reach for all. This isn&apos;t just a business — it&apos;s a
                mission, a movement, and a cycle of care that sustains both people and planet.
              </p>
            </div>
            <div className="text-center">
              <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden mb-4">
                <Image
                  src="/images/logo/founder.png"
                  alt="Founder"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-semibold">
                Charles B. Herrero
                <br />
                <span className="text-sm text-muted-foreground font-normal">
                  Founder of Domus Naturae
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="container mx-auto max-w-5xl" />

      {/* Our Community */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <span>Our Community</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src="/images/logo/mtbaruyen.jpg"
                alt="Community"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Domus Naturae is more than a brand — it&apos;s a growing circle of
                transformation.
              </p>
              <p>
                For farmers: it&apos;s fair livelihood, dignity in work, and pride in preserving
                indigenous traditions.
              </p>
              <p>
                For customers: it&apos;s real results, renewed confidence, and healing that goes
                beyond the surface.
              </p>
              <p>
                Together, we are rewriting what it means to live naturally. Every purchase
                sustains a farmer. Every routine supports healing. Every story inspires change.
              </p>
              <p>
                When you choose Domus Naturae, you don&apos;t just use a product — you become
                part of a movement to live better, live naturally, and uplift lives.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
