import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { getPublicMentors } from "@/app/actions/profile";
import { getTeamMembers } from "@/app/actions/team";

export default async function Team() {
  const [mentors, teamMembers] = await Promise.all([
    getPublicMentors(),
    getTeamMembers()
  ]);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-[url('/globe.svg')] bg-no-repeat bg-right-top opacity-5 pointer-events-none"></div>
        <div className="container mx-auto px-5 text-center relative z-10">
            <Reveal>
                <span className="text-brand-teal font-bold tracking-wider uppercase text-sm mb-3 block">Our People</span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 text-brand-dark leading-tight">
                    Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-blue">Visionaries</span>
                </h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    The passionate individuals, industry veterans, and dedicated mentors guiding your tech journey.
                </p>
            </Reveal>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section className="py-24 container mx-auto px-5">
        <div className="text-center mb-16">
            <Reveal>
                <h2 className="text-3xl font-bold text-brand-dark mb-3">Leadership Team</h2>
            </Reveal>
            <Reveal delay={100}>
                <div className="w-20 h-1 bg-brand-teal mx-auto rounded-full mb-4"></div>
                <p className="text-slate-500 max-w-2xl mx-auto">Driving the mission and vision of TechStorm Global.</p>
            </Reveal>
        </div>
        
        {teamMembers.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8 lg:gap-12 max-w-6xl mx-auto">
                {teamMembers.map((leader: any, index: number) => (
                    <div key={leader.id} className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-3rem)] max-w-sm">
                        <Reveal width="100%" delay={index * 150}>
                        <div className="group bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-teal to-brand-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                            
                            <div className="relative w-40 h-40 mx-auto mb-6">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-teal to-brand-blue opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500"></div>
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 group-hover:border-brand-teal/20 transition-colors duration-500 relative z-10 bg-slate-100">
                                    {leader.image ? (
                                        <Image src={leader.image} alt={leader.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                                            <i className="fas fa-user"></i>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-brand-dark mb-1">{leader.name}</h3>
                            <span className="text-brand-teal font-bold text-sm tracking-wide uppercase block mb-5">{leader.role}</span>
                            
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-4">
                                {leader.bio}
                            </p>
                            
                            <div className="flex justify-center gap-4 mt-auto pt-6 border-t border-slate-50">
                                {leader.linkedinUrl && (
                                    <a href={leader.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm">
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                )}
                                {leader.twitterUrl && (
                                    <a href={leader.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm">
                                        <i className="fab fa-x-twitter"></i>
                                    </a>
                                )}
                                {leader.youtubeUrl && (
                                    <a href={leader.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm">
                                        <i className="fab fa-youtube"></i>
                                    </a>
                                )}
                            </div>
                        </div>
                    </Reveal>
                  </div>
                ))}
            </div>
        ) : (
             <div className="text-center py-16 text-slate-400 italic bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-4xl mx-auto">
                <i className="fas fa-users-slash text-4xl mb-4 opacity-50"></i>
                <p>Leadership profiles are currently being updated.</p>
            </div>
        )}
      </section>

      {/* MENTORS SECTION */}
      <section className="py-24 bg-brand-dark text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-5 relative z-10">
            <div className="text-center mb-16">
                <Reveal>
                    <h2 className="text-3xl font-bold mb-3">World-Class Mentors</h2>
                </Reveal>
                <Reveal delay={100}>
                    <p className="text-slate-400 max-w-2xl mx-auto">Learn directly from professionals working at top tech companies.</p>
                </Reveal>
            </div>

            {mentors.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-6">
                    {mentors.map((mentor: any, index: number) => (
                        <div key={mentor.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-xs">
                            <Reveal width="100%" delay={index * 50}>
                            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full">
                                <div className="relative h-64 bg-slate-800 overflow-hidden">
                                    {mentor.image ? (
                                        <Image src={mentor.image} alt={mentor.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-90" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-white/20">
                                            <i className="fas fa-user"></i>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                                    <span className="absolute bottom-4 left-4 bg-brand-teal text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                                        {mentor.title || 'Mentor'}
                                    </span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-2">{mentor.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">
                                        {mentor.bio || 'Professional tech mentor dedicated to student success.'}
                                    </p>
                                    
                                    <div className="flex gap-3 mt-auto border-t border-white/10 pt-4">
                                        {mentor.linkedinUrl && (
                                            <a href={mentor.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                                <i className="fab fa-linkedin text-xl"></i>
                                            </a>
                                        )}
                                        {mentor.githubUrl && (
                                            <a href={mentor.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                                <i className="fab fa-github text-xl"></i>
                                            </a>
                                        )}
                                        {mentor.twitterUrl && (
                                            <a href={mentor.twitterUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                                <i className="fab fa-twitter text-xl"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                      </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-500 italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                    Our mentor community is growing. Check back soon!
                </div>
            )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <div className="w-16 h-16 bg-brand-amber/10 text-brand-amber rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    <i className="fas fa-handshake"></i>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Join Our Mentorship Network</h2>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-slate-500 mb-8 max-w-2xl mx-auto text-lg">Are you an experienced professional looking to give back? Join us as a mentor and help shape the next generation of tech leaders.</p>
            </Reveal>
            <Reveal delay={300}>
                <Link href="/contact" className="bg-brand-dark text-white font-bold px-10 py-4 rounded-full hover:bg-black transition-all transform hover:-translate-y-1 shadow-lg shadow-brand-dark/20 inline-flex items-center gap-2">
                    Become a Mentor <i className="fas fa-arrow-right"></i>
                </Link>
            </Reveal>
        </div>
      </section>
    </>
  );
}
