"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, MapPin, Menu, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="DeshKhoj Logo" width={240} height={55} className="h-12 md:h-14 w-auto object-contain" priority />
          </Link>
        </div>

        <div className="flex-1" />



        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/register" 
              className="hidden rounded-full bg-primary px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-hover md:block transition-all"
            >
              List your Business
            </Link>
          </motion.div>
          <div className="flex items-center gap-2 border-l border-card-border pl-4">
            <button className="flex p-2 md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
