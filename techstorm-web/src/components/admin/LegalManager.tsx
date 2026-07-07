"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

export default function LegalManager({ token }: { token?: string }) {
  const [activeTab, setActiveTab] = useState<"PRIVACY_POLICY" | "TERMS_OF_SERVICE">("PRIVACY_POLICY");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchDocument(activeTab);
  }, [activeTab]);

  const fetchDocument = async (type: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/legal/${type}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || "");
        setContent(data.content || "");
        setLastUpdated(data.updatedAt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/legal/${activeTab}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title, content })
      });

      if (res.ok) {
        const updated = await res.json();
        setLastUpdated(updated.updatedAt);
        alert("Document saved successfully.");
      } else {
        alert("Failed to save document.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving document.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex border-b border-slate-100 bg-slate-50">
        <button 
          onClick={() => setActiveTab("PRIVACY_POLICY")}
          className={`flex-1 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "PRIVACY_POLICY" ? "border-brand-teal text-brand-teal bg-white" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Privacy Policy
        </button>
        <button 
          onClick={() => setActiveTab("TERMS_OF_SERVICE")}
          className={`flex-1 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "TERMS_OF_SERVICE" ? "border-brand-teal text-brand-teal bg-white" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Terms of Service
        </button>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-4 text-brand-teal"></i>
            <p>Loading document...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="w-2/3">
                <label className="block text-sm font-bold text-slate-700 mb-2">Document Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal bg-slate-50 hover:bg-white transition-all text-lg font-medium text-brand-dark"
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-brand-teal text-white rounded-xl font-bold hover:bg-[#006066] focus:outline-none focus:ring-4 focus:ring-brand-teal/20 transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                ) : (
                  <><i className="fas fa-save"></i> Save Changes</>
                )}
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Document Content (Markdown)</label>
                {lastUpdated && (
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                    <i className="fas fa-clock mr-1"></i> Last updated: {new Date(lastUpdated).toLocaleString()}
                  </span>
                )}
              </div>
              <div data-color-mode="light" className="rounded-xl overflow-hidden border border-slate-200 focus-within:ring-4 focus-within:ring-brand-teal/10 focus-within:border-brand-teal transition-all">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  height={600}
                  previewOptions={{
                    className: "prose prose-slate max-w-none"
                  }}
                  style={{ border: 'none', boxShadow: 'none' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
