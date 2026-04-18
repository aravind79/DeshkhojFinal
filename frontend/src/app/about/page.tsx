"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl mb-8">
          About <span className="text-primary">DeshKhoj</span>
        </h1>
        <div className="prose prose-lg text-foreground/70 space-y-6">
          <p>
            Welcome to DeshKhoj, Bharat's fastest-growing local business directory. Our mission is simple: to connect local businesses with their communities and help Bharat's entrepreneurs grow in the digital age.
          </p>
          <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
          <p>
            We believe that every local business, from the smallest neighborhood kirana store to the finest artisan craftsman, deserves to be found online. DeshKhoj is built to provide that platform—free, easy, and effective.
          </p>
          <h2 className="text-2xl font-bold text-foreground">Why DeshKhoj?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Support Local:</strong> We prioritize small and medium local businesses to strengthen our community.</li>
            <li><strong>Direct Connection:</strong> No middlemen. Customers connect directly with business owners via calls or WhatsApp.</li>
            <li><strong>Inclusive:</strong> Built for everyone in Bharat, with multi-language support and a focus on simplicity.</li>
          </ul>
          <p className="mt-8">
            Thank you for being part of our journey to make Bharat's local markets digital and vibrant.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
