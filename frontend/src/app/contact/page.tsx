"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await api.messages.send(formData);
      setIsSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl mb-8">
          Contact <span className="text-primary">Us</span>
        </h1>
        <p className="text-lg text-foreground/70 mb-12">
          Have questions or need help? We're here for you. Reach out to us through any of the channels below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-card-border shadow-sm flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Email</h3>
            <p className="text-sm text-foreground/70">info@deshkhoj.in</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-card-border shadow-sm flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Phone</h3>
            <p className="text-sm text-foreground/70">+91 99999 99999</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-card-border shadow-sm flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Office</h3>
            <p className="text-sm text-foreground/70 text-center">Varanasi, Uttar Pradesh, India</p>
          </div>
        </div>

        <div className="mt-16 bg-white p-10 rounded-[2.5rem] border border-card-border shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
              <p className="text-foreground/60 text-sm">We've received your message and will get back to you soon.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-6 text-primary font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    type="text" 
                    className="rounded-2xl border border-card-border bg-[#F8F9FA] p-4 text-sm font-bold focus:bg-white focus:outline-primary transition-all" 
                    placeholder="Your Name" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Email</label>
                  <input 
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    type="email" 
                    className="rounded-2xl border border-card-border bg-[#F8F9FA] p-4 text-sm font-bold focus:bg-white focus:outline-primary transition-all" 
                    placeholder="Your Email" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Message</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-2xl border border-card-border bg-[#F8F9FA] p-4 text-sm font-bold focus:bg-white focus:outline-primary transition-all min-h-[150px] resize-none" 
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-white hover:bg-primary-hover transition shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "SENDING..." : <>SEND MESSAGE <Send className="h-4 w-4" /></>}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
