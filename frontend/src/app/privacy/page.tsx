"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-20 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl mb-8">
          Privacy <span className="text-primary">Policy</span>
        </h1>
        <div className="prose prose-lg text-foreground/70 space-y-6">
          <p>Last updated: April 11, 2026</p>
          <p>
            At DeshKhoj, we take your privacy seriously. This policy describes how we collect, use, and handle your information when you use our website.
          </p>
          
          <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
          <p>
            When you register a business, we collect information such as your name, business name, address, phone number, and category.
          </p>

          <h2 className="text-2xl font-bold text-foreground">2. How We Use Information</h2>
          <p>
            The primary purpose of collection is to list your business on our platform so that customers can find and contact you. We do not sell your personal contact information to third parties.
          </p>

          <h2 className="text-2xl font-bold text-foreground">3. Public Visibility</h2>
          <p>
            Please note that information provided for your business listing (including business phone number and address) is intended to be public so that users of the platform can reach you.
          </p>

          <h2 className="text-2xl font-bold text-foreground">4. Cookies</h2>
          <p>
            We use cookies to improve your browsing experience and understand how you use our platform.
          </p>

          <h2 className="text-2xl font-bold text-foreground">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@deshkhoj.com.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
