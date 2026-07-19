"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Banner {
  id: number;
  thumbnail: string;
}

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    apiPost<Banner[]>("/api/load_banner", {})
      .then(setBanners)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => setCurrentIndex(index);

  return (
    <main>
      {/* Logo Section */}
      <section className="py-16 bg-white flex items-center justify-center">
        <Image
          src="/images/logo/client-logo.png"
          alt="Domus Naturae"
          width={280}
          height={85}
          className="mx-auto"
          priority
        />
      </section>

      {/* Banner Carousel */}
      {banners.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="relative overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {banners.map((banner, idx) => (
                <div key={idx} className="w-full shrink-0">
                  <img
                    src={banner.thumbnail}
                    alt="Banner"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx === currentIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Revive, Restore, Rejuvenate */}
      <section className="py-16 md:py-24 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Revive,<br />Restore,<br />Rejuvenate
              </h1>
              <p className="text-muted-foreground mb-6">
                Cultivating Healthy Coffee Drinking Habits with iQONCELL Stemcell Coffee
                <br />
                Your Pathway to an Enriched and Enhanced Lifestyle Experience
              </p>
              <Button asChild size="lg">
                <Link href="/member/login">Get Started</Link>
              </Button>
            </div>

            {/* Center Image */}
            <div className="flex justify-center group relative">
              <Image
                src="/images/stemcell-coffee-pouch.png"
                alt="StemCell Coffee"
                width={400}
                height={500}
                className="object-contain transition-opacity duration-300 group-hover:opacity-0"
              />
              <Image
                src="/images/steam-coffee-poster-2.png"
                alt="Steam Coffee Poster"
                width={400}
                height={500}
                className="object-contain absolute inset-0 mx-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>

            {/* Right Content */}
            <div className="text-center md:text-right">
              <p className="text-muted-foreground mb-4">
                Elevate Your Day with StemCell Coffee:<br />
                Savor rich flavor and wellness in every cup. This coffee awakens your senses
                and boosts your health, energizing you for daily challenges.
              </p>
              <div className="flex items-center justify-center md:justify-end gap-2 mt-4">
                <span className="text-yellow-500 font-semibold flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> 4.9
                </span>
                <span className="text-sm text-muted-foreground">Positive reviews</span>
                <Image
                  src="/images/avatar.png"
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            The trustworthiness and integrity of Domus Naturae to inspire new opportunities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { src: "/images/government-logo/dti.png", alt: "DTI" },
              { src: "/images/government-logo/sec.png", alt: "SEC" },
              { src: "/images/government-logo/fda.png", alt: "FDA" },
              { src: "/images/government-logo/city-of-baguio.png", alt: "City of Baguio" },
              { src: "/images/government-logo/gmp.png", alt: "GMP" },
              { src: "/images/government-logo/haccp.png", alt: "HACCP" },
              { src: "/images/government-logo/halal.png", alt: "Halal" },
            ].map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={80}
                height={80}
                className="object-contain h-16 w-auto"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-16 bg-zinc-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Premium Quality Products at iQON ELITE
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            iQON ELITE: Explore Our Exclusive Range of Premium Products Designed to Meet
            Your Unique Health and Beauty Needs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Image
              src="/images/capsule.png"
              alt="IQONCELL Capsules"
              width={300}
              height={300}
              className="object-contain"
            />
            <Image
              src="/images/vit-c.png"
              alt="Vitamin C Complex"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Wellness Section with Video */}
      <section className="relative py-20 overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source
            src="https://vid.cdn-website.com/md/pexels/videos/free-video-3327806-v.mp4"
            type="video/mp4"
          />
        </video>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center group relative">
              <Image
                src="/images/product-section-img-1.png"
                alt="Product"
                width={350}
                height={350}
                className="object-contain transition-opacity duration-300 group-hover:opacity-0"
              />
              <Image
                src="/images/product-section-img-2.png"
                alt="Product Hover"
                width={350}
                height={350}
                className="object-contain absolute inset-0 mx-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>
            <div className="text-white text-center md:text-left">
              <h4 className="text-lg mb-2">Easy, safe, and hassle-free.</h4>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                &quot;Embrace Wellness: Your Journey to a Healthier, Happier You Starts Here!&quot;
              </h2>
              <p className="text-white/80">
                &quot;Discover the benefits of wellness as you embark on an exciting adventure
                toward achieving a healthier version of yourself!&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coffee Banner */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground italic mb-4">
                &quot;Savor your coffee! Each sip energizes.&quot;
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                &quot;Enjoy your coffee! Every sip fuels your day and inspires creativity.&quot;
              </h2>
              <p className="text-muted-foreground">
                Experience the innovative stem cell coffee designed for coffee lovers.
                This unique blend satisfies your caffeine cravings while promoting health.
                Enjoy a flavorful cup that elevates your coffee experience!
              </p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source
                  src="https://vid.cdn-website.com/md/pexels/videos/20-25-year-old-woman-adult-beautiful-breakfast-7487697-v.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Cacao Banner */}
      <section className="py-16 bg-zinc-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source
                  src="https://vid.cdn-website.com/md/pexels/videos/banana-smoothie-beautiful-food-boomerang-chocolate-5107238-v.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Indulge in the Richness of Cacao: Pleasure, Unmatched Delight!
              </h2>
              <p className="text-muted-foreground">
                &quot;Immerse yourself in the luxurious essence of rich, velvety cacao, where
                every indulgent bite promises an unparalleled experience of pure joy and delight,
                showcasing a flavor and texture that is truly extraordinary and unmatched in its
                exquisite allure, inviting you to savor the enchanting pleasures that only the
                finest chocolate can offer!&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
            Testimonials
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            People all over the world{" "}
            <span className="text-primary">Trust Domus Naturae</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-10">
            <img
              src="https://irp.cdn-website.com/md/dmtmpl/6357a8f4-9ef0-4669-ab9e-aaca72a3af93/dms3rep/multi/rating_icon.svg"
              alt="Rating"
              className="h-8 w-8"
            />
            <span className="text-muted-foreground">Rated 4.8/5 by +1000 users</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "\"Explore our top-quality products that offer the excellence you can trust!\"",
                text: "\"Explore our range of products that you can genuinely trust, ensuring top-notch quality and dependable reliability to fulfill all of your needs and expectations!\"",
                author: "Sarah W.",
              },
              {
                title: "\"Shopping Made Simple: Enjoy a Hassle-Free Experience Every Time!\"",
                text: "\"Experience the ultimate convenience in shopping, offering effortless choices that perfectly fit your busy lifestyle!\"",
                author: "Michael B.",
              },
              {
                title: "\"Top Tier Products: Unmatched Quality and Superior Performance!\"",
                text: "\"Discover our top tier products, showcasing unmatched quality and superior performance that sets them apart from the competition!\"",
                author: "Daniel S.",
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="text-left">
                <CardContent className="pt-6">
                  <img
                    src="https://irp.cdn-website.com/md/dmtmpl/6357a8f4-9ef0-4669-ab9e-aaca72a3af93/dms3rep/multi/rating_stars.svg"
                    alt="5 stars"
                    className="h-5 mb-4"
                  />
                  <h3 className="font-semibold mb-3 text-sm">{testimonial.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{testimonial.text}</p>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
