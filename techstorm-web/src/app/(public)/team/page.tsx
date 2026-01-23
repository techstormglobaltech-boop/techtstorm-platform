import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function Team() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#f0fdf4] to-[#fffbeb] text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark">Meet The <span className="text-brand-teal">Experts</span></h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg text-text-gray max-w-2xl mx-auto">
                    The passionate individuals and industry veterans dedicated to guiding your tech journey.
                </p>
            </Reveal>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section className="py-20 container mx-auto px-5">
        <div className="text-center mb-12">
            <Reveal>
                <h2 className="text-3xl font-bold text-brand-teal mb-2">Leadership Team</h2>
            </Reveal>
            <Reveal delay={100}>
                <p className="text-text-gray max-w-2xl mx-auto">The visionaries driving TechStorm Global forward.</p>
            </Reveal>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
            {[
                { name: "Kwame Mensah", role: "Founder & CEO", desc: "Tech visionary with 10+ years in EdTech, dedicated to bridging the digital skills gap in Africa.", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
                { name: "Sarah Osei", role: "Program Director", desc: "Expert in curriculum development and student success, ensuring our mentorship hits the mark.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
                { name: "David Asante", role: "Operations Lead", desc: "Ensuring smooth execution of all hackathons, webinars, and day-to-day activities.", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
            ].map((leader, index) => (
                <Reveal key={index} width="100%" delay={index * 150}>
                    <div className="bg-white p-10 rounded-xl text-center shadow-md hover:-translate-y-2 transition-transform duration-300 border-t-4 border-transparent hover:border-brand-amber h-full">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-brand-teal p-1 bg-white">
                            <Image src={leader.img} alt={leader.name} width={128} height={128} className="rounded-full w-full h-full object-cover" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark mb-1">{leader.name}</h3>
                        <span className="text-brand-teal font-semibold text-sm block mb-4">{leader.role}</span>
                        <p className="text-text-gray text-sm leading-relaxed">{leader.desc}</p>
                    </div>
                </Reveal>
            ))}
        </div>
      </section>

      {/* MENTORS SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-5">
            <div className="text-center mb-12">
                <Reveal>
                    <h2 className="text-3xl font-bold text-brand-teal mb-2">Our Mentors</h2>
                </Reveal>
                <Reveal delay={100}>
                    <p className="text-text-gray max-w-2xl mx-auto">Learn directly from professionals working at top tech companies.</p>
                </Reveal>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { name: "Emmanuel K.", role: "AI Expert", desc: "Senior ML Engineer specializing in NLP and Computer Vision. Passionate about ethical AI.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
                    { name: "Ama Serwaa", role: "Data Science", desc: "Data Analyst at a Fintech unicorn. She loves teaching SQL and Python for data viz.", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
                    { name: "John Doe", role: "Full Stack", desc: "Full Stack Developer with expertise in React and Node.js. Builds scalable web apps.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
                    { name: "Grace Tetteh", role: "Cloud / DevOps", desc: "AWS Certified Solutions Architect. Helps students master cloud infrastructure.", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
                ].map((mentor, index) => (
                    <Reveal key={index} width="100%" delay={index * 100}>
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-slate-100 h-full">
                            <div className="relative h-64">
                                <Image src={mentor.img} alt={mentor.name} fill className="object-cover" />
                                <span className="absolute top-4 right-4 bg-brand-amber text-brand-dark text-xs font-bold px-3 py-1 rounded-full">{mentor.role}</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-brand-dark mb-2">{mentor.name}</h3>
                                <p className="text-text-gray text-sm mb-4 leading-relaxed">{mentor.desc}</p>
                                <div className="flex gap-3">
                                    <a href="#" className="w-8 h-8 rounded-full bg-slate-100 text-brand-teal flex items-center justify-center hover:bg-brand-teal hover:text-white transition-colors"><i className="fab fa-linkedin-in"></i></a>
                                    <a href="#" className="w-8 h-8 rounded-full bg-slate-100 text-brand-teal flex items-center justify-center hover:bg-brand-teal hover:text-white transition-colors"><i className="fab fa-github"></i></a>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-dark text-white text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h2 className="text-3xl font-bold mb-4">Join Our Mentorship Network</h2>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-slate-300 mb-8 max-w-2xl mx-auto">Are you an experienced professional looking to give back? Join us as a mentor and help shape the next generation.</p>
            </Reveal>
            <Reveal delay={300}>
                <Link href="/contact" className="bg-brand-amber text-brand-dark font-bold px-8 py-3 rounded-full hover:bg-[#e6a200] transition-transform transform hover:-translate-y-1 shadow-md inline-block">
                    Become a Mentor
                </Link>
            </Reveal>
        </div>
      </section>
    </>
  );
}
