"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { useSearchParams } from "next/navigation";

interface CourseListProps {
  initialCourses: any[];
}

export default function CourseList({ initialCourses }: CourseListProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(categoryParam || "All");

  useEffect(() => {
    if (categoryParam && categoryParam !== filterCategory) {
      setFilterCategory(categoryParam);
    }
  }, [categoryParam]); // Sync if URL changes later

  const filteredCourses = initialCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || (course.category || "Uncategorized") === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories dynamically
  const categories = ["All", ...Array.from(new Set(initialCourses.map(c => c.category || "Uncategorized")))];

  return (
    <>
      {/* FILTER BAR */}
      <div className="container mx-auto px-5 -mt-8 relative z-10">
        <Reveal delay={300} width="100%">
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center border border-slate-100">
                <div className="relative w-full md:flex-1">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search for Python, Data Science, AI..." 
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {categories.map((cat: any) => (
                        <button 
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-5 py-2.5 rounded-lg font-medium border transition-all whitespace-nowrap ${
                                filterCategory === cat 
                                ? 'bg-brand-teal border-brand-teal text-white' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-brand-teal hover:text-brand-teal'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </Reveal>
      </div>

      {/* COURSE GRID */}
      <section className="py-20 bg-light-bg min-h-screen">
        <div className="container mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, index) => (
                    <Reveal key={course.id} width="100%" delay={index * 100}>
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col h-full group">
                            <div className="relative h-48 bg-slate-200">
                                {course.image ? (
                                    <Image src={course.image} alt={course.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <i className="fas fa-image text-4xl"></i>
                                    </div>
                                )}
                                <span className="absolute top-4 left-4 bg-brand-amber text-brand-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                                    {course.category || "General"}
                                </span>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                    <i className="fas fa-user-circle text-brand-teal"></i> {course.instructor?.name || "TechStorm Mentor"}
                                </div>
                                <h3 className="text-lg font-bold text-brand-dark mb-4 leading-snug group-hover:text-brand-teal transition-colors">
                                    {course.title}
                                </h3>
                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500 mb-6">
                                    <span><i className="fas fa-layer-group text-slate-400 mr-1"></i> {course._count?.modules || 0} Modules</span>
                                    {/* <span className="flex items-center gap-1"><i className="fas fa-star text-brand-amber"></i> 4.8</span> */}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-brand-teal">{course.price ? `GH₵${course.price}` : "Free"}</span>
                                    <Link href={`/courses/${course.id}`} className="text-brand-dark font-semibold text-sm hover:text-brand-teal transition-colors flex items-center gap-1">
                                        View Details <i className="fas fa-arrow-right text-xs"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
            
            {filteredCourses.length === 0 && (
                <div className="text-center py-20">
                    <div className="text-6xl text-slate-200 mb-4"><i className="fas fa-search"></i></div>
                    <h3 className="text-xl font-bold text-slate-600">No courses found</h3>
                    <p className="text-slate-400">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
      </section>
    </>
  );
}
