"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { api } from "@/lib/api";

const POPULAR_CATEGORIES = [
  { name: "Cake Shop", hindi: "प्रसिद्ध उत्पाद", img: "/illustrations/cat_cake_shop.png" },
  { name: "Parlour", hindi: "प्रसिद्ध उत्पाद", img: "/illustrations/cat_parlour.png" },
  { name: "Tailoring", hindi: "प्रसिद्ध उत्पाद", img: "/illustrations/cat_tailoring.png" },
  { name: "Decorator", hindi: "प्रसिद्ध उत्पाद", img: "/illustrations/cat_decorator.png" },
  { name: "Furniture", hindi: "प्रसिद्ध उत्पाद", img: "/illustrations/cat_furniture.png" },
  { name: "Clothes", hindi: "प्रसिद्ध उत्पाद", img: "/illustrations/cat_clothes.png" },
  { name: "Stationary", hindi: "प्रसिद्ध उत्पाद", img: "/illustrations/cat_stationary.png" },
  { name: "Bangles", hindi: "प्रसिद्ध उत्पाद", img: "/illustrations/cat_bangles.png" },
];

const POPULAR_PRODUCTS = [
  { name: "Vermi compost", img: "/illustrations/prod_vermi.png" },
  { name: "Chocolate Cake", img: "/illustrations/prod_chocolate_cake.png" },
  { name: "Udid Papad", img: "/illustrations/prod_papad.png" },
  { name: "Ladies Kurti", img: "/illustrations/prod_kurti.png" },
  { name: "Soya Coffee", img: "/illustrations/prod_coffee.png" },
  { name: "Flex Seeds", img: "/illustrations/prod_flax.png" },
  { name: "Mehendi", img: "/illustrations/prod_mehendi.png" },
  { name: "HandBags", img: "/illustrations/prod_handbags.png" },
];

const BUSINESS_TYPES = [
  { icon: "🏪", label: "Kirana Store" },
  { icon: "🍬", label: "Halwai" },
  { icon: "✂️", label: "Tailor" },
  { icon: "💈", label: "Barber" },
  { icon: "🌸", label: "Florist" },
  { icon: "🔧", label: "Mechanic" },
  { icon: "🥛", label: "Dairy" },
  { icon: "📚", label: "Stationery" },
  { icon: "🎨", label: "Artist" },
  { icon: "🌾", label: "Farmer" },
  { icon: "💍", label: "Jeweller" },
  { icon: "🧵", label: "Weaver" },
  { icon: "🍞", label: "Bakery" },
  { icon: "🏺", label: "Potter" },
  { icon: "🪑", label: "Carpenter" },
  { icon: "🌿", label: "Herbalist" },
];

const STATS = [
  { value: "12,000+", label: "Businesses Listed" },
  { value: "200+", label: "Towns Covered" },
  { value: "28", label: "States" },
];

