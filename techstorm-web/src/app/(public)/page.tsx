import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { getHomeData } from "@/app/actions/home";

export default async function Home() {
  const data = await getHomeData();
  const { courses, events, stats } = data || { courses: [], events: [], stats: { totalMentees: 0, totalCourses: 0, totalMentors: 0 } };

  return (
    <>
      {/* HERO SECTION */}
      <section className="pt-20 pb-20 md:pt-32 md:pb-24 bg-gradient-to-br from-[#f0fdff] to-[#fffbeb]">
        <div className="container mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
            <div>
                <Reveal>
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-brand-dark mb-6">
                        Building the Future Together Through <span className="text-brand-teal">Tech Mentorship</span>
                    </h1>
                </Reveal>
                <Reveal delay={200}>
                    <p className="mb-8 text-text-gray text-lg max-w-lg leading-relaxed">
                        Join TechStorm Global to connect with industry experts in AI, Data Science, and Software Engineering. Empowering the next generation of tech leaders.
                    </p>
                </Reveal>
                <Reveal delay={400}>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/register" className="bg-brand-teal text-white font-bold px-10 py-4 rounded-full hover:bg-[#006066] transition transform hover:-translate-y-1 shadow-lg shadow-brand-teal/20">
                            Get Started
                        </Link>
                        <Link href="/about" className="border-2 border-brand-teal text-brand-teal font-bold px-10 py-4 rounded-full hover:bg-brand-teal hover:text-white transition transform hover:-translate-y-1">
                            How It Works
                        </Link>
                    </div>
                </Reveal>
            </div>
            <div className="relative mt-8 md:mt-0">
                <Reveal width="100%" delay={300}>
                    <div className="relative group">
                        <Image 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                            alt="Mentorship" 
                            width={800} 
                            height={600}
                            className="rounded-3xl shadow-2xl w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500 ring-8 ring-brand-amber/10"
                            priority
                        />
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                            <Image src={`https://i.pravatar.cc/150?u=${i}`} alt="user" width={40} height={40} />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-brand-dark">Join {stats.totalMentees}+ Students</p>
                                    <p className="text-[10px] text-slate-400 font-medium tracking-wide">Growing every day</p>
                                </div>
                            </div>
                        </div>
                        {/* Legacy Accent Box Shadow replacement */}
                        <div className="absolute -z-10 top-10 -right-6 w-full h-full border-[20px] border-brand-amber rounded-3xl opacity-20 hidden md:block"></div>
                    </div>
                </Reveal>
            </div>
        </div>
      </section>

      {/* SERVICES SECTION (LEGACY REBORN) */}
      <section className="py-24 bg-white" id="services">
          <div className="container mx-auto px-5 text-center mb-16">
              <Reveal>
                  <h2 className="text-4xl font-bold text-brand-teal">Our Services</h2>
              </Reveal>
              <Reveal delay={200}>
                  <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Comprehensive training and mentorship in today's most demanded skills.</p>
              </Reveal>
          </div>
          <div className="container mx-auto px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                  { icon: "fa-brain", title: "AI Mentorship", desc: "Master the tools of tomorrow with expert guidance in Artificial Intelligence." },
                  { icon: "fa-chart-line", title: "Data Science", desc: "Transform data into insights with our hands-on analytics training." },
                  { icon: "fa-code", title: "Programming", desc: "Build robust applications and learn best coding practices." },
                  { icon: "fa-calendar-alt", title: "Events", desc: "Join hackathons, webinars, and networking sessions." },
              ].map((service, i) => (
                  <Reveal key={i} delay={i * 100}>
                      <div className="bg-white p-10 rounded-2xl shadow-sm border-b-4 border-brand-teal hover:border-brand-amber transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
                          <div className="text-3xl text-brand-amber mb-6 group-hover:scale-110 transition-transform"><i className={`fas ${service.icon}`}></i></div>
                          <h3 className="text-xl font-bold text-brand-dark mb-4">{service.title}</h3>
                          <p className="text-text-gray text-sm leading-relaxed">{service.desc}</p>
                      </div>
                  </Reveal>
              ))}
          </div>
      </section>

      {/* STATS STRIP */}
      <section className="py-12 bg-white border-y border-slate-50">
        <div className="container mx-auto px-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: "Active Learners", val: stats.totalMentees, suffix: "+", icon: "fa-user-graduate" },
                    { label: "Expert Mentors", val: stats.totalMentors, suffix: "+", icon: "fa-chalkboard-teacher" },
                    { label: "Pro Courses", val: stats.totalCourses, suffix: "", icon: "fa-video" },
                    { label: "Success Rate", val: 98, suffix: "%", icon: "fa-star" },
                ].map((stat, i) => (
                    <div key={i} className="text-center group">
                        <div className="text-brand-teal text-2xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity"><i className={`fas ${stat.icon}`}></i></div>
                        <h4 className="text-3xl font-black text-brand-dark">{stat.val}{stat.suffix}</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-5">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                  <div>
                      <Reveal>
                          <h2 className="text-4xl font-bold text-brand-dark">Featured <span className="text-brand-teal">Courses</span></h2>
                      </Reveal>
                      <Reveal delay={200}>
                          <p className="text-slate-500 mt-2 max-w-lg">Master the skills that define the modern tech landscape with our most popular training programs.</p>
                      </Reveal>
                  </div>
                  {courses.length > 0 && (
                    <Link href="/courses" className="text-brand-teal font-bold hover:underline flex items-center gap-2 group">
                        Browse all courses <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                    </Link>
                  )}
              </div>

              {courses.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-8">
                    {courses.map((course: any, index: number) => (
                        <Reveal key={course.id} width="100%" delay={index * 100}>
                            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col h-full group">
                                <div className="relative h-56">
                                    {course.image ? (
                                        <Image src={course.image} alt={course.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <i className="fas fa-image text-4xl"></i>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-brand-amber text-brand-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        {course.category || "General"}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        <i className="fas fa-user-circle text-brand-teal"></i> {course.instructor?.name || "TechStorm Mentor"}
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-dark mb-4 leading-tight group-hover:text-brand-teal transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <span><i className="fas fa-layer-group text-slate-300 mr-1.5"></i> {course._count?.modules || 0} Modules</span>
                                        <span className="text-brand-teal text-lg font-black">{course.price ? `GH₵${course.price}` : "FREE"}</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 px-10 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-book-open text-slate-300 text-3xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-brand-dark mb-2">Our first courses are brewing!</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">We're currently finalizing high-quality curriculum for you. Check back in a few days or sign up for updates.</p>
                    <Link href="/register" className="inline-block bg-brand-dark text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-teal transition-colors">
                        Get Notified
                    </Link>
                </div>
              )}
          </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-24 bg-white">
          <div className="container mx-auto px-5">
              <div className="text-center mb-16">
                  <Reveal>
                      <h2 className="text-4xl font-bold text-brand-dark">Join Our <span className="text-brand-amber">Events</span></h2>
                  </Reveal>
                  <Reveal delay={200}>
                      <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Connect with industry leaders and the TechStorm community at our workshops, webinars, and networking mixers.</p>
                  </Reveal>
              </div>

              {events.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-8">
                    {events.map((event: any, index: number) => {
                        const eventDate = new Date(event.date);
                        const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                        const day = eventDate.getDate();
                        const time = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <Reveal key={event.id} width="100%" delay={index * 100}>
                                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col h-full group">
                                    <div className="relative h-48 bg-slate-200">
                                        {event.image ? (
                                            <Image src={event.image} alt={event.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <i className="fas fa-calendar-alt text-4xl"></i>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg text-center min-w-[60px]">
                                            <span className="block text-brand-teal text-xs font-bold uppercase">{month}</span>
                                            <span className="block text-brand-dark text-xl font-bold">{day}</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-1">
                                        <span className="text-brand-amber text-[10px] font-black uppercase tracking-widest mb-2 block">
                                            {event.isVirtual ? 'Webinar' : 'Workshop'}
                                        </span>
                                        <h3 className="text-xl font-bold text-brand-dark mb-4 group-hover:text-brand-teal transition-colors line-clamp-2">{event.title}</h3>
                                        <div className="flex flex-col gap-2 text-sm text-slate-500 mb-6">
                                            <span className="flex items-center gap-2"><i className="far fa-clock text-brand-teal"></i> {time}</span>
                                            <span className="flex items-center gap-2"><i className="fas fa-map-marker-alt text-brand-teal"></i> {event.location}</span>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">{event.description}</p>
                                        <Link href="/events" className="block w-full text-center bg-brand-dark text-white font-bold py-3.5 rounded-xl hover:bg-brand-teal transition-colors shadow-lg shadow-slate-200">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
              ) : (
                <div className="max-w-xl mx-auto text-center py-10">
                    <div className="bg-amber-50 text-amber-600 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6">
                        <i className="fas fa-info-circle"></i>
                        No live sessions scheduled this week
                    </div>
                    <p className="text-slate-500 mb-0">We host events regularly. Follow our social media or check back soon to catch the next workshop!</p>
                </div>
              )}
          </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-brand-teal relative overflow-hidden">
        <div className="container mx-auto px-5 text-center relative z-10">
            <Reveal>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Accelerate Your Career?</h2>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-teal-50 text-xl mb-10 max-w-2xl mx-auto opacity-90">Join thousands of learners and mentors making a real difference in the world of technology.</p>
            </Reveal>
            <Reveal delay={300}>
                <Link href="/register" className="bg-brand-amber text-brand-dark font-black px-12 py-5 rounded-full hover:bg-white hover:text-brand-teal transition-all transform hover:-translate-y-1 shadow-2xl inline-block text-lg">
                    Get Started Today
                </Link>
            </Reveal>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      </section>
    </>
  );
}