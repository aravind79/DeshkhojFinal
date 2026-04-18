"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileDown,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  Loader2,
  LogOut,
  Clock,
  CheckCircle2,
  Edit,
  Trash2,
  X,
  Camera,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, API_BASE, type Business } from "@/lib/api";

interface Stats {
  businesses: number;
  users: number;
  pendingRegistrations: number;
  products: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [adminSearch, setAdminSearch] = useState("");

  // Edit State
  const [editItem, setEditItem] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const u = localStorage.getItem("admin_user");
    if (!token) {
      router.push("/admin");
      return;
    }
    setUser(JSON.parse(u || "{}"));

    const fetchData = async () => {
      try {
        const statsRes = await api.admin.stats(token);
        setStats(statsRes.data);
        
        const pendingRes = await api.admin.pendingRegistrations(token);
        if (pendingRes.success) setPendingItems(pendingRes.data);

        const allRes = await api.admin.businesses(token, page);
        if (allRes.success) {
          setAllItems(allRes.data);
          if ((allRes as any).meta) {
            setTotalPages((allRes as any).meta.totalPages);
            setTotalRecords((allRes as any).meta.total);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, page]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setApprovingId(id);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.admin.approve(token!, id, action);
      if (res.success) {
        setPendingItems(prev => prev.filter(item => item.id !== id));
        const statsRes = await api.admin.stats(token!);
        setStats(statsRes.data);
        // Refresh all items too
        const allRes = await api.admin.businesses(token!);
        setAllItems(allRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing permanently?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.admin.deleteBusiness(token!, id);
      if (res.success) {
        setAllItems(prev => prev.filter(item => item.id !== id));
        setPendingItems(prev => prev.filter(item => item.id !== id));
        const statsRes = await api.admin.stats(token!);
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.admin.updateBusiness(token!, editItem.id, editItem);
      if (res.success) {
        setAllItems(prev => prev.map(item => item.id === editItem.id ? { ...editItem } : item));
        setPendingItems(prev => prev.map(item => item.id === editItem.id ? { ...editItem } : item));
        setEditItem(null);
        // Refresh stats
        const statsRes = await api.admin.stats(token!);
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = async (item: any) => {
    setEditItem(item); // Set basic info first
    try {
      const res = await api.businesses.getById(item.id);
      if (res.success) {
        setEditItem(res.data); // Set full info including products
      }
    } catch (err) {
      console.error("Failed to fetch full details:", err);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedNames: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await api.businesses.uploadImage(files[i]);
        if (res.success) uploadedNames.push(res.filename);
      }

      if (isGallery) {
        const currentGallery = editItem.gallery ? editItem.gallery.split(',').filter((x: string) => x) : [];
        const newGallery = [...currentGallery, ...uploadedNames].join(',');
        setEditItem({ ...editItem, gallery: newGallery });
      } else {
        setEditItem({ ...editItem, main_photo: uploadedNames[0] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin");
  };

  const filteredPending = pendingItems.filter(item => 
    item.dukaan_name?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    item.contact_no?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    item.dukaandar_name?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredAll = allItems.filter(item => 
    item.dukaan_name?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    item.contact_no?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    item.shop_categories?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 mb-20 text-foreground">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-foreground/70">Welcome back, {user?.name || "Admin"}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-card-border/50"
          >
            <ExternalLink className="h-4 w-4" />
            Live Site
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-red-50 text-red-600 px-4 py-2.5 text-sm font-bold transition-all hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Businesses", value: stats?.businesses, icon: Building2, color: "text-blue-600 bg-blue-100" },
          { label: "Total Users", value: stats?.users, icon: Users, color: "text-purple-600 bg-purple-100" },
          { label: "Pending Reviews", value: stats?.pendingRegistrations, icon: Clock, color: "text-amber-600 bg-amber-100" },
          { label: "Total Products", value: stats?.products, icon: ShoppingBag, color: "text-emerald-600 bg-emerald-100" },
        ].map((item, id) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: id * 0.1 }}
            className="rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground/60">{item.label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{item.value?.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content Areas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-card-border pb-4 gap-4">
            <div className="flex items-center gap-6">
               <button 
                onClick={() => setActiveTab('pending')}
                className={`pb-2 text-sm font-bold transition-all ${activeTab === 'pending' ? 'text-primary border-b-2 border-primary' : 'text-foreground/40 hover:text-foreground/60'}`}
               >
                 Pending Reviews ({pendingItems.length})
               </button>
               <button 
                onClick={() => setActiveTab('all')}
                className={`pb-2 text-sm font-bold transition-all ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-foreground/40 hover:text-foreground/60'}`}
               >
                 All Records ({totalRecords})
               </button>
            </div>
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search listings..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-bg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {/* Tab: Pending */}
              {activeTab === 'pending' && (
                <motion.div 
                  key="pending"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {filteredPending.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-card-border bg-card-bg/50 p-12 text-center">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/30" />
                      <p className="mt-4 font-bold text-foreground/40 uppercase tracking-widest text-[10px]">
                        {adminSearch ? "No listings match your search" : "All caught up! No pending reviews."}
                      </p>
                    </div>
                  ) : (
                    filteredPending.map((item) => (
                      <BusinessRow key={item.id} item={item} onApprove={handleAction} onEdit={handleEditClick} onDelete={handleDelete} isPending={true} />
                    ))
                  )}
                </motion.div>
              )}

              {/* Tab: All */}
              {activeTab === 'all' && (
                <motion.div 
                  key="all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {filteredAll.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-card-border bg-card-bg/50 p-12 text-center">
                      <Search className="mx-auto h-12 w-12 text-foreground/20" />
                      <p className="mt-4 font-bold text-foreground/40 uppercase tracking-widest text-[10px]">No records match your search</p>
                    </div>
                  ) : (
                    filteredAll.map((item) => (
                      <BusinessRow key={item.id} item={item} onEdit={handleEditClick} onDelete={handleDelete} isPending={false} />
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'all' && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 pb-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-lg border border-card-border px-4 py-2 text-sm font-bold disabled:opacity-40 hover:bg-card-border/20 transition-all"
                  >
                    ← Previous
                  </button>
                  <div className="text-sm font-bold text-foreground/60">
                     Page {page} of {totalPages}
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-lg border border-card-border px-4 py-2 text-sm font-bold disabled:opacity-40 hover:bg-card-border/20 transition-all"
                  >
                    Next →
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Management Tools</h2>
            <div className="grid gap-4">
              <button 
                onClick={() => router.push("/admin/import")}
                className="group flex items-center justify-between rounded-2xl border border-card-border bg-card-bg p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileDown className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">Bulk Import</p>
                    <p className="text-xs text-foreground/60">Upload CSV file</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground/30 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditItem(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-card-border bg-card-bg shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                <h3 className="text-lg font-bold">Edit Listing</h3>
                <button onClick={() => setEditItem(null)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-card-border/50 text-foreground/40"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleUpdate} className="max-h-[70vh] overflow-y-scroll p-6 space-y-4 custom-scrollbar">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Image Edit Section */}
                  <div className="w-full sm:w-40 flex-shrink-0">
                    <label className="block text-[10px] font-bold uppercase text-foreground/40 mb-2">Listing Image</label>
                    <label className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-card-border bg-background transition hover:border-primary">
                      {editItem.main_photo ? (
                        <img src={`${API_BASE}/uploads/${editItem.main_photo}`} className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-foreground/20" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold font-black text-center px-2">CLICK TO<br/>CHANGE</div>
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Business Name</label>
                      <input value={editItem.dukaan_name} onChange={e=>setEditItem({...editItem, dukaan_name: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Owner Name</label>
                      <input value={editItem.dukaandar_name} onChange={e=>setEditItem({...editItem, dukaandar_name: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Contact No</label>
                    <input value={editItem.contact_no} onChange={e=>setEditItem({...editItem, contact_no: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">WhatsApp No</label>
                    <input value={editItem.whatsapp || ""} onChange={e=>setEditItem({...editItem, whatsapp: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Email Address</label>
                    <input value={editItem.email || ""} onChange={e=>setEditItem({...editItem, email: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary placeholder:font-normal" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Business Type</label>
                    <select value={editItem.business_type} onChange={e=>setEditItem({...editItem, business_type: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm font-bold outline-none focus:border-primary">
                       <option>Retailer</option><option>Wholesaler</option><option>Manufacturer</option><option>Dealer</option><option>Distributor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Pincode</label>
                    <input value={editItem.pincode || ""} onChange={e=>setEditItem({...editItem, pincode: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Years in Business</label>
                    <input value={editItem.years_established || ""} onChange={e=>setEditItem({...editItem, years_established: parseInt(e.target.value) || 0})} type="number" className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Full Address</label>
                    <textarea value={editItem.dukaan_addr} onChange={e=>setEditItem({...editItem, dukaan_addr: e.target.value})} rows={1} className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Category 1</label>
                    <input value={editItem.shop_categories} onChange={e=>setEditItem({...editItem, shop_categories: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Category 2</label>
                    <input value={editItem.category_2 || ""} onChange={e=>setEditItem({...editItem, category_2: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Category 3</label>
                    <input value={editItem.category_3 || ""} onChange={e=>setEditItem({...editItem, category_3: e.target.value})} className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-1">Description</label>
                  <textarea value={editItem.dukaan_desc || ""} onChange={e=>setEditItem({...editItem, dukaan_desc: e.target.value})} rows={3} className="w-full rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-bold outline-none focus:border-primary" placeholder="Tell us more about the business..." />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/40 block mb-2">Gallery Photos</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                     {editItem.gallery?.split(',').filter(Boolean).map((img: string, idx: number) => (
                       <div key={idx} className="relative aspect-square rounded-xl border border-card-border bg-background overflow-hidden group">
                         <img src={`${API_BASE}/uploads/${img}`} className="h-full w-full object-cover" />
                         <button 
                          type="button"
                          onClick={() => {
                            const images = (editItem.gallery || "").split(',').filter((_: string, i: number) => i !== idx);
                            setEditItem({...editItem, gallery: images.join(',')});
                          }}
                          className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                         >
                            <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     ))}
                     <label className="relative aspect-square flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-card-border bg-background transition hover:border-primary hover:bg-primary/5">
                        <Camera className="h-5 w-5 text-foreground/20" />
                        <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleImageChange(e, true)} />
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
                        )}
                     </label>
                  </div>
                </div>

                <div className="border-t border-card-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-bold uppercase text-foreground/40">Products Content</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const newProducts = [...(editItem.products || []), { prod_name: "", prod_amt: "", prod_desc: "" }];
                        setEditItem({ ...editItem, products: newProducts });
                      }}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      + ADD PRODUCT
                    </button>
                  </div>
                  <div className="space-y-4">
                    {editItem.products?.map((prod: any, idx: number) => (
                      <div key={idx} className="rounded-2xl border border-card-border p-4 bg-background/50 relative group">
                        <button 
                          type="button"
                          onClick={() => {
                            const newProducts = editItem.products.filter((_: any, i: number) => i !== idx);
                            setEditItem({ ...editItem, products: newProducts });
                          }}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <input 
                            placeholder="Product Name" 
                            value={prod.prod_name || prod.name || ""} 
                            onChange={(e) => {
                              const newProducts = [...editItem.products];
                              newProducts[idx] = { ...prod, prod_name: e.target.value };
                              setEditItem({ ...editItem, products: newProducts });
                            }} 
                            className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-xs font-bold outline-none focus:border-primary" 
                          />
                          <input 
                            placeholder="Price" 
                            value={prod.prod_amt || prod.price || ""} 
                            onChange={(e) => {
                              const newProducts = [...editItem.products];
                              newProducts[idx] = { ...prod, prod_amt: e.target.value };
                              setEditItem({ ...editItem, products: newProducts });
                            }} 
                            className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-xs font-bold outline-none focus:border-primary" 
                          />
                        </div>
                        <input 
                          placeholder="Description (Optional)" 
                          value={prod.prod_desc || prod.description || ""} 
                          onChange={(e) => {
                            const newProducts = [...editItem.products];
                            newProducts[idx] = { ...prod, prod_desc: e.target.value };
                            setEditItem({ ...editItem, products: newProducts });
                          }} 
                          className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-xs outline-none focus:border-primary" 
                        />
                      </div>
                    ))}
                    {(!editItem.products || editItem.products.length === 0) && (
                      <p className="text-center text-[10px] text-foreground/30 font-bold py-6 border border-dashed border-card-border rounded-2xl">
                        NO PRODUCTS LISTED
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-card-bg pb-2">
                  <button type="button" onClick={() => setEditItem(null)} className="rounded-xl px-6 py-2.5 text-xs font-bold text-foreground/40 hover:bg-card-border/50 transition">Cancel</button>
                  <button disabled={isUpdating} type="submit" className="rounded-xl bg-primary px-8 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-primary-hover active:scale-95 disabled:opacity-40 transition-all">
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BusinessRow({ item, onApprove, onEdit, onDelete, isPending }: any) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-card-border/30 flex items-center justify-center overflow-hidden">
             {item.main_photo ? (
               <img src={`${API_BASE}/uploads/${item.main_photo}`} className="h-full w-full object-cover" />
             ) : (
               <Building2 className="h-6 w-6 text-foreground/20" />
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{item.dukaan_name}</h3>
              {item.paid === 1 && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
            </div>
            <p className="text-xs text-foreground/50">{item.dukaandar_name} • {item.contact_no}</p>
            <div className="mt-1 flex gap-2">
              <span className="text-[8px] font-black uppercase text-primary border border-primary/20 px-1.5 py-0.5 rounded-full">{item.business_type || 'Entity'}</span>
              <span className="text-[8px] font-black uppercase text-foreground/40 border border-card-border px-1.5 py-0.5 rounded-full">{item.shop_categories}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPending ? (
            <div className="flex items-center gap-1.5">
               <button
                onClick={() => onEdit(item)}
                className="flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 text-xs font-bold text-foreground/60 hover:bg-card-border/20 transition-all"
              >
                <Edit className="h-3 w-3" /> Edit
              </button>
              <div className="h-6 w-px bg-card-border/50 mx-1" />
              <button
                onClick={() => onApprove(item.id, 'reject')}
                className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => onApprove(item.id, 'approve')}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-primary-hover transition-all"
              >
                Approve
              </button>
            </div>
          ) : (
            <>
               <button
                onClick={() => onEdit(item)}
                className="flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 text-xs font-bold text-foreground/60 hover:bg-card-border/20 transition-all"
              >
                <Edit className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

