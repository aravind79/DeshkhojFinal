"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function BulkImportPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState<{ total: number; imported: number; failed: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
    }
  }, [router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
      setStatus("idle");
    } else {
      setErrorMsg("Please upload only CSV files (.csv)");
      setStatus("error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");

    const token = localStorage.getItem("admin_token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/import`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStats(data.data);
        setStatus("success");
      } else {
        throw new Error(data.message || "Import failed");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload and process file");
      setStatus("error");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
      <button 
        onClick={() => router.push("/admin/dashboard")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bulk Import Business Data</h1>
        <p className="mt-2 text-foreground/70">Upload a CSV file to bulk register businesses into the directory.</p>
        <p className="mt-1 text-xs text-foreground/40 font-mono">Required Headers: dukaan_name, dukaan_addr, dukaandar_name, contact_no, dukaan_desc, email, shop_categories</p>
      </div>

      <div className="rounded-3xl border border-card-border bg-card-bg p-8 shadow-xl">
        <div 
          className={`relative flex min-h-[350px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-card-border bg-background hover:bg-card-bg/30'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv" onChange={handleChange} className="hidden" />
          
          <AnimatePresence mode="wait">
            {!file && status !== "error" && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div className="mb-5 rounded-3xl bg-primary/10 p-5">
                  <UploadCloud className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Click or Drag & Drop to Upload</h3>
                <p className="mt-3 max-w-xs text-sm text-foreground/60 leading-relaxed">CSV files only. Make sure headers exactly match the requirements. Maximum file size 10MB.</p>
              </motion.div>
            )}

            {file && status === "idle" && (
              <motion.div key="selected" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="mb-5 rounded-3xl bg-primary/20 p-5">
                  <FileSpreadsheet className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{file.name}</h3>
                <p className="mt-1 text-sm text-foreground/60 text-emerald-500 font-bold font-mono">Ready for processing</p>
                <div className="mt-8 flex gap-4">
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="rounded-xl border border-card-border bg-card-bg px-6 py-3 text-sm font-bold text-foreground hover:bg-card-border/50 transition-all">Cancel</button>
                  <button onClick={(e) => { e.stopPropagation(); handleUpload(); }} className="rounded-xl bg-primary px-10 py-3 text-sm font-bold text-white shadow-lg hover:shadow-primary/20 hover:bg-primary-hover transition-all">Start Processing</button>
                </div>
              </motion.div>
            )}

            {status === "uploading" && (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="mb-8 relative">
                   <div className="h-20 w-20 animate-spin rounded-full border-[5px] border-card-border border-t-primary" />
                   <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Importing {file?.name}...</h3>
                <p className="mt-2 text-sm text-foreground/60 animate-bounce">Please do not close this window</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="mb-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-5">
                  <CheckCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">Import Successful!</h3>
                <div className="mt-6 grid grid-cols-3 gap-8 rounded-2xl bg-background p-6">
                    <div className="text-center">
                        <p className="text-xs font-bold text-foreground/40 uppercase">Found</p>
                        <p className="text-2xl font-black text-foreground">{stats?.total}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-foreground/40 uppercase">Imported</p>
                        <p className="text-2xl font-black text-emerald-500">{stats?.imported}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-foreground/40 uppercase">Failed</p>
                        <p className="text-2xl font-black text-red-500">{stats?.failed}</p>
                    </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setStatus("idle"); }} 
                  className="mt-8 rounded-xl bg-foreground text-card-bg px-8 py-3 text-sm font-bold transition-all hover:scale-105"
                >
                  Import Another File
                </button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div key="error" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="mb-5 rounded-full bg-red-100 dark:bg-red-900/40 p-5">
                  <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-600">Import Failed</h3>
                <p className="mt-3 text-sm text-foreground/70 max-w-xs">{errorMsg}</p>
                <button onClick={(e) => { e.stopPropagation(); setStatus("idle"); setFile(null); }} className="mt-8 rounded-xl border border-card-border bg-card-bg px-8 py-3 text-sm font-bold hover:bg-card-border/50">Try Again</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
