"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface FileUploaderProps {
  label?: string;
  bucket?: string;
  accept?: string;
  onUploadComplete: (url: string, fileData: any) => void;
  defaultValue?: string;
}

export default function FileUploader({ 
  label = "Upload File", 
  bucket = "course-content", 
  accept = "*", 
  onUploadComplete,
  defaultValue
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(defaultValue || null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFileUrl(data.url);
      setFileName(data.name);
      onUploadComplete(data.url, {
        name: data.name,
        type: data.type,
        size: data.size
      });
      toast.success("Upload successful!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      
      <div className="flex flex-col gap-2">
        <label className={`
          flex items-center justify-center gap-2 px-4 py-8 rounded-lg border-2 border-dashed border-slate-300 
          cursor-pointer hover:bg-slate-50 hover:border-brand-teal transition-all group
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}>
          <input 
            type="file" 
            className="hidden" 
            accept={accept}
            onChange={handleUpload}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-brand-teal text-2xl mb-2"></i>
              <p className="text-sm text-slate-500">Uploading...</p>
            </div>
          ) : (
            <div className="text-center">
              <i className="fas fa-cloud-upload-alt text-slate-400 text-3xl mb-2 group-hover:text-brand-teal transition-colors"></i>
              <p className="text-sm font-medium text-slate-600">Click to choose a file</p>
              <p className="text-xs text-slate-400 mt-1">{accept === '*' ? 'Any file type' : accept.replace(/,/g, ', ')}</p>
            </div>
          )}
        </label>

        {fileUrl && (
          <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-2">
             <div className="flex items-center gap-2 overflow-hidden">
                <i className="fas fa-check-circle text-green-600 flex-shrink-0"></i>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-green-800 truncate">{fileName || "Uploaded File"}</p>
                    <p className="text-xs text-green-600 truncate">{fileUrl}</p>
                </div>
             </div>
             <a 
                href={fileUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-bold text-green-700 bg-green-200 px-3 py-1 rounded hover:bg-green-300 transition-colors ml-2"
            >
                View
             </a>
          </div>
        )}
      </div>
    </div>
  );
}
