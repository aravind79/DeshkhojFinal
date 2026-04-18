"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-20 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl mb-8">
          Terms of <span className="text-primary">Service</span>
        </h1>
        <div className="prose prose-lg text-foreground/70 space-y-6">
          <p>Last updated: April 11, 2026</p>
          <p>
            By using DeshKhoj, you agree to the following terms and conditions.
          </p>

          <h2 className="text-2xl font-bold text-foreground">1. Accuracy of Information</h2>
          <p>
            Users are responsible for ensuring that the information they provide for business listings is accurate and up-to-date. DeshKhoj is not responsible for any incorrect information provided by businesses.
          </p>

          <h2 className="text-2xl font-bold text-foreground">2. Prohibited Content</h2>
          <p>
            Users may not list businesses that provide illegal services, promote hate speech, or violate the rights of others. We reserve the right to remove any listing at our discretion.
          </p>

          <h2 className="text-2xl font-bold text-foreground">3. Limitation of Liability</h2>
          <p>
            DeshKhoj is a directory platform. We are not involved in the actual transactions between customers and businesses. We are not liable for any disputes, damages, or losses arising from such interactions.
          </p>

          <h2 className="text-2xl font-bold text-foreground">4. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Your continued use of the platform constitutes acceptance of the updated terms.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
