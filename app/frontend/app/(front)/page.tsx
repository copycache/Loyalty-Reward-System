"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      {/* Logo Section */}
      <section className="grid place-items-center h-screen w-full">
        <div className="bg-[url('/Landing-Page/client-resources/logo/file.gif')] bg-cover bg-center bg-no-repeat h-full w-full flex items-center justify-center">
          <Image
            src="/Landing-Page/client-resources/logo/client-logo.png"
            alt="iQON ELITE"
            width={500}
            height={150}
            priority
          />
        </div>
      </section>

      {/* Hero Section - Revive, Restore, Rejuvenate */}
      <section
        className="w-full py-[150px] px-[100px] md:py-[100px] md:px-[50px] sm:py-[75px] sm:px-[25px] bg-cover bg-center bg-no-repeat bg-fixed text-white"
        style={{
          backgroundImage:
            "url('/Landing-Page/client-resources/banner2BG.jpeg')",
        }}
      >
        <div className="grid grid-cols-[30%_40%_30%] lg:grid-cols-2 md:grid-cols-1 md:text-center justify-between items-center max-w-6xl mx-auto gap-x-8 gap-y-12">
          <div>
            <h1 className="text-5xl font-extrabold mb-4">
              Revive,
              <br />
              Restore,
              <br />
              Rejuvenate
            </h1>
            <p className="text-2xl leading-relaxed">
              Cultivating Healthy Coffee Drinking Habits with iQONCELL Stemcell
              Coff
              <br />
              Your Pathway to an Enriched and Enhanced Lifestyle Experience
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block bg-amber-400 border border-amber-400 text-black py-4 px-12 font-bold rounded-full transition-colors hover:bg-transparent hover:text-amber-400"
            >
              Get Started
            </Link>
          </div>

          {/* image with a hover swap, default image fades out and the hover image fades in */}
          <div className="relative inline-block w-fit group">
            <Image
              src="/Landing-Page/client-resources/STEMCELL COFFEE POUCH.png"
              alt="Coffee Pack"
              width={400}
              height={500}
              className="block w-full h-auto p-10 opacity-100 transition-opacity duration-300 group-hover:opacity-0"
            />
            <Image
              src="/Landing-Page/client-resources/Steam Coffe Poster 2.png"
              alt="Steam Coffee Poster"
              width={400}
              height={500}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100"
            />
          </div>

          <div>
            <p className="text-2xl leading-relaxed">
              Elevate Your Day with StemCell Coffee:
              <br />
              Savor rich flavor and wellness in every cup. This coffee awakens
              your senses and boosts your health, energizing you for daily
              challenges.
            </p>
            <div className="mt-5 flex items-center gap-2.5 text-xl md:justify-center">
              <span className="font-bold text-yellow-400">⭐ 4.9</span> Positive
              reviews
              <Image
                src="/Landing-Page/client-resources/avatar.png"
                alt="User"
                width={42}
                height={42}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="bg-white text-center py-16 px-8">
        <p className="text-black text-2xl font-medium">
          The trustworthiness and integrity of iQON ELITE Corporation to inspire
          new opportunities.
        </p>
        <div className="flex justify-center flex-wrap gap-8 cursor-pointer my-20">
          <Image
            src="/Landing-Page/client-resources/government logo/dti.png"
            alt="DTI"
            width={80}
            height={80}
            className="h-20 w-auto transition-transform hover:scale-110"
          />
          <Image
            src="/Landing-Page/client-resources/government logo/sec.png"
            alt="SEC"
            width={80}
            height={80}
            className="h-20 w-auto transition-transform hover:scale-110"
          />
          <Image
            src="/Landing-Page/client-resources/government logo/fda.png"
            alt="FDA"
            width={80}
            height={80}
            className="h-20 w-auto transition-transform hover:scale-110"
          />
          <Image
            src="/Landing-Page/client-resources/government logo/city of baguio.png"
            alt="City of Baguio"
            width={80}
            height={80}
            className="h-20 w-auto transition-transform hover:scale-110"
          />
          <Image
            src="/Landing-Page/client-resources/government logo/gmp.png"
            alt="GMP"
            width={80}
            height={80}
            className="h-20 w-auto transition-transform hover:scale-110"
          />
          <Image
            src="/Landing-Page/client-resources/government logo/haccp.png"
            alt="HACCP"
            width={80}
            height={80}
            className="h-20 w-auto transition-transform hover:scale-110"
          />
          <Image
            src="/Landing-Page/client-resources/government logo/halal.png"
            alt="Halal"
            width={80}
            height={80}
            className="h-20 w-auto transition-transform hover:scale-110"
          />
        </div>
      </section>

      {/* Product Section */}
      <section
        className="flex flex-wrap justify-center items-center p-24 lg:flex-col lg:text-center lg:p-16 bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage:
            "url('/Landing-Page/client-resources/bg-product-section.jpg')",
        }}
      >
        <div className="max-w-xl">
          <h2 className="text-5xl font-bold mb-10">
            Premium Quality Products at iQON ELITE
          </h2>
          <p className="text-2xl leading-relaxed">
            iQON ELITE: Explore Our Exclusive Range of Premium Products Designed
            to Meet Your Unique Health and Beauty Needs.
          </p>
        </div>
        <div className="flex justify-center gap-8">
          <Image
            src="/Landing-Page/client-resources/capsule.png"
            alt="iQONCELL Capsules"
            width={200}
            height={200}
            className="w-[200px] md:w-[180px] sm:w-[100px] h-auto transition-transform hover:scale-105"
          />
          <Image
            src="/Landing-Page/client-resources/vit c.png"
            alt="Vitamin C Complex"
            width={200}
            height={200}
            className="w-[200px] md:w-[180px] sm:w-[100px] h-auto transition-transform hover:scale-105"
          />
        </div>
      </section>

      {/* Wellness Section with Video */}
      <section className="relative overflow-hidden text-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source
            src="https://vid.cdn-website.com/md/pexels/videos/free-video-3327806-v.mp4"
            type="video/mp4"
          />
        </video>
        <div className="relative z-10 flex items-center justify-center gap-8 py-60 px-16 lg:flex-col lg:py-32">
          <div className="relative flex justify-center group">
            <Image
              src="/Landing-Page/client-resources/product-section-img-1.png"
              alt="Product1"
              width={350}
              height={350}
              className="max-w-[450px] w-full opacity-100 transition-opacity duration-300 group-hover:opacity-0"
            />
            <Image
              src="/Landing-Page/client-resources/product-section-img-2.png"
              alt="Product2"
              width={350}
              height={350}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100"
            />
          </div>
          <div className="bg-white/60 p-8 rounded-xl max-w-2xl lg:text-center">
            <h4 className="text-xl mb-4 font-semibold">
              Easy, safe, and hassle-free.
            </h4>
            <h2 className="text-3xl mb-6 font-bold">
              &quot;Embrace Wellness: Your Journey to a Healthier, Happier You
              Starts Here!&quot;
            </h2>
            <p className="text-lg leading-relaxed">
              &quot;Discover the benefits of wellness as you embark on an
              exciting adventure toward achieving a healthier version of
              yourself!&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Coffee Banner */}
      <section
        className="bg-cover bg-center py-16 px-5 text-white"
        style={{
          backgroundImage:
            "url('/Landing-Page/client-resources/coffeeBG.jpeg')",
        }}
      >
        <div className="flex items-center justify-center gap-10 mx-auto py-2.5 px-10 md:flex-col md:px-12">
          <div className="flex-1 max-w-xl md:max-w-full md:text-center">
            <p
              className="text-3xl font-bold"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
            >
              &quot;Savor your coffee! Each sip energizes.&quot;
            </p>
            <h1
              className="text-5xl md:text-3xl font-bold text-amber-400 my-5 leading-tight"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
            >
              &quot;Enjoy your coffee! Every sip fuels your day and inspires
              creativity.&quot;
            </h1>
            <p className="bg-black/40 p-5 rounded-lg font-medium leading-relaxed">
              Experience the innovative stem cell coffee designed for coffee
              lovers. This unique blend satisfies your caffeine cravings while
              promoting health. Enjoy a flavorful cup that elevates your coffee
              experience!
            </p>
          </div>
          <div className="flex justify-center items-center max-h-[500px] md:max-h-[450px] overflow-hidden rounded-lg flex-1 md:max-w-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full object-cover max-w-[450px] md:max-w-full"
            >
              <source
                src="https://vid.cdn-website.com/md/pexels/videos/20-25-year-old-woman-adult-beautiful-breakfast-7487697-v.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </section>

      {/* Cacao Banner */}
      <section className="bg-white overflow-hidden py-10 px-16 lg:py-16 lg:px-20">
        <div className="flex lg:flex-col gap-8 max-w-6xl mx-auto rounded-[30px] bg-teal-100 p-10">
          <div className="flex-1">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full rounded-2xl object-cover max-h-[500px]"
            >
              <source
                src="https://vid.cdn-website.com/md/pexels/videos/banana-smoothie-beautiful-food-boomerang-chocolate-5107238-v.mp4"
                type="video/mp4"
              />
            </video>
          </div>
          <div className="flex-1">
            <div className="bg-black/70 p-5 rounded-lg mb-5">
              <h1 className="text-white text-4xl lg:text-3xl font-extrabold text-center">
                Indulge in the Richness of Cacao: Pleasure, Unmatched Delight!
              </h1>
            </div>
            <p className="text-lg font-semibold text-zinc-800 leading-relaxed text-justify lg:text-left px-2.5">
              &quot;Immerse yourself in the luxurious essence of rich, velvety
              cacao, where every indulgent bite promises an unparalleled
              experience of pure joy and delight, showcasing a flavor and
              texture that is truly extraordinary and unmatched in its exquisite
              allure, inviting you to savor the enchanting pleasures that only
              the finest chocolate can offer!&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-black text-white py-16 px-8 text-center">
        <div className="uppercase text-sm font-bold text-amber-400 tracking-wide mb-2.5">
          Testimonials
        </div>
        <h2 className="text-3xl font-bold mb-2.5">
          People all over the world <br />
          <span className="text-4xl">Trust iQON ELITE Corporation</span>
        </h2>
        <div className="flex items-center justify-center gap-2.5 my-4 mb-10">
          <span className="rounded-full p-1.5">
            <img
              src="https://irp.cdn-website.com/md/dmtmpl/6357a8f4-9ef0-4669-ab9e-aaca72a3af93/dms3rep/multi/rating_icon.svg"
              alt=""
              width={30}
              height={30}
            />
          </span>
          <span className="text-base">Rated 4.8/5 by +1000 users</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {/* just repeating the same card markup 3 times, could turn this into a list later */}
          <div className="flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-[370px] text-left transition-transform hover:-translate-y-1.5">
            <div className="mb-4">
              <img
                src="https://irp.cdn-website.com/md/dmtmpl/6357a8f4-9ef0-4669-ab9e-aaca72a3af93/dms3rep/multi/rating_stars.svg"
                alt=""
                className="max-w-[110px] h-auto"
              />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              &quot;Explore our top-quality products that offer the excellence
              you can trust!&quot;
            </h3>
            <p className="text-xl mb-5">
              &quot;Explore our range of products that you can genuinely trust,
              ensuring top-notch quality and dependable reliability to fulfill
              all of your needs and expectations!&quot;
            </p>
            <div>
              <strong className="font-bold">Sarah W.</strong>
              <br />
              <small className="text-zinc-400"></small>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-[370px] text-left transition-transform hover:-translate-y-1.5">
            <div className="mb-4">
              <img
                src="https://irp.cdn-website.com/md/dmtmpl/6357a8f4-9ef0-4669-ab9e-aaca72a3af93/dms3rep/multi/rating_stars.svg"
                alt=""
                className="max-w-[110px] h-auto"
              />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              &quot;Shopping Made Simple: Enjoy a Hassle-Free Experience Every
              Time!&quot;
            </h3>
            <p className="text-xl mb-5">
              &quot;Experience the ultimate convenience in shopping, offering
              effortless choices that perfectly fit your busy lifestyle!&quot;
            </p>
            <div>
              <strong className="font-bold">Michael B.</strong>
              <br />
              <small className="text-zinc-400"></small>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-[370px] text-left transition-transform hover:-translate-y-1.5">
            <div className="mb-4">
              <img
                src="https://irp.cdn-website.com/md/dmtmpl/6357a8f4-9ef0-4669-ab9e-aaca72a3af93/dms3rep/multi/rating_stars.svg"
                alt=""
                className="max-w-[110px] h-auto"
              />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              &quot;Top Tier Products: Unmatched Quality and Superior
              Performance!&quot;
            </h3>
            <p className="text-xl mb-5">
              &quot;Discover our top tier products, showcasing unmatched quality
              and superior performance that sets them apart from the
              competition!&quot;
            </p>
            <div>
              <strong className="font-bold">Daniel S.</strong>
              <br />
              <small className="text-zinc-400"></small>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
