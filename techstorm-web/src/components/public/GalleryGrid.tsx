"use client";
import { useState } from "react";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

interface GalleryGridProps {
  initialItems: any[];
}

export default function GalleryGrid({ initialItems }: GalleryGridProps) {
  const [filter, setFilter] = useState("all");
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const filteredItems = filter === "all" 
    ? initialItems 
    : initialItems.filter(item => item.category === filter);

  return (
    <>
      <section className="container mx-auto px-5 pb-20">
        <Reveal width="100%">
            <div className="flex justify-center flex-wrap gap-3 mb-12">
                {["all", "events", "mentors", "volunteers"].map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full font-medium transition-all border-2 ${
                            filter === cat 
                            ? 'bg-brand-teal border-brand-teal text-white shadow-md' 
                            : 'border-slate-200 text-text-gray hover:border-brand-teal hover:text-brand-teal'
                        }`}
                    >
                        {cat === 'all' ? 'All Impactors' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>
        </Reveal>

        {initialItems.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400">No photos in the gallery yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                    <Reveal key={item.id} width="100%" delay={index * 100}>
                        <div 
                            className="group relative min-h-[350px] rounded-2xl overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] bg-slate-100"
                            onClick={() => setSelectedImg(item.url)}
                        >
                            <Image 
                                src={item.url} 
                                alt={item.title || "Gallery"} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h4 className="text-brand-amber font-bold text-lg mb-1">{item.title}</h4>
                                <p className="text-white/90 text-sm">{item.description}</p>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        )}
      </section>

      {/* LIGHTBOX */}
      {selectedImg && (
        <div 
            className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-5 animate-in fade-in duration-300"
            onClick={() => setSelectedImg(null)}
        >
            <button className="absolute top-10 right-10 text-white text-4xl hover:text-brand-amber transition-colors">
                <i className="fas fa-times"></i>
            </button>
            <div className="relative w-full max-w-5xl h-[80vh]">
                <Image 
                    src={selectedImg} 
                    alt="Lightbox image" 
                    fill 
                    className="object-contain"
                />
            </div>
        </div>
      )}
    </>
  );
}
