"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealHero, StaggerContainer, StaggerItem } from "@/components/new-ui/Reveal";
import { useSearchParams } from "next/navigation";
import { LiquidGlassButton } from "@/components/new-ui/LiquidGlassButton";

interface CourseListProps {
  initialCourses: any[];
}

export default function CourseList({ initialCourses }: CourseListProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(categoryParam || "All Tracks");
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    if (categoryParam && categoryParam !== filterCategory) {
      setFilterCategory(categoryParam);
    }
  }, [categoryParam]); // Sync if URL changes later

  const filteredCourses = initialCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const courseCat = course.category || "Uncategorized";
    const matchesCategory = filterCategory === "All Tracks" || courseCat === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories dynamically
  const dynamicCategories = Array.from(new Set(initialCourses.map(c => c.category || "Uncategorized")));
  const categories = ["All Tracks", ...dynamicCategories];

  return (
    <>
      {/* 2. HERO BANNER WITH LIQUID SEARCH CAPSULE */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 text-center relative z-10">
        <RevealHero>

          {/* Main Headline */}
          <h1 className="font-display-hero text-display-hero text-on-surface max-w-4xl mx-auto tracking-tight mb-4">
            Industry-Calibrated Tech Courses Built for Tomorrow&apos;s Leaders
          </h1>
          
          {/* Subheadline */}
          <p className="font-body-lg text-body-lg text-text-muted max-w-3xl mx-auto leading-relaxed mb-10">
            Master practical Computer Vision, Data Science, and Production Software Engineering with 1-on-1 mentorship from industry veterans across Africa and the world.
          </p>
        </RevealHero>
        
        {/* Floating Liquid Glass Search & Filter Capsule */}
        <Reveal delay={0.2}>
          <div className="max-w-4xl mx-auto liquid-glass-panel rounded-2xl p-2.5 shadow-xl border border-white/90">
            <div className="flex flex-col md:flex-row items-center gap-2">
              {/* Search Input */}
              <div className="relative flex-1 w-full text-left">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-surface-canvas/90 border border-border-subtle rounded-xl text-on-surface font-body-sm text-body-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150" 
                  placeholder="Search courses, skills, or frameworks..." 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Track Dropdown */}
              <div className="relative w-full md:w-48 text-left">
                <select 
                  className="w-full appearance-none pl-3.5 pr-8 py-3 bg-surface-canvas/90 border border-border-subtle rounded-xl text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map((cat: any) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
              </div>
              
              {/* Level Selector */}
              <div className="relative w-full md:w-40 text-left">
                <select className="w-full appearance-none pl-3.5 pr-8 py-3 bg-surface-canvas/90 border border-border-subtle rounded-xl text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option>All Levels</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">tune</span>
              </div>
              
              {/* Search Action Button */}
              <LiquidGlassButton 
                glow 
                variant="primary"
                className="w-full md:w-auto !py-3"
              >
                <span>Find Course</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </LiquidGlassButton>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. CATEGORY FILTER TABS */}
      <section className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
        <Reveal delay={0.3}>
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat: any) => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-all active:scale-95 shadow-sm ${
                  filterCategory === cat 
                  ? 'bg-primary text-white' 
                  : 'liquid-glass-subtle text-on-surface border border-white/80 hover:border-primary/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      
      {/* 4. DYNAMIC FLAGSHIP SPOTLIGHT */}
      {selectedCourse && (
        <section className="max-w-7xl mx-auto px-6 mb-16 relative z-10" id="spotlight">
          <Reveal>
            <div className="liquid-glass-panel rounded-3xl p-8 lg:p-10 border border-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 ambient-glow-teal rounded-full pointer-events-none -mr-20 -mt-20"></div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                <div className="lg:col-span-7 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Flagship Intensive
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary-fixed/50 text-on-secondary-fixed-variant">
                        {selectedCourse.level || "Intermediate to Advanced"}
                      </span>
                    </div>
                    
                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3 tracking-tight">
                      {selectedCourse.title}
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed line-clamp-4">
                      {selectedCourse.description || "Design, train, and deploy real-time software systems. Master practical concepts with 1-on-1 mentorship."}
                    </p>
                    
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface-canvas/60 border border-border-subtle/60 w-fit mb-6">
                      <div className="relative w-12 h-12">
                        {selectedCourse.instructor?.image ? (
                          <Image className="rounded-full object-cover border-2 border-secondary-container" alt={selectedCourse.instructor?.name || "Mentor"} fill src={selectedCourse.instructor.image} />
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {(selectedCourse.instructor?.name || "T")[0]}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-emerald rounded-full border-2 border-white" title="Verified Senior Fellow"></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">{selectedCourse.instructor?.name || "TechStorm Core Mentors"}</span>
                          <span className="font-label-sm text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Lead Instructor</span>
                        </div>
                        <p className="text-xs text-text-muted">{selectedCourse.instructor?.bio || "Lead Educator, TechStorm Global"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-border-subtle/80 flex flex-wrap items-center justify-between gap-4 mt-auto">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-headline-md text-headline-md text-on-surface font-bold">GH₵{selectedCourse.price || "0.00"}</span>
                        <span className="text-xs text-text-muted font-normal">/ lifetime access</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <LiquidGlassButton href={`/courses/${selectedCourse.id}`} variant="primary" className="!text-label-md !font-label-md">
                        Enroll Now
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </LiquidGlassButton>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-5 bg-surface-canvas/90 rounded-2xl p-6 border border-border-subtle/80 shadow-sm flex flex-col h-full">
                  {selectedCourse.image ? (
                    <div className="relative w-full h-48 rounded-xl mb-6 overflow-hidden">
                      <Image src={selectedCourse.image} alt={selectedCourse.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="relative w-full h-48 rounded-xl mb-6 bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-primary/40">image</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Curriculum Blueprint</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="p-2.5 rounded-lg bg-surface-muted">
                      <span className="block font-bold text-sm text-on-surface">3 Live Sessions</span>
                      <span className="text-[11px] text-text-muted">Per Week • Evening UTC</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-muted">
                      <span className="block font-bold text-sm text-on-surface">1-on-1 Code Review</span>
                      <span className="text-[11px] text-text-muted">Mentor Code Audit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* 5. COMPREHENSIVE COURSE GRID */}

      <section className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
        <Reveal delay={0.4}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-primary tracking-wider uppercase font-code-snippet block mb-1">Certified Learning Tracks</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Explore Cohort Curriculum</h2>
            </div>
            <p className="text-body-sm font-body-sm text-text-muted max-w-md mt-2 md:mt-0">
              Every course includes structured source code repositories, weekly live debugging office hours, and verified certificate credentials.
            </p>
          </div>
        </Reveal>

        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <StaggerItem key={course.id}>
                <div className="liquid-glass-panel rounded-2xl p-6 border border-white/90 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group hover:shadow-lg h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary-fixed/60 text-on-tertiary-fixed-variant">
                        {course.category || "General Track"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <span className="material-symbols-outlined text-amber-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        4.9 (88)
                      </div>
                    </div>
                    
                    
                    <div onClick={() => {
                        setSelectedCourse(course);
                        setTimeout(() => {
                          document.getElementById('spotlight')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }} className="cursor-pointer">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    
                    <div className="relative h-40 rounded-xl bg-slate-100 mb-4 overflow-hidden shadow-sm">
                      {course.image ? (
                        <Image src={course.image} alt={course.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface-subtle">
                          <span className="material-symbols-outlined text-4xl">image</span>
                        </div>
                      )}
                    </div>

                    {/* Faculty */}
                    <div className="flex items-center gap-2 mb-4 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-outline text-[16px]">school</span>
                      <span>{course.instructor?.name || "TechStorm Core Mentors"}</span>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-xl bg-surface-subtle mb-4 text-xs">
                      <div><span className="text-text-muted">Modules:</span> <span className="font-semibold text-on-surface">{course._count?.modules || 0}</span></div>
                      <div><span className="text-text-muted">Projects:</span> <span className="font-semibold text-on-surface">3 Real Datasets</span></div>
                    </div>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      <span className="text-[11px] font-code-snippet px-2 py-0.5 rounded bg-surface-muted text-on-surface">Python</span>
                      <span className="text-[11px] font-code-snippet px-2 py-0.5 rounded bg-surface-muted text-on-surface">Git</span>
                      <span className="text-[11px] font-code-snippet px-2 py-0.5 rounded bg-surface-muted text-on-surface">Cloud</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-xs text-text-muted block">Enrolment Fee</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        {course.price ? `GH₵${course.price}` : "Free"}
                      </span>
                    </div>
                    <LiquidGlassButton 
                      onClick={() => {
                        setSelectedCourse(course);
                        setTimeout(() => {
                          document.getElementById('spotlight')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="px-4 py-2 !text-label-md !font-label-md"
                    >
                      View Course
                    </LiquidGlassButton>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-20 relative z-10">
              <div className="text-6xl text-slate-200 mb-4"><span className="material-symbols-outlined text-6xl">search_off</span></div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">No courses found</h3>
              <p className="text-body-sm font-body-sm text-text-muted">Try adjusting your search or filters.</p>
          </div>
        )}
      </section>
    </>
  );
}
