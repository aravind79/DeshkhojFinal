"use client";

import { useState } from "react";
import { X, Phone, User, Building, Tag, Package, FileText, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: number;
  initialData?: {
    category?: string;
    product?: string;
  };
}

export default function InquiryModal({ isOpen, onClose, shopId, initialData }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    business_name: "",
    phone_number: "",
    category: initialData?.category || "",
    interested_product: initialData?.product || "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await api.inquiries.submit({
        shop_id: shopId,
        ...formData
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({
          name: "",
          business_name: "",
          phone_number: "",
          category: initialData?.category || "",
          interested_product: initialData?.product || "",
          description: ""
        });
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="bg-primary px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tight">GET BEST PRICE</h2>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Direct Inquiry to Seller</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition shadow-inner"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Inquiry Sent!</h3>
                  <p className="text-foreground/60 text-sm">The seller will contact you shortly on your provided phone number.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 ml-1">Your Name *</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition">
                           <User className="h-4 w-4" />
                         </div>
                         <input
                           required
                           value={formData.name}
                           onChange={e => setFormData({ ...formData, name: e.target.value })}
                           placeholder="Full Name"
                           className="w-full rounded-2xl border border-card-border bg-[#F8F9FA] pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                         />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 ml-1">Phone Number *</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition">
                           <Phone className="h-4 w-4" />
                         </div>
                         <input
                           required
                           type="tel"
                           value={formData.phone_number}
                           onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                           placeholder="10 Digit Number"
                           className="w-full rounded-2xl border border-card-border bg-[#F8F9FA] pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                         />
                      </div>
                    </div>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 ml-1">Business Name (Optional)</label>
                    <div className="relative group">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition">
                         <Building className="h-4 w-4" />
                       </div>
                       <input
                         value={formData.business_name}
                         onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                         placeholder="Your Company/Shop Name"
                         className="w-full rounded-2xl border border-card-border bg-[#F8F9FA] pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 ml-1">Category</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition">
                           <Tag className="h-4 w-4" />
                         </div>
                         <input
                           value={formData.category}
                           onChange={e => setFormData({ ...formData, category: e.target.value })}
                           placeholder="Eg: Grocery, Electronics"
                           className="w-full rounded-2xl border border-card-border bg-[#F8F9FA] pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                         />
                      </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 ml-1">Interested Product</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition">
                           <Package className="h-4 w-4" />
                         </div>
                         <input
                           value={formData.interested_product}
                           onChange={e => setFormData({ ...formData, interested_product: e.target.value })}
                           placeholder="Name of Product"
                           className="w-full rounded-2xl border border-card-border bg-[#F8F9FA] pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                         />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 ml-1">Requirement Details</label>
                    <div className="relative group">
                       <div className="absolute left-4 top-6 text-foreground/30 group-focus-within:text-primary transition">
                         <FileText className="h-4 w-4" />
                       </div>
                       <textarea
                         rows={3}
                         value={formData.description}
                         onChange={e => setFormData({ ...formData, description: e.target.value })}
                         placeholder="Explain your requirement in brief..."
                         className="w-full rounded-2xl border border-card-border bg-[#F8F9FA] pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-sm resize-none"
                       />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-sm font-black text-white shadow-xl hover:bg-foreground/90 transition-all active:scale-95 disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-b-white" />
                    ) : (
                      <>SEND INQUIRY <Send className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
