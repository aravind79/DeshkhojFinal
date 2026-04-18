"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyCheck, ArrowRight, ArrowLeft, Loader2, Camera, Upload, Trash2, Plus } from "lucide-react";
import { api, API_BASE } from "@/lib/api";

interface LocationOption { id: number; name: string }

type StepStatus = "idle" | "loading" | "success" | "error";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 6; // Step 6 = success
  const [status, setStatus] = useState<StepStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [form, setForm] = useState({
    dukaan_name: "",
    dukaandar_name: "",
    contact_no: "",
    whatsapp: "",
    email: "",
    dukaan_addr: "",
    pincode: "",
    block_id: "",
    dukaan_desc: "",
    business_type: "Retailer",
    gst_registered: "No",
    gst_no: "",
    payment_modes: ["Cash"] as string[],
    shop_categories: "",
    category_1: "",
    category_2: "",
    category_3: "",
    main_photo: "",
    gallery: "",
    years_established: 0,
    products: [] as any[],
  });

  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Location
  const [states, setStates] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [blocks, setBlocks] = useState<LocationOption[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [categories, setCategories] = useState<LocationOption[]>([]);

  useEffect(() => {
    api.locations.states().then((r) => setStates(r.data.map((s) => ({ id: s.id, name: s.state_name })))).catch(() => {});
    api.categories.list().then((r) => setCategories(r.data.map((c) => ({ id: c.id, name: c.cat_name })))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedState) return setDistricts([]);
    api.locations.districts(Number(selectedState))
      .then((r) => setDistricts(r.data.map((d) => ({ id: d.id, name: d.district_name }))))
      .catch(() => {});
    setSelectedDistrict("");
    setBlocks([]);
  }, [selectedState]);

  useEffect(() => {
    if (!selectedDistrict) return setBlocks([]);
    api.locations.blocks(Number(selectedDistrict))
      .then((r) => setBlocks(r.data.map((b) => ({ id: b.id, name: b.block_name }))))
      .catch(() => {});
    setForm(p => ({ ...p, block_id: "" }));
  }, [selectedDistrict]);

  const set = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedNames: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await api.businesses.uploadImage(files[i]);
        if (res.success) uploadedNames.push(res.filename);
      }

      if (!isGallery) {
        // Single Main Photo
        set("main_photo", uploadedNames[0]);
      } else {
        // Add to gallery
        const currentGallery = form.gallery ? form.gallery.split(',').filter(x => x) : [];
        const newGallery = [...currentGallery, ...uploadedNames];
        set("gallery", newGallery.join(','));
        setGalleryPreviews(p => [...p, ...uploadedNames]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const addProduct = () => {
    setForm(prev => ({
      ...prev,
      products: [...prev.products, { name: "", price: "", description: "", image: "" }]
    }));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    setForm(prev => {
      const newProducts = [...prev.products];
      if (newProducts[index]) {
        (newProducts[index] as any)[field] = value;
      }
      return { ...prev, products: newProducts };
    });
  };

  const removeProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setStatus("loading");
    setErrorMessage("");
    try {
      let blockName = blocks.find(b => String(b.id) === form.block_id)?.name;
      if (form.block_id === "other_block" && (form as any).manual_block) {
        blockName = (form as any).manual_block;
      }
      await api.businesses.register({
        ...form,
        dukaan_addr: `${form.dukaan_addr}${blockName ? `, Block: ${blockName}` : ""}${form.pincode ? `, Pincode: ${form.pincode}` : ""}${selectedDistrict ? `, District: ${districts.find(d=>String(d.id)===selectedDistrict)?.name}` : ""}`,
        payment_modes: form.payment_modes.join(", "),
        // Ensure category_1, category_2, category_3 are sent if needed, otherwise clear them
        category_1: form.shop_categories, // Assuming primary category goes here
        category_2: "", // Clear or set from other inputs if they exist
        category_3: "", // Clear or set from other inputs if they exist
      });
      setStatus("success");
      setStep(6); // Success step is now 6
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Submission failed. Please try again.");
    }
  };

  const nextStep = () => {
    setErrorMessage("");
    if (step === 1) {
      if (!form.dukaan_name || !form.dukaandar_name || (!form.contact_no && !form.whatsapp)) {
        setErrorMessage("Please fill all mandatory fields (Business Name, Owner Name, and at least one of Phone No / WhatsApp)");
        return;
      }
      if (form.contact_no && form.contact_no.length < 10) {
        setErrorMessage("Please enter a valid 10-digit mobile number for Phone No.");
        return;
      }
      if (form.whatsapp && form.whatsapp.length < 10) {
        setErrorMessage("Please enter a valid 10-digit mobile number for WhatsApp.");
        return;
      }
    }
    if (step === 2) {
      if (!form.main_photo) {
        setErrorMessage("Please upload at least one business photo (Mandatory)");
        return;
      }
      if (!selectedState || !selectedDistrict || !form.block_id || !form.pincode || !form.dukaan_addr) {
        setErrorMessage("Please complete all location details (State, District, Block, Pincode, Address)");
        return;
      }
      if (form.block_id === "other_block" && !(form as any).manual_block) {
        setErrorMessage("Please enter the manually added Block name");
        return;
      }
      if (form.pincode.length !== 6 || isNaN(Number(form.pincode))) {
        setErrorMessage("Please enter a valid 6-digit Pincode.");
        return;
      }
    }
    if (step === 3) {
      // No specific validation for business specs yet, but can add if fields become mandatory
    }
    if (step === 4) {
      if (!form.shop_categories) {
        setErrorMessage("Please select a primary business category");
        return;
      }
    }
    if (step === 5) { // This is the new products step
      // Optional: Add validation for products if needed (e.g., at least one product, product name/price required)
      // For now, it's optional to add products.
      handleSubmit();
      return;
    }
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const STEP_LABELS = ["Basic Details", "Location & Photo", "Specifications", "Categories", "Products"];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background/50 text-foreground">

      {/* ── LEFT PANEL — Visual Storytelling (desktop only) ── */}
      <aside className="hidden lg:flex w-[380px] xl:w-[440px] flex-shrink-0 flex-col justify-between bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 p-10 border-r border-orange-100">
        {/* Brand */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-orange-600 shadow-sm mb-10">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            DeshKhoj Business Listing
          </div>

          <h2 className="text-3xl font-black tracking-tight text-foreground leading-snug mb-3">
            अपनी दुकान को <span className="text-primary">डिजिटल</span> बनाएं
          </h2>
          <p className="text-sm text-foreground/60 leading-relaxed mb-8">
            Put your business on the map — literally. Reach customers across your block, district, and beyond.
          </p>

          {/* Step progress visual */}
          <div className="space-y-3 mb-10">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isDone = step > stepNum;
              const isCurrent = step === stepNum;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-primary text-white scale-110 shadow-md shadow-primary/30' : 'bg-white border border-card-border text-foreground/30'}`}>
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${isCurrent ? 'text-foreground' : isDone ? 'text-green-600' : 'text-foreground/30'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { value: "12,000+", label: "Businesses Listed" },
              { value: "₹0", label: "Forever Free" },
              { value: "200+", label: "Towns Covered" },
              { value: "24hrs", label: "Approval Time" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-white border border-orange-100 p-3 text-center shadow-sm">
                <div className="text-lg font-black text-primary">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop Owner Illustration + Testimonial */}
        <div>
          <div className="relative mb-4">
            <img
              src="/illustrations/register_shopowner.png"
              alt="A local shop owner on DeshKhoj"
              className="w-48 mx-auto object-contain drop-shadow-xl"
            />
          </div>
          <div className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm">
            <p className="text-sm italic text-foreground/70 leading-relaxed mb-3">
              "DeshKhoj ne meri dukaan ko pura sheher mein famous kar diya. Ab customers khud dhundh ke aate hain!"
            </p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-base">🏪</div>
              <div>
                <p className="text-xs font-black text-foreground">Ramesh Yadav</p>
                <p className="text-[10px] text-foreground/40">Kirana Store Owner, Varanasi</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL — The Form ── */}
      <div className="flex flex-1 items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center text-foreground lg:hidden">
            <h1 className="text-3xl font-bold tracking-tight">List Your Business</h1>
            <p className="mt-2 text-foreground/70">Join thousands of local businesses on DeshKhoj</p>
          </div>
          <div className="mb-8 text-foreground hidden lg:block">
            <h1 className="text-2xl font-bold tracking-tight">List Your Business</h1>
            <p className="mt-1 text-sm text-foreground/50">Fill in the details below to get started.</p>
          </div>


          {step < 6 && (
            <div className="mb-2 flex items-center justify-between text-xs text-foreground/50">
              <span>Step {step} of 5</span>
              <span>{Math.round((step / 5) * 100)}% complete</span>
            </div>
          )}
          {step < 6 && (
            <div className="mb-8 overflow-hidden rounded-full bg-card-border">
              <motion.div
                className="h-2 rounded-full bg-primary"
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          <div className="relative overflow-hidden rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm sm:p-10 min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.25 }} className="flex flex-col">
                <h2 className="mb-6 text-xl font-bold text-primary">Basic Details</h2>
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-foreground/80 mb-2">Business Name *</label>
                    <input value={form.dukaan_name} onChange={(e) => set("dukaan_name", e.target.value)} type="text" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="e.g. Acme Supermart" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground/80 mb-2">Owner Name *</label>
                    <input value={form.dukaandar_name} onChange={(e) => set("dukaandar_name", e.target.value)} type="text" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Full Name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground/80 mb-2">Phone No *</label>
                      <input value={form.contact_no} onChange={(e) => set("contact_no", e.target.value)} type="tel" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="+91 ..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground/80 mb-2">WhatsApp No *</label>
                      <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} type="tel" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="+91 ..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground/80 mb-2">Email Address</label>
                      <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground/80 mb-2">Years in Business</label>
                      <input value={form.years_established || ""} onChange={(e) => set("years_established", parseInt(e.target.value) || 0)} type="number" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="e.g. 5" />
                    </div>
                  </div>

                </div>
                {errorMessage && <p className="mt-4 text-xs font-bold text-red-500">{errorMessage}</p>}
                <div className="mt-12 flex justify-end">
                  <button onClick={nextStep} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-primary-hover">
                    Next Step <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.25 }} className="flex flex-col">
                <h2 className="mb-6 text-xl font-bold text-primary">Location & Photo</h2>
                <div className="space-y-6 flex-1">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-foreground/80 block">1. Business Location *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                        <option value="">Select State</option>
                        {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedState} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50">
                        <option value="">Select District</option>
                        {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <select value={form.block_id} onChange={(e) => set("block_id", e.target.value)} disabled={!selectedDistrict} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50 transition-all">
                        <option value="">Select Block</option>
                        {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        {selectedDistrict && <option value="other_block" className="font-bold text-primary">Other / Add Manually</option>}
                      </select>
                      {form.block_id === "other_block" && (
                        <input 
                          type="text" 
                          placeholder="Type Block Name Manually *"
                          className="w-full md:col-span-1 rounded-xl border border-primary/50 bg-background px-4 py-3 text-sm outline-none focus:border-primary shadow-sm"
                          value={(form as any).manual_block || ""}
                          onChange={(e) => set("manual_block", e.target.value)}
                        />
                      )}
                      <input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="Pincode *" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <textarea placeholder="Full Street Address / Landmark *" value={form.dukaan_addr} onChange={(e) => set("dukaan_addr", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" rows={2} />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-card-border">
                    <label className="text-sm font-bold text-foreground/80 block">2. Upload Photos *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1 text-center">
                        <p className="text-[10px] font-bold text-foreground/40 uppercase mb-2">Main Photo</p>
                        <label className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-card-border bg-background hover:border-primary transition-all">
                          {form.main_photo ? <img src={`${API_BASE}/uploads/${form.main_photo}`} className="h-full w-full object-cover" /> : <Camera className="h-8 w-8 text-foreground/20" />}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-foreground/40 uppercase mb-2">Gallery (Optional)</p>
                        <div className="grid grid-cols-3 gap-2">
                          {galleryPreviews.slice(0, 5).map((img, i) => (
                            <div key={i} className="aspect-square rounded-xl border border-card-border bg-background overflow-hidden">
                              <img src={`${API_BASE}/uploads/${img}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          <label className="aspect-square flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-card-border bg-background hover:border-primary transition-all">
                            <Upload className="h-4 w-4 text-foreground/20" />
                            <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleImageUpload(e, true)} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errorMessage && <p className="mt-4 text-xs font-bold text-red-500">{errorMessage}</p>}
                <div className="mt-12 flex justify-between">
                  <button onClick={prevStep} className="flex items-center gap-2 rounded-xl border border-card-border px-6 py-3 text-sm font-bold text-foreground transition hover:bg-card-border/50"><ArrowLeft className="h-4 w-4" /> Back</button>
                  <button onClick={nextStep} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-primary-hover">Next Step <ArrowRight className="h-4 w-4" /></button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.25 }} className="flex flex-col">
                <h2 className="mb-6 text-xl font-bold text-primary">Specifications</h2>
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-foreground/80 mb-2">Business Type *</label>
                    <select value={form.business_type} onChange={(e) => set("business_type", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                      <option>Retailer</option>
                      <option>Wholesaler</option>
                      <option>Manufacturer</option>
                      <option>Dealer</option>
                      <option>Distributor</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground/80 mb-2">GST Registered?</label>
                      <select value={form.gst_registered} onChange={(e) => set("gst_registered", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </div>
                    {form.gst_registered === "Yes" && (
                      <div>
                        <label className="block text-sm font-bold text-foreground/80 mb-2">GST Number</label>
                        <input value={form.gst_no} onChange={(e) => set("gst_no", e.target.value)} type="text" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Enter GSTIN" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground/80 mb-2">Payment Modes Accepted</label>
                    <div className="flex flex-wrap gap-2">
                       {["Cash", "GPay", "PhonePe", "Credit Card", "UPI", "Bank Transfer"].map(mode => (
                         <label key={mode} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${form.payment_modes.includes(mode) ? 'border-primary bg-primary/10 text-primary' : 'border-card-border bg-background text-foreground/40'}`}>
                           <input type="checkbox" className="hidden" checked={form.payment_modes.includes(mode)} onChange={(e) => {
                             if(e.target.checked) set("payment_modes", [...form.payment_modes, mode]);
                             else set("payment_modes", form.payment_modes.filter(m => m !== mode));
                           }} />
                           {mode}
                         </label>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex justify-between">
                  <button onClick={prevStep} className="flex items-center gap-2 rounded-xl border border-card-border px-6 py-3 text-sm font-bold text-foreground transition hover:bg-card-border/50"><ArrowLeft className="h-4 w-4" /> Back</button>
                  <button onClick={nextStep} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-primary-hover">Next Step <ArrowRight className="h-4 w-4" /></button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.25 }} className="flex flex-col">
                <h2 className="mb-6 text-xl font-bold text-primary">Categories</h2>
                <div className="space-y-4 flex-1">
                  <p className="text-xs text-foreground/50 mb-4 italic">Select up to 3 categories to help customers find you easily.</p>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-foreground/40 mb-1">Select Category 1 *</label>
                    <select value={form.shop_categories} onChange={(e) => set("shop_categories", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                      <option value="">Primary Category</option>
                      {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-foreground/40 mb-1">Select Category 2</label>
                    <select value={form.category_2} onChange={(e) => set("category_2", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                      <option value="">Secondary Category (Optional)</option>
                      {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-foreground/40 mb-1">Select Category 3</label>
                    <select value={form.category_3} onChange={(e) => set("category_3", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                      <option value="">Additional Category (Optional)</option>
                      {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="pt-4 mt-4 border-t border-card-border">
                    <label className="block text-sm font-bold text-foreground/80 mb-2">Business Description</label>
                    <textarea value={form.dukaan_desc} onChange={(e) => set("dukaan_desc", e.target.value)} rows={3} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Describe your shop..." />
                  </div>
                </div>
                {errorMessage && <p className="mt-4 text-xs font-bold text-red-500">{errorMessage}</p>}
                <div className="mt-12 flex justify-between">
                  <button onClick={prevStep} className="flex items-center gap-2 rounded-xl border border-card-border px-6 py-3 text-sm font-bold text-foreground transition hover:bg-card-border/50"><ArrowLeft className="h-4 w-4" /> Back</button>
                  <button onClick={nextStep} disabled={!form.shop_categories} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-primary-hover disabled:opacity-40">Next Step <ArrowRight className="h-4 w-4" /></button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.25 }} className="flex flex-col">
                <h2 className="mb-6 text-xl font-bold text-primary">Products</h2>
                <div className="space-y-6 flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {form.products.map((prod, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-card-border bg-background/50 relative space-y-4">
                      <button onClick={() => removeProduct(idx)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                      <div className="space-y-3">
                        <input value={prod.name} onChange={e => updateProduct(idx, "name", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary font-bold" placeholder="Product Name *" />
                        <div className="grid grid-cols-2 gap-3">
                           <input value={prod.description} onChange={e => updateProduct(idx, "description", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Weight / Pieces *" />
                           <input value={prod.price} onChange={e => updateProduct(idx, "price", e.target.value)} className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Rate per unit *" />
                        </div>
                        <label className="relative flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-card-border bg-background px-3 transition hover:border-primary">
                           <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center bg-card-border/30">
                              {prod.image ? <img src={`${API_BASE}/uploads/${prod.image}`} className="h-full w-full object-cover" /> : <Camera className="h-4 w-4 text-foreground/20" />}
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-tighter text-primary">{prod.image ? 'CHANGE PHOTO' : `SELECT PRODUCT ${idx + 1} PHOTO →`}</span>
                           <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setIsUploading(true);
                                  const res = await api.businesses.uploadImage(file);
                                  if (res.success) updateProduct(idx, "image", res.filename);
                                } finally { setIsUploading(false); }
                              }
                           }} />
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  <button onClick={addProduct} className="w-full py-4 rounded-2xl border-2 border-dashed border-card-border bg-primary/5 text-xs font-black text-primary hover:bg-primary/10 transition flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> ADD NEW PRODUCT →
                  </button>
                </div>
                {errorMessage && <p className="mt-4 text-xs font-bold text-red-500">{errorMessage}</p>}
                <div className="mt-12 flex justify-between">
                  <button onClick={prevStep} className="flex items-center gap-2 rounded-xl border border-card-border px-6 py-3 text-sm font-bold text-foreground transition hover:bg-card-border/50"><ArrowLeft className="h-4 w-4" /> Back</button>
                  <button onClick={nextStep} className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-accent px-10 py-3 text-sm font-black text-white shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                    {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "SUBMIT FORM →"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-6 rounded-full bg-green-500/10 p-5 text-green-500">
                  <CopyCheck className="h-16 w-16" />
                </div>
                <h2 className="mb-2 text-3xl font-black text-foreground uppercase tracking-tight">Application Submitted!</h2>
                <p className="max-w-xs text-sm font-medium text-foreground/60 leading-relaxed">Our team will verify your business details within 24 hours. You'll appear in search results once approved.</p>
                <div className="mt-10">
                   <button onClick={() => window.location.href = "/"} className="rounded-xl border border-card-border bg-background px-10 py-4 text-sm font-bold text-foreground hover:bg-card-border transition-all">Return Home</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </div>
  );
}
