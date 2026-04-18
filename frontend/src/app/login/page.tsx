"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="text-[12rem] font-black pointer-events-none">DK</span>
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-4"
          >
            🚀
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">
            Coming <span className="text-primary">Soon</span>
          </h1>
          <p className="mt-4 text-xl font-bold text-foreground/60 leading-tight">
            Our powerful business dashboard and login feature are under construction.
          </p>
        </div>

        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-start gap-4 text-left">
          <div className="h-6 w-6 rounded-full bg-amber-400 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-900/70">
            We're building a seamless experience for Bharat's entrepreneurs. Stay tuned for a world-class platform to manage your digital presence.
          </p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-black text-white shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}
