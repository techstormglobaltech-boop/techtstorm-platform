import { Reveal } from "@/components/new-ui/Reveal";
import { getPublishedCourses } from "@/app/actions/public-course";
import CourseList from "@/components/public/CourseList";
import Image from "next/image";
import Link from "next/link";
import { LiquidGlassButton } from "@/components/new-ui/LiquidGlassButton";

export const metadata = {
  title: "TechStorm | Explore Courses",
  description: "Browse our extensive catalog of tech courses.",
};

export default async function Courses() {
  const courses = await getPublishedCourses();

  return (
    <>
      {/* Client Component for Interactive Grid & Search */}
      <CourseList initialCourses={courses} />

      <section className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
        <Reveal>
          <div className="liquid-glass-panel rounded-3xl p-8 lg:p-12 border border-white relative shadow-lg">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-primary uppercase tracking-widest font-code-snippet block mb-2">Pedagogical Framework</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">How Learning Works Here</h2>
              <p className="font-body-md text-body-md text-text-muted mt-2">
                Engineered to overcome passive tutorial viewing with intense hands-on execution and personalized senior mentorship.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-start bg-surface-canvas/70 p-6 rounded-2xl border border-border-subtle/80 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                  01
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-semibold">Project-First Sprints</h3>
                <p className="font-body-sm text-body-sm text-text-muted leading-relaxed">
                  Forget toy tutorial demos. Every module requires shipping complete repositories that solve genuine industrial, commercial, or agricultural challenges in Africa.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-start bg-surface-canvas/70 p-6 rounded-2xl border border-border-subtle/80 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed/60 text-secondary flex items-center justify-center font-bold text-lg mb-4">
                  02
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-semibold">Weekly 1-on-1 Code Audits</h3>
                <p className="font-body-sm text-body-sm text-text-muted leading-relaxed">
                  Direct video calls with senior engineers. Receive line-by-line pull request audits, architectural refactoring tips, and industry interview preparation.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-start bg-surface-canvas/70 p-6 rounded-2xl border border-border-subtle/80 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/70 text-tertiary flex items-center justify-center font-bold text-lg mb-4">
                  03
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-semibold">Demo Day & Employer Connect</h3>
                <p className="font-body-sm text-body-sm text-text-muted leading-relaxed">
                  Pitch capstone software to hiring managers, venture labs, and startup founders across Accra, Nairobi, Lagos, and international remote teams.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 7. INTERACTIVE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-6 mb-20 relative z-10">
        <Reveal>
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-primary uppercase tracking-widest font-code-snippet block mb-1">Frequently Asked Questions</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Got Questions? We&apos;ve Got Answers</h2>
          </div>
          
          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group liquid-glass-panel rounded-2xl p-5 border border-white/90 open:bg-surface-canvas/90 transition-all cursor-pointer">
              <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-on-surface list-none select-none font-semibold">
                <span>Who are these courses designed for?</span>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-200">expand_more</span>
              </summary>
              <p className="font-body-md text-body-md text-on-surface-variant mt-4 pt-3 border-t border-border-subtle leading-relaxed">
                TechStorm tracks are built for university undergraduates, junior developers, transitioning STEM professionals, and motivated self-taught learners across Africa who want practical, production-level software mastery and direct mentorship rather than abstract theory.
              </p>
            </details>
            
            {/* FAQ 2 */}
            <details className="group liquid-glass-panel rounded-2xl p-5 border border-white/90 open:bg-surface-canvas/90 transition-all cursor-pointer">
              <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-on-surface list-none select-none font-semibold">
                <span>How does the GH₵15–35 pricing model work?</span>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-200">expand_more</span>
              </summary>
              <p className="font-body-md text-body-md text-on-surface-variant mt-4 pt-3 border-t border-border-subtle leading-relaxed">
                Through our endowment partners and alumni-backed educational subsidies, we intentionally keep admission costs nominal so financial barriers never restrict talented African developers. Your fee covers repository hosting, community access, and mentor stipends.
              </p>
            </details>
            
            {/* FAQ 3 */}
            <details className="group liquid-glass-panel rounded-2xl p-5 border border-white/90 open:bg-surface-canvas/90 transition-all cursor-pointer">
              <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-on-surface list-none select-none font-semibold">
                <span>Are full scholarships available for students in Ghana?</span>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-200">expand_more</span>
              </summary>
              <p className="font-body-md text-body-md text-on-surface-variant mt-4 pt-3 border-t border-border-subtle leading-relaxed">
                Yes! If you are currently enrolled in a tertiary institution or facing financial hardship, you can select the "Need-based Scholarship Application" during checkout for a 100% fee waiver and hardware grant assistance.
              </p>
            </details>
            
            {/* FAQ 4 */}
            <details className="group liquid-glass-panel rounded-2xl p-5 border border-white/90 open:bg-surface-canvas/90 transition-all cursor-pointer">
              <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-on-surface list-none select-none font-semibold">
                <span>Do I receive a certificate and portfolio verification?</span>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-200">expand_more</span>
              </summary>
              <p className="font-body-md text-body-md text-on-surface-variant mt-4 pt-3 border-t border-border-subtle leading-relaxed">
                Yes. Upon successfully defending your capstone project before your mentor, you receive a cryptographically verified TechStorm Global completion credential linked directly to your GitHub repository and public alumni profile.
              </p>
            </details>
          </div>
        </Reveal>
      </section>

      {/* 8. ACCELERATION CTA GLASS CARD */}
      <section className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
        <Reveal>
          <div className="liquid-glass-panel rounded-3xl p-8 lg:p-12 border border-white shadow-xl relative overflow-hidden text-center bg-gradient-to-b from-white/90 to-surface-container-high/40">
            <div className="max-w-3xl mx-auto relative z-10">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4 font-code-snippet">
                Accra Hub • Remote Global Cohorts
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-4">
                Ready to Build Your Engineering Career?
              </h2>
              <p className="font-body-lg text-body-lg text-text-muted mb-8 leading-relaxed">
                Join over 1,200 aspiring African developers and data scientists building real software, solving local challenges, and connecting with global tech employers.
              </p>
              
              {/* Newsletter & Community Form */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                <input 
                  className="w-full px-4 py-3 bg-surface-canvas border border-border-subtle rounded-xl text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" 
                  placeholder="Enter your email for syllabus updates..." 
                  type="email"
                />
                <LiquidGlassButton className="w-full sm:w-auto px-6 py-3 !text-label-md !font-label-md" variant="panel">
                  Apply Now
                </LiquidGlassButton>
              </div>
              <p className="text-xs text-text-muted mt-4">
                Cohort 8 applications close Friday. No credit card required to submit application.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
