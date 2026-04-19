"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Star, Phone, CheckCircle2, 
  ArrowLeft, Share2, ShieldCheck, 
  MessageSquare, ChevronRight,
  Info, ShoppingBag
} from "lucide-react";
import { api, API_URL, API_BASE, type Business } from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";
import InquiryModal from "@/components/InquiryModal";

export default function BusinessDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [biz, setBiz] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ user_name: "", rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const bid = Array.isArray(id) ? id[0] : id;
    Promise.all([
      api.businesses.getById(bid),
      api.businesses.reviews.get(bid)
    ])
      .then(([bizRes, reviewsRes]) => {
        setBiz(bizRes.data);
        setReviews(reviewsRes.data);
      })
      .catch(() => router.push("/search"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.user_name || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const bid = Array.isArray(id) ? id[0] : id;
      if (!bid) return;
      await api.businesses.reviews.add(bid, reviewForm);
      // Refresh both reviews AND business data so avg_rating badge updates instantly
      const [bizRes, reviewsRes] = await Promise.all([
        api.businesses.getById(bid),
        api.businesses.reviews.get(bid)
      ]);
      setBiz(bizRes.data);
      setReviews(reviewsRes.data);
      setReviewForm({ user_name: "", rating: 5, comment: "" });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!biz) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-card-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-xs font-medium text-foreground/50">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/search" className="hover:text-primary transition">Directory</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/80 truncate">{biz.dukaan_name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Gallery & Core Info */}
            <div className="rounded-3xl border border-card-border bg-white p-6 shadow-sm overflow-hidden">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Left: Images */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative border border-card-border overflow-hidden">
                    {biz.main_photo ? (
                       <img src={`${API_URL}/uploads/${biz.main_photo}`} alt={biz.dukaan_name} className="h-full w-full object-cover" />
                    ) : (
                       <span className="text-6xl font-black text-primary/10">{biz.dukaan_name.charAt(0).toUpperCase()}</span>
                    )}
                    {biz.paid === 1 && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-xl">
                        <ShieldCheck className="h-4 w-4" /> VERIFIED BUSINESS
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 w-20 rounded-xl border border-card-border bg-background flex items-center justify-center text-primary/20 hover:border-primary transition cursor-pointer">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Summary */}
                <div className="flex flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground leading-tight">{biz.dukaan_name}</h1>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded bg-green-600 px-2 py-0.5 text-sm font-bold text-white">
                          {Number(biz.avg_rating || 0).toFixed(1)} <Star className="h-3 w-3 fill-current" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{biz.business_type || "Dealer"}</span>
                      </div>
                    </div>
                    <button className="h-10 w-10 rounded-full border border-card-border flex items-center justify-center text-foreground hover:bg-card-border/20 transition">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="text-2xl font-bold text-primary">Ask for Price</div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-1 flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-foreground/40">Quantity</label>
                        <div className="flex items-center rounded-lg border border-card-border bg-background px-3 py-2">
                          <input type="number" defaultValue="1" className="w-full bg-transparent text-sm font-bold outline-none" />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-foreground/40">Units</label>
                        <div className="flex items-center rounded-lg border border-card-border bg-background px-3 py-2">
                          <select className="w-full bg-transparent text-sm font-bold outline-none">
                            <option>Units</option>
                            <option>Kg</option>
                            <option>Box</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsInquiryOpen(true)}
                      className="w-full rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-lg hover:bg-primary-hover transition-all active:scale-95"
                    >
                      GET BEST PRICE
                    </button>
                  </div>

                  <div className="mt-auto pt-8 flex items-center gap-3 border-t border-dashed border-card-border">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Secure Transactions</p>
                      <p className="text-[10px] text-foreground/50 leading-none">Registered with DeshKhoj Trust Seal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="rounded-3xl border border-card-border bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-card-border overflow-hidden rounded-xl border border-card-border">
                {[
                  { label: "Business Category", value: biz.shop_categories || "General" },
                  { label: "Owner Name", value: biz.dukaandar_name },
                  { label: "Years in Business", value: biz.years_established ? `${biz.years_established} Years` : "Established recently" },
                  { label: "Registration ID", value: `#DK-${biz.id}` },
                  { label: "Location", value: biz.dukaan_addr?.split(',').slice(-1).join(',') || "Local" },
                  { label: "GST Registered", value: biz.gst_no ? `Verified (${biz.gst_no})` : "Not Provided" },
                  { label: "Payment Modes", value: biz.payment_modes || "Cash" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-4 border-b border-card-border last:border-0 sm:border-0">
                    <span className="text-sm font-medium text-foreground/50">{item.label}</span>
                    <span className="text-sm font-bold text-foreground text-left sm:text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-3xl border border-card-border bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
              <div className="prose prose-sm max-w-none text-foreground/70 leading-relaxed">
                <p>{biz.dukaan_desc || "No detailed description available for this business. Please contact the owner for more information regarding products and services offered."}</p>
                <p className="mt-4">Located at {biz.dukaan_addr}, this establishment serves the local community with pride and quality service. Reach out today for the best prices and inquiries.</p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="rounded-3xl border border-card-border bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" /> User Reviews
                </h2>
                <div className="text-sm font-bold text-foreground/40">{reviews.length} Reviews</div>
              </div>

              {/* Review List */}
              <div className="space-y-6 mb-10">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="pb-6 border-b border-card-border last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-sm text-foreground">{rev.user_name}</div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed">{rev.comment}</p>
                      <div className="mt-2 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 rounded-2xl border-2 border-dashed border-card-border text-foreground/30 text-xs font-bold">
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="rounded-2xl bg-background p-6 border border-card-border">
                <h3 className="text-sm font-bold text-foreground mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      placeholder="Your Name" 
                      required
                      value={reviewForm.user_name}
                      onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})}
                      className="w-full rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary font-bold" 
                    />
                    <div className="flex items-center gap-2 rounded-xl border border-card-border bg-white px-4 py-2.5">
                      <span className="text-xs font-bold text-foreground/40">Rating:</span>
                      <select 
                        value={reviewForm.rating}
                        onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                        className="bg-transparent text-sm font-bold outline-none text-yellow-600"
                      >
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                      </select>
                    </div>
                  </div>
                  <textarea 
                    placeholder="Tell others about your experience..." 
                    rows={3}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    className="w-full rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <div className="flex items-center gap-4 flex-wrap">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="rounded-xl bg-foreground px-8 py-3 text-xs font-black text-white hover:bg-foreground/90 transition-all active:scale-95 disabled:opacity-40"
                    >
                      {isSubmitting ? "Posting..." : "POST REVIEW →"}
                    </button>
                    {reviewSuccess && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-xs font-bold text-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Review posted! Rating updated.
                      </motion.div>
                    )}
                  </div>
                </form>
              </div>
            </div>

          </div>

          {/* Sidebar: Contact & Map */}
          <div className="space-y-6">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-3xl border border-card-border bg-white p-6 shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-4">Contact Seller</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-card-border">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground/40 uppercase">Mobile Number</p>
                      <p className="text-sm font-bold text-foreground">{biz.contact_no}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-card-border">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground/40 uppercase">Store Address</p>
                      <p className="text-sm font-bold text-foreground line-clamp-1">{biz.dukaan_addr}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <a href={`tel:${biz.contact_no}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-green-700 transition active:scale-95">
                    <Phone className="h-4 w-4" /> CALL NOW
                  </a>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-600/20 bg-green-50 py-3.5 text-sm font-bold text-green-700 hover:bg-green-100 transition active:scale-95">
                    <MessageSquare className="h-4 w-4" /> WHATSAPP
                  </button>
                </div>
              </div>

              {/* Trust Badge Card */}
              <div className="rounded-3xl bg-gradient-to-br from-primary to-accent p-6 text-white shadow-xl">
                 <ShieldCheck className="h-10 w-10 mb-4 opacity-50" />
                 <p className="text-lg font-bold">Safe Shopping Tip</p>
                 <p className="mt-2 text-sm text-white/80 leading-relaxed italic">
                   Always check the seller's rating and ask for a physical bill before making large payments. DeshKhoj verified dealers are generally safer to deal with.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InquiryModal 
        isOpen={isInquiryOpen} 
        onClose={() => setIsInquiryOpen(false)} 
        shopId={biz.id} 
        initialData={{ category: biz.shop_categories }}
      />
    </div>
  );
}
