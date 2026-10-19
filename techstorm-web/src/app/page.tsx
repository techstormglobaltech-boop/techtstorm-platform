import GlassNavbar from "@/components/new-ui/GlassNavbar";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/new-ui/Footer";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/api-client";
import { LiquidGlassButton } from '@/components/new-ui/LiquidGlassButton';
import {
  Reveal,
  RevealHero,
  StaggerContainer,
  StaggerItem,
} from "@/components/new-ui/Reveal";

export default async function NewLandingPage() {
  const session = await auth();
  const user = session?.user;

  let homeData: any = {
    courses: [],
    events: [],
    testimonials: [],
    stats: null,
  };
  try {
    homeData = await fetchApi("/public/home", { next: { revalidate: 60 } });
  } catch (error) {
    console.error("Failed to fetch home data", error);
  }

  const { courses = [], events = [], testimonials = [], stats } = homeData;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-background">
      <GlassNavbar user={user} />

      <main>
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10">
          {/* Ambient Flyer Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/flyer.jpeg"
              alt="TechStorm Ambient Background"
              fill
              className="object-cover object-center scale-110 opacity-80 dark:opacity-60 filter blur-3xl saturate-150"
              priority
            />
            <div className="absolute inset-0 bg-white/70 dark:bg-[#020617]/85 backdrop-blur-2xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <RevealHero>
                  <h1 className="font-display-hero-mobile md:font-display-hero text-display-hero-mobile md:text-display-hero text-slate-900 dark:text-slate-50 tracking-tight mb-6">
                    Building the Future Together Through{" "}
                    <span className="text-primary underline decoration-secondary decoration-wavy decoration-2 underline-offset-8">
                      Tech Mentorship
                    </span>
                  </h1>
                </RevealHero>

                <Reveal delay={0.2}>
                  <p className="font-body-lg text-body-lg text-slate-500 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
                    Join TechStorm Global to connect with industry experts in
                    AI, Data Science, and Software Engineering. Empowering the
                    next generation of tech leaders across Africa and beyond.
                  </p>
                </Reveal>

                <Reveal delay={0.3}>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                    <LiquidGlassButton
                      href="#featured-courses"
                      variant="primary"
                      glow
                    >
                      <span className="">Explore Courses &amp; Mentorship</span>
                      <span
                        className="material-symbols-outlined ml-2 text-xl"
                        data-icon="school"
                      >
                        school
                      </span>
                    </LiquidGlassButton>
                    <LiquidGlassButton
                      href="#how-it-works"
                      variant="subtle"
                    >
                      <span className="">How It Works</span>
                      <span
                        className="material-symbols-outlined ml-1.5 text-lg"
                        data-icon="north_east"
                      >
                        north_east
                      </span>
                    </LiquidGlassButton>
                  </div>
                </Reveal>

                <div className="pt-6 border-t border-slate-200 dark:border-white/10 w-full flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex -space-x-3 items-center">
                    <img
                      className="w-10 h-10 rounded-full border-2 border-surface-canvas object-cover ring-1 ring-border-subtle"
                      data-alt="Close-up headshot of a young African woman smiling brightly in a tech lab setting, warm daylight illumination, representing a student learner in Accra."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmn3MwhUXN2s5OEb7gthgdR1zjTCA51f4yrw8Moq8GU6smSSPfYHc_tgxundNPKoAJdCQTVBo_VR1Qw8jOVVpIwbfEpahW0PC6s-SgtS29TQac0t0rfHvJ2UA1Cvk3Hz4TwXOrskaox5aIB-eh978b0ink9qsQwi8dhy4qjCaOtj4IX3gM749TJUOkYu3HdbKxOgmBjOxet2VDzVdmBk87Jqi6fuHdxu3OoZA4VyoK"
                    />
                    <img
                      className="w-10 h-10 rounded-full border-2 border-surface-canvas object-cover ring-1 ring-border-subtle"
                      data-alt="Portrait of an African male software developer in a modern creative workspace with subtle ambient lighting, confident and focused expression."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUyWDku-EGDKmFq7FF9334a0K_Cw-Lxxb0UV39dmVC3o_aiMR-8Er2HP7ZIEgrSP7EPOS9X1JA_2JwJx7pYIrpmsivRq-3sIHqsBvtlQJ30Hovyg5b5uPeDZ6xgs6n4eJDbmOWk7dyTsIt13CyBKb5mr4fE1_eixxOteVjpLEdhUrGUcCGSfSoOqh5PD3bG5MemjNJK2I9-_MdZ8k3N9Ra9dnVjWQFLpFPQ86KL4Jd"
                    />
                    <img
                      className="w-10 h-10 rounded-full border-2 border-surface-canvas object-cover ring-1 ring-border-subtle"
                      data-alt="Professional studio portrait of an African woman data scientist wearing glasses, crisp lighting, high key clean background aesthetic."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrVTrk-0dMYxpR334KWU546fyh2mVEa0jyAYOxawOXMFnk3pRp_P6pbFLAeKIzanPQx_CGveZXPGzvYBAK73wqFxsKsOyuUla_Rxu4wu8vEyAB82xAKQrGak44SeTICwsjtbW9fsuI8Tp2kXtwVObvsKecctO6mF8mngTURm701iiYTDbYUV75_obMTgUFN--RSZUrQIJLE64Ley4XYd7SdGFzla5SlKj5cixgfTZQ"
                    />
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface-canvas flex items-center justify-center text-label-sm font-label-sm font-bold text-primary">
                      +6
                    </div>
                  </div>
                  <div className="text-label-sm font-label-sm">
                    <div className="flex items-center gap-1 text-secondary">
                      <span
                        className="material-symbols-outlined text-base fill-1"
                        data-icon="star"
                        data-weight="fill"
                      >
                        star
                      </span>
                      <span
                        className="material-symbols-outlined text-base fill-1"
                        data-icon="star"
                        data-weight="fill"
                      >
                        star
                      </span>
                      <span
                        className="material-symbols-outlined text-base fill-1"
                        data-icon="star"
                        data-weight="fill"
                      >
                        star
                      </span>
                      <span
                        className="material-symbols-outlined text-base fill-1"
                        data-icon="star"
                        data-weight="fill"
                      >
                        star
                      </span>
                      <span
                        className="material-symbols-outlined text-base fill-1"
                        data-icon="star"
                        data-weight="fill"
                      >
                        star
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-50 ml-1">
                        4.9/5 Rating
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Joined by ambitious students &amp; professionals across
                      West Africa
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="absolute -inset-4 bg-slate-50 dark:bg-[#0f172a] rounded-3xl filter blur-2xl -z-10"></div>
                <div className="backdrop-blur-2xl bg-white/70 dark:bg-white/5 rounded-2xl border border-white/80 dark:border-white/10 shadow-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md px-4 py-3 border-b border-white/60 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#ef4444]/80 shadow-xs"></span>
                      <span className="w-3 h-3 rounded-full bg-[#f59e0b]/80 shadow-xs"></span>
                      <span className="w-3 h-3 rounded-full bg-[#10b981]/80 shadow-xs"></span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-2">
                        techstorm-lab // session-01
                      </span>
                    </div>
                  </div>

                  <div className="p-5 border-b border-white/60 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary shadow-sm"
                            data-alt="Portrait of precious lead AI researcher and mentor at TechStorm Global, smiling warmly with professional studio illumination against clean architectural backdrop."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRsWOuSqKPGXMTgKX-EuS1knxq3cbxk8_MCQPM0S9pfY1tzDBS-jdkLUEojJPMbX76-MMiuKAjZek_es9Ix_tATdDSArq5jhohGq1AY7RIirkGjJ3Yx_bbZIC3MnE9wjRWf1FY2l2wvDOL2XLI1RA3UMZw0xP1sXqqEKeZsY6uODIiKz-5-1eugKoCWVd8SFXLaWX-ocByL8VjVODRyHwm9iBoVKTzwj8-TN134LZC"
                          />
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-accent-emerald border-2 border-surface-canvas rounded-full"></span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline-sm text-headline-sm text-sm font-bold text-slate-900 dark:text-slate-50">
                              Precious
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 backdrop-blur-xs">
                              Lead AI Researcher
                            </span>
                          </div>
                          <p className="text-label-sm font-label-sm text-slate-500 dark:text-slate-400">
                            1-on-1 Code Review: YOLOv8 Object Tracking
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1">
                        <span className="px-2.5 py-1 bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/5 text-slate-900 dark:text-slate-50 text-xs rounded-md font-mono font-medium shadow-xs">
                          00:42:19
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-inverse-surface/95 backdrop-blur-md text-inverse-on-surface border-y border-white/10">
                    <div className="flex items-center justify-between text-xs text-outline-variant mb-2">
                      <span className="font-code-snippet text-code-snippet">
                        edge_detector.py
                      </span>
                      <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-primary-fixed border border-white/10">
                        Python 3.11 + OpenCV
                      </span>
                    </div>
                    <pre className="font-code-snippet text-code-snippet text-xs leading-relaxed overflow-x-auto text-[#cbd5e1]">
                      <span className="text-primary-fixed">import</span> cv2
                      <span className="text-primary-fixed">from</span>{" "}
                      ultralytics{" "}
                      <span className="text-primary-fixed">import</span> YOLO
                      model = YOLO(
                      <span className="text-secondary-fixed">"yolov8n.pt"</span>
                      ) cap = cv2.VideoCapture(0)
                      <span className="text-[#94a3b8]">
                        # Real-time African AgTech pipeline
                      </span>
                      <span className="text-primary-fixed">while</span>{" "}
                      cap.isOpened(): success, frame = cap.read() results =
                      model.track(frame, persist=
                      <span className="text-secondary-fixed">True</span>)
                      cv2.imshow(
                      <span className="text-secondary-fixed">
                        "TechStorm Vision Stream"
                      </span>
                      , results[0].plot())
                    </pre>
                  </div>

                  <div className="p-4 bg-white/60 dark:bg-white/5 backdrop-blur-md flex items-center justify-between gap-4">
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-900 dark:text-slate-50">
                          Capstone Milestone Progress
                        </span>
                        <span className="text-primary font-bold">
                          85% Completed
                        </span>
                      </div>
                      <div className="w-full h-2 bg-border-subtle/80 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-primary h-full rounded-full transition-all duration-500 shadow-xs"></div>
                      </div>
                    </div>
                    <LiquidGlassButton variant="subtle" glow className="!px-3 !py-1.5 !text-xs !rounded-md">
                      <span className="">Verify</span>
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="check_circle"
                      >
                        check_circle
                      </span>
                    </LiquidGlassButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <StaggerContainer>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                <StaggerItem>
                  <div className="p-6 rounded-2xl bg-white/65 dark:bg-white/5 backdrop-blur-lg border border-white/80 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 group ring-1 ring-black/5 dark:ring-white/10">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                      <span
                        className="material-symbols-outlined text-2xl"
                        data-icon="group"
                      >
                        group
                      </span>
                    </div>
                    <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 font-extrabold mb-1">
                      6+
                    </h3>
                    <p className="font-label-md text-label-md font-bold text-slate-900 dark:text-slate-50">
                      Active Learners
                    </p>
                    <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 mt-1">
                      Growing every single day
                    </p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-6 rounded-2xl bg-white/65 dark:bg-white/5 backdrop-blur-lg border border-white/80 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 group ring-1 ring-black/5 dark:ring-white/10">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                      <span
                        className="material-symbols-outlined text-2xl"
                        data-icon="supervisor_account"
                      >
                        supervisor_account
                      </span>
                    </div>
                    <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 font-extrabold mb-1">
                      2+
                    </h3>
                    <p className="font-label-md text-label-md font-bold text-slate-900 dark:text-slate-50">
                      Expert Mentors
                    </p>
                    <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 mt-1">
                      Dedicated senior tech researchers
                    </p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-6 rounded-2xl bg-white/65 dark:bg-white/5 backdrop-blur-lg border border-white/80 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 group ring-1 ring-black/5 dark:ring-white/10">
                    <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                      <span
                        className="material-symbols-outlined text-2xl"
                        data-icon="workspace_premium"
                      >
                        workspace_premium
                      </span>
                    </div>
                    <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 font-extrabold mb-1">
                      1
                    </h3>
                    <p className="font-label-md text-label-md font-bold text-slate-900 dark:text-slate-50">
                      Pro Courses
                    </p>
                    <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 mt-1">
                      Specialized Computer Vision track
                    </p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-6 rounded-2xl bg-white/65 dark:bg-white/5 backdrop-blur-lg border border-white/80 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 group ring-1 ring-black/5 dark:ring-white/10">
                    <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 text-accent-emerald flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                      <span
                        className="material-symbols-outlined text-2xl"
                        data-icon="verified"
                      >
                        verified
                      </span>
                    </div>
                    <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 font-extrabold mb-1">
                      98%
                    </h3>
                    <p className="font-label-md text-label-md font-bold text-slate-900 dark:text-slate-50">
                      Success Rate
                    </p>
                    <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 mt-1">
                      Practical capstone project delivery
                    </p>
                  </div>
                </StaggerItem>
              </div>
            </StaggerContainer>
          </div>
        </section>

        <section
          className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10"
          id="mentorship"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <Reveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-primary bg-white/70 dark:bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20 shadow-xs">
                  Our Services
                </span>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 mt-4 mb-4">
                  Comprehensive Training and Mentorship in Today's Most Demanded
                  Skills
                </h2>
                <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400">
                  We bridge the gap between academic theory and high-growth
                  industry application through personalized technical coaching.
                </p>
              </div>
            </Reveal>
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StaggerItem>
                  <div className="bg-white/70 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ring-1 ring-black/5 dark:ring-white/10">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-xs">
                        <span
                          className="material-symbols-outlined text-3xl"
                          data-icon="psychology"
                        >
                          psychology
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-slate-900 dark:text-slate-50 font-bold mb-3">
                        AI Mentorship
                      </h3>
                      <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        Master the tools of tomorrow with expert guidance in
                        Artificial Intelligence, deep learning pipelines, and
                        LLM system engineering.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10/80">
                      <span className="inline-flex items-center text-label-sm font-label-sm font-bold text-primary group">
                        <span className="">Explore AI Track</span>
                        <span
                          className="material-symbols-outlined ml-1 text-sm group-hover:translate-x-1 transition-transform"
                          data-icon="arrow_forward"
                        >
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bg-white/70 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ring-1 ring-black/5 dark:ring-white/10">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-6 shadow-xs">
                        <span
                          className="material-symbols-outlined text-3xl"
                          data-icon="analytics"
                        >
                          analytics
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-slate-900 dark:text-slate-50 font-bold mb-3">
                        Data Science
                      </h3>
                      <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        Transform data into insights with our hands-on analytics
                        training, SQL masteries, predictive modeling, and
                        executive storytelling.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10/80">
                      <span className="inline-flex items-center text-label-sm font-label-sm font-bold text-tertiary group">
                        <span className="">Explore Analytics</span>
                        <span
                          className="material-symbols-outlined ml-1 text-sm group-hover:translate-x-1 transition-transform"
                          data-icon="arrow_forward"
                        >
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bg-white/70 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ring-1 ring-black/5 dark:ring-white/10">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 shadow-xs">
                        <span
                          className="material-symbols-outlined text-3xl"
                          data-icon="terminal"
                        >
                          terminal
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-slate-900 dark:text-slate-50 font-bold mb-3">
                        Programming
                      </h3>
                      <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        Build robust applications and learn best coding
                        practices, clean system architecture, algorithms, and
                        Computer Vision deployment.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10/80">
                      <span className="inline-flex items-center text-label-sm font-label-sm font-bold text-secondary group">
                        <span className="">Explore Programming</span>
                        <span
                          className="material-symbols-outlined ml-1 text-sm group-hover:translate-x-1 transition-transform"
                          data-icon="arrow_forward"
                        >
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bg-white/70 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ring-1 ring-black/5 dark:ring-white/10">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 text-accent-emerald flex items-center justify-center mb-6 shadow-xs">
                        <span
                          className="material-symbols-outlined text-3xl"
                          data-icon="event_note"
                        >
                          event_note
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-slate-900 dark:text-slate-50 font-bold mb-3">
                        Events
                      </h3>
                      <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        Join hackathons, webinars, and networking sessions
                        connecting you with high-growth startups and tech
                        mentors across the continent.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10/80">
                      <span className="inline-flex items-center text-label-sm font-label-sm font-bold text-accent-emerald group">
                        <span className="">View Community Calendar</span>
                        <span
                          className="material-symbols-outlined ml-1 text-sm group-hover:translate-x-1 transition-transform"
                          data-icon="arrow_forward"
                        >
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </div>
                </StaggerItem>
              </div>
            </StaggerContainer>
          </div>
        </section>

        <section
          className="py-24 bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-white/10"
          id="featured-courses"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    Curriculum
                  </span>
                  <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 mt-3">
                    Featured Courses
                  </h2>
                  <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                    Master the skills that define the modern tech landscape with
                    our most popular training programs.
                  </p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  <LiquidGlassButton variant="primary" glow>
                    All Courses
                  </LiquidGlassButton>
                  <LiquidGlassButton variant="subtle">
                    AI &amp; ML
                  </LiquidGlassButton>
                  <LiquidGlassButton variant="subtle">
                    Programming
                  </LiquidGlassButton>
                  <LiquidGlassButton variant="subtle">
                    Data Science
                  </LiquidGlassButton>
                </div>
              </div>
            </Reveal>
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {courses.length > 0 ? (
                  courses.map((course: any) => (
                    <StaggerItem key={course.id}>
                      <div className="liquid-glass-panel rounded-2xl border border-primary/40 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between ring-1 ring-primary/20">
                        <div>
                          <div className="relative h-48 bg-slate-50 dark:bg-[#0f172a] p-6 flex flex-col justify-between overflow-hidden">
                            <Image
                              src={course.image || course.imageUrl || "/logo.png"}
                              alt={course.title}
                              fill
                              className="object-cover absolute inset-0 opacity-90 transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
                            <div className="flex justify-between items-start z-10 relative">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary-fixed text-on-secondary-fixed shadow-xs">
                                {course.level || "Beginner"}
                              </span>
                            </div>
                            <div className="z-10 text-white relative">
                              <span
                                className="material-symbols-outlined text-4xl text-primary-fixed"
                                data-icon="visibility"
                              >
                                visibility
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-primary">
                                <span
                                  className="material-symbols-outlined text-sm"
                                  data-icon="person"
                                >
                                  person
                                </span>
                              </div>
                              <span className="text-label-sm font-label-sm font-semibold text-slate-500 dark:text-slate-400">
                                {course.instructor?.name || "Instructor"}
                              </span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm font-bold text-slate-900 dark:text-slate-50 mb-2">
                              {course.title}
                            </h3>
                            <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-4 text-label-sm font-label-sm text-slate-500 dark:text-slate-400 mb-6">
                              <div className="flex items-center gap-1">
                                <span
                                  className="material-symbols-outlined text-base text-primary"
                                  data-icon="layers"
                                >
                                  layers
                                </span>
                                <span>
                                  {course._count?.modules || 0} Modules
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-6 pb-6 pt-0 mt-auto">
                          <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Total Price
                              </span>
                              <span className="font-label-md text-label-md font-bold text-slate-900 dark:text-slate-50">
                                GH₵{course.price || "0.00"}
                              </span>
                            </div>
                            <LiquidGlassButton
                              href={"/courses/" + course.id}
                              variant="subtle"
                              className="!py-2"
                            >
                              View details
                            </LiquidGlassButton>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))
                ) : (
                  <p className="text-slate-500 col-span-3 text-center py-10">
                    No courses available at the moment.
                  </p>
                )}
              </div>
            </StaggerContainer>
          </div>
        </section>

        <section
          className="py-24 bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10"
          id="impactors"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <Reveal>
              <div className="max-w-3xl mb-16">
                <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  Our Impactors
                </span>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 mt-4">
                  Stories From the Next Generation of African Builders
                </h2>
                <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400 mt-3">
                  Real feedback from learners in Ghana and beyond who built
                  tangible projects under our 1-on-1 mentorship.
                </p>
              </div>
            </Reveal>
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.length > 0 ? (
                  testimonials.map((testimonial: any) => (
                    <StaggerItem key={testimonial.id}>
                      <div className="liquid-glass-panel p-8 rounded-2xl shadow-sm flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center gap-1 text-secondary mb-6">
                            <span
                              className="material-symbols-outlined text-lg"
                              data-icon="star"
                              data-weight="fill"
                            >
                              star
                            </span>
                            <span
                              className="material-symbols-outlined text-lg"
                              data-icon="star"
                              data-weight="fill"
                            >
                              star
                            </span>
                            <span
                              className="material-symbols-outlined text-lg"
                              data-icon="star"
                              data-weight="fill"
                            >
                              star
                            </span>
                            <span
                              className="material-symbols-outlined text-lg"
                              data-icon="star"
                              data-weight="fill"
                            >
                              star
                            </span>
                            <span
                              className="material-symbols-outlined text-lg"
                              data-icon="star"
                              data-weight="fill"
                            >
                              star
                            </span>
                          </div>
                          <p className="font-body-md text-body-md text-slate-700 dark:text-slate-300 leading-relaxed mb-6 italic">
                            "{testimonial.content}"
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10 mt-auto">
                          <Image
                            width={44}
                            height={44}
                            className="w-11 h-11 rounded-full object-cover"
                            alt={testimonial.name}
                            src={testimonial.image || testimonial.imageUrl || "/logo.png"}
                          />
                          <div>
                            <h4 className="font-label-md text-label-md font-bold text-slate-900 dark:text-slate-50">
                              {testimonial.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))
                ) : (
                  <p className="text-slate-500 col-span-3 text-center py-10">
                    No testimonials yet.
                  </p>
                )}
              </div>
            </StaggerContainer>
          </div>
        </section>

        <section
          className="py-20 bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-white/10"
          id="events"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="bg-slate-50 dark:bg-[#0f172a] rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-white/10 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7">
                  <Reveal>
                    <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 font-extrabold mb-4">
                      Join Our Events
                    </h2>
                    <p className="font-body-lg text-body-lg text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                      Connect with industry leaders and the TechStorm community
                      at our workshops, webinars, and networking mixers.
                    </p>
                    <div className="flex items-center gap-4">
                      <LiquidGlassButton
                        href="https://www.youtube.com/channel/UC8M5v0tt1eWey4iphX6ai7Q"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="subtle"
                      >
                        <span
                          className="material-symbols-outlined text-red-600 text-lg"
                          data-icon="smart_display"
                        >
                          smart_display
                        </span>
                        <span className="">Watch Past Sessions on YouTube</span>
                      </LiquidGlassButton>
                    </div>
                  </Reveal>
                </div>

                <div className="lg:col-span-5">
                  <div className="liquid-glass-panel rounded-2xl p-6 shadow-md">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                      <span className="font-label-md text-label-md font-bold text-slate-900 dark:text-slate-50">
                        Weekly Schedule
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-muted text-slate-500 dark:text-slate-400 font-mono font-medium">
                        GMT Timezone
                      </span>
                    </div>
                    <StaggerContainer>
                      <div className="py-6 text-left space-y-4">
                        {events.length > 0 ? (
                          events.map((evt: any) => (
                            <StaggerItem key={evt.id}>
                              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 relative overflow-hidden">
                                  {evt.image || evt.imageUrl ? (
                                    <Image
                                      src={evt.image || evt.imageUrl}
                                      alt={evt.title}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <span
                                      className="material-symbols-outlined text-lg"
                                      data-icon="event"
                                    >
                                      event
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-label-md text-label-md font-bold text-slate-900 dark:text-slate-50">
                                    {evt.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {new Date(evt.date).toLocaleDateString()} at{" "}
                                    {new Date(evt.date).toLocaleTimeString()}
                                  </p>
                                  {evt.link && (
                                    <a
                                      href={evt.link}
                                      target="_blank"
                                      className="text-primary text-xs font-bold mt-2 inline-block"
                                    >
                                      Join Link &rarr;
                                    </a>
                                  )}
                                </div>
                              </div>
                            </StaggerItem>
                          ))
                        ) : (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-secondary-fixed/50 text-secondary mx-auto flex items-center justify-center mb-3">
                              <span
                                className="material-symbols-outlined text-2xl"
                                data-icon="event_busy"
                              >
                                event_busy
                              </span>
                            </div>
                            <h4 className="font-headline-sm text-headline-sm text-sm font-bold text-slate-900 dark:text-slate-50 mb-1">
                              No live sessions scheduled this week
                            </h4>
                            <p className="font-body-sm text-body-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                              We host events regularly. Follow our social media
                              or check back soon to catch the next workshop!
                            </p>
                          </div>
                        )}
                      </div>
                    </StaggerContainer>
                    <LiquidGlassButton glow variant="primary" className="w-full mt-4">
                      <span
                        className="material-symbols-outlined text-lg"
                        data-icon="notifications"
                      >
                        notifications
                      </span>
                      <span className="">Notify Me of Next Hackathon</span>
                    </LiquidGlassButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50 dark:bg-[#0f172a] relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 md:px-12 text-center relative z-10">
            <Reveal>
              <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20">
                Accelerate Your Future
              </span>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50 font-extrabold mt-4 mb-6">
                Ready to Accelerate Your Tech Journey?
              </h2>
              <p className="font-body-lg text-body-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
                Whether you're starting out in programming, transitioning to AI
                research, or building a portfolio for global tech roles, we have
                the mentor for you.
              </p>
            </Reveal>
            <form
              action="/register"
              method="GET"
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            >
              <input
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs font-body-sm text-body-sm"
                name="email"
                placeholder="Enter your email address"
                required
                type="email"
              />
              <LiquidGlassButton
                glow
                variant="primary"
                className="!py-3"
                type="submit"
              >
                Get Mentored
              </LiquidGlassButton>
            </form>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Free community onboarding • Instant access to our technical
              Discord
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