const STORY_CARDS = [
  {
    title: "Your Local Bazaar, Online",
    subtitle: "आपकी दुकान, ऑनलाइन",
    desc: "From the smallest kirana to the finest craftsman — every local business deserves to be found.",
    img: "/illustrations/story_bazaar.png",
    accentColor: "#f28627",
  },
  {
    title: "Connect Directly",
    subtitle: "सीधे जुड़ें",
    desc: "No middlemen. Customers reach you directly — on call or WhatsApp, the way India actually works.",
    img: "/illustrations/story_connect.png",
    accentColor: "#22c55e",
  },
  {
    title: "Support Local, Grow Local",
    subtitle: "स्थानीय को बढ़ावा दें",
    desc: "Every search on DeshKhoj supports a real family, a real dream, a real Bharat.",
    img: "/illustrations/story_growth.png",
    accentColor: "#3b82f6",
  },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState({ businesses: 0, towns: 0, states: 0 });

  useEffect(() => {
    api.businesses.getStats()
      .then((res: any) => {
        setCounts({
          businesses: res.data.totalBusinesses,
          towns: res.data.towns,
          states: res.data.states
        });
      })
      .catch(console.error);
  }, []);

  const STATS = [
    { value: `${counts.businesses.toLocaleString()}+`, label: "Businesses Listed" },
    { value: `${counts.towns.toLocaleString()}+`, label: "Towns Covered" },
    { value: `${counts.states.toLocaleString()}`, label: "States" },
  ];

  const handleRedirect = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <div className="flex flex-col gap-0 pb-24">

      {/* ── HERO ── */}
      <section className="relative min-h-[620px] flex items-center overflow-hidden pt-20 pb-20">
        {/* Background Image with Balanced Shadow Overlays */}
        <div className="absolute inset-0 z-0 bg-zinc-950/20">
          <Image
            src="/illustrations/hero_bazaar_hd.png"
            alt="DeshKhoj Hero Background"
            fill
            className="object-cover object-center opacity-85 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6 z-10 text-center">
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Bharat's Local Business Directory — अब हिंदी में भी
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-black tracking-tighter text-white sm:text-5xl md:text-6xl leading-tight drop-shadow-lg">
              Desh की <span className="text-primary">Soch</span>,{" "}
              Bharat की <span className="text-accent">Khoj</span>
            </h1>
            <p className="mt-6 text-xl font-bold text-white leading-tight sm:text-2xl md:text-3xl drop-shadow-md shadow-black max-w-4xl mx-auto">
              Discover the real Bharat — its craftsmen, its shopkeepers, its farmers and makers.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 mx-auto max-w-xl"
          >
            <div className="flex items-center rounded-full bg-white shadow-2xl shadow-black/30 overflow-hidden">
              <Search className="ml-5 h-5 w-5 flex-shrink-0 text-foreground/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search businesses, products, services..."
                className="flex-1 bg-transparent px-4 py-4 text-sm text-foreground placeholder:text-foreground/40 outline-none"
              />
              <button
                onClick={handleSearch}
                className="m-1.5 rounded-full bg-primary px-6 py-3 text-sm font-black text-white transition-all hover:bg-primary-hover active:scale-95"
              >
                Search
              </button>
            </div>
            <p className="mt-3 text-sm font-medium text-white/80">
              Try: Cake Shop · Tailor · Kirana · Halwai · Parlour
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <button
              onClick={() => router.push("/search")}
              className="group flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/20"
            >
              Browse All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => router.push("/register")}
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover"
            >
              List your Business →
            </button>
          </motion.div>

          {/* Stat Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4"
          >
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-4xl font-black text-primary drop-shadow-lg sm:text-5xl md:text-6xl">{stat.value}</span>
                <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white sm:text-[16px] md:text-[18px] opacity-90">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SCROLLING BUSINESS MARQUEE ── */}
      <section className="overflow-hidden border-y border-card-border bg-white py-5">
        <div className="marquee-track flex gap-8">
          {[...BUSINESS_TYPES, ...BUSINESS_TYPES].map((biz, i) => (
            <div 
              key={i} 
              onClick={() => handleRedirect(biz.label)}
              className="flex flex-shrink-0 items-center gap-2 text-sm font-bold text-foreground/70 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="text-xl">{biz.icon}</span>
              <span>{biz.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY DESHKHOJ — Immersive Image Grid ── */}
      <section className="container mx-auto px-4 py-20 md:px-6">
        <div className="mb-14 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-2">हमारी कहानी</p>
          <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
            Why <span className="text-primary">DeshKhoj</span>?
          </h2>
          <p className="mt-4 text-base font-medium text-foreground/70 max-w-xl mx-auto">
            We exist to connect real Bharat — its makers, its markets, its stories.
          </p>
        </div>

        {/* Image-first card grid — each card has its own unique illustration */}
        <div className="grid grid-cols-1 md:grid-cols-3 overflow-hidden rounded-3xl shadow-2xl">
          {STORY_CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group overflow-hidden"
              style={{ minHeight: "420px" }}
            >
              {/* Each card's own unique illustration */}
              <Image
                src={card.img}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:from-black/95 transition-opacity duration-300" />

              {/* Accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: card.accentColor }} />

              {/* Card number badge */}
              <div
                className="absolute top-5 left-5 h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg"
                style={{ backgroundColor: card.accentColor }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Text at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-7 z-10 flex flex-col justify-end min-h-[160px]">
                <div className="min-h-[60px] flex flex-col justify-end">
                  <p
                    className="text-xs font-black uppercase tracking-[0.2em] mb-1 leading-tight text-white"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {card.subtitle}
                  </p>
                  <h3 className="text-xl font-black text-white mb-2 leading-tight">
                    {card.title}
                  </h3>
                </div>
                <div className="h-[60px]"> {/* Fixed height for description area to prevent shifting */}
                  <p className="text-sm font-medium text-white/90 leading-relaxed max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    {card.desc}
                  </p>
                </div>
              </div>

              {/* Divider between cards */}
              {i < 2 && (
                <div className="hidden md:block absolute top-0 right-0 bottom-0 w-px bg-white/10 z-20" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── POPULAR CATEGORIES ── */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl font-bold text-foreground/60 mb-1"
          >
            प्रसिद्ध कैटेगरी
          </motion.p>
          <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
            Popular <span className="text-primary">Categories</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:grid sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {POPULAR_CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.name}
              onClick={() => handleRedirect(cat.name)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group flex aspect-square w-[calc(33.333%-0.75rem)] cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-gray-100 bg-white p-2 text-center shadow-sm transition-all hover:border-orange-200 hover:shadow-2xl sm:w-auto sm:rounded-[2.5rem] sm:p-4 sm:gap-6"
            >
              <div className="relative h-4/5 w-4/5 transition-all group-hover:scale-110">
                <Image src={cat.img} alt={cat.name} fill className="object-contain drop-shadow-md" />
              </div>
              <span className="text-[10px] sm:text-lg font-black tracking-tighter text-gray-800 group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ── POPULAR PRODUCTS ── */}
      <section className="container mx-auto px-4 md:px-6 mt-24">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl font-bold text-foreground/60 mb-1"
          >
            प्रसिद्ध उत्पाद
          </motion.p>
          <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
            Popular <span className="text-accent">Products</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:grid sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {POPULAR_PRODUCTS.map((prod, index) => (
            <motion.div
              key={prod.name}
              onClick={() => handleRedirect(prod.name)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group flex aspect-square w-[calc(33.333%-0.75rem)] cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-gray-100 bg-white p-2 text-center shadow-sm transition-all hover:border-gray-200 hover:shadow-2xl sm:w-auto sm:rounded-[2.5rem] sm:p-4 sm:gap-6"
            >
              <div className="relative h-4/5 w-4/5 transition-all group-hover:scale-110">
                <Image src={prod.img} alt={prod.name} fill className="object-contain drop-shadow-md" />
              </div>
              <span className="text-[10px] sm:text-lg font-black tracking-tighter text-gray-800 group-hover:text-accent transition-colors">
                {prod.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL STRIP ── */}
      <section className="mt-24 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-16 border-y border-orange-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-2">असली आवाज़ें</p>
            <h2 className="text-3xl font-black tracking-tighter text-foreground">What Local Business Owners Say</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { quote: "DeshKhoj ne meri dukaan ko pura sheher mein famous kar diya!", name: "Ramesh Yadav", role: "Kirana Store Owner, Varanasi", emoji: "🏪" },
              { quote: "Pehle sirf galli ke log aate the, ab poore district se orders aate hain.", name: "Sushma Devi", role: "Home Baker, Patna", emoji: "🍰" },
              { quote: "Itna simple aur seedha! Mobile se hi sab ho gaya.", name: "Mukesh Kumar", role: "Tailor, Raipur", emoji: "✂️" },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-orange-100"
              >
                <div className="text-3xl mb-4">{t.emoji}</div>
                <p className="text-sm italic text-foreground/70 leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-black text-foreground">{t.name}</p>
                  <p className="text-xs text-foreground/40">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="container mx-auto mt-24 px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[3rem] bg-foreground">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
          <div className="absolute inset-0 opacity-5" aria-hidden>
            <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] items-center gap-12 p-10 sm:p-14">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400 mb-3">अपना व्यापार बढ़ाएं</p>
              <h2 className="text-3xl font-black tracking-tighter text-white sm:text-5xl leading-tight">
                Ready to Grow <br />Your Business?
              </h2>
              <p className="mt-4 text-base font-medium text-white/60 max-w-md">
                Join thousands of local businesses on Bharat's fastest growing directory. Free forever for small businesses.
              </p>
              <button
                onClick={() => router.push("/register")}
                className="mt-8 rounded-full bg-primary px-8 py-4 text-sm font-black text-white shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:bg-primary-hover active:scale-95"
              >
                Get Started for Free →
              </button>
            </div>
            <div className="hidden md:block w-56 lg:w-64 flex-shrink-0 self-end">
              <Image
                src="/illustrations/register_shopowner.png"
                alt="A friendly Indian shop owner ready to list their business"
                width={300}
                height={400}
                className="w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
