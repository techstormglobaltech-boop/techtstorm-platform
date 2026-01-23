import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function About() {
  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-brand-teal to-[#004d53] text-white text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">About TechStorm</h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                    Empowering the next generation of tech leaders through guidance, connection, and growth.
                </p>
            </Reveal>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="container mx-auto px-5 relative z-10 -mt-12">
        <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <Reveal width="100%" delay={300}>
                <div className="bg-white p-10 rounded-2xl shadow-xl border-b-[5px] border-brand-amber h-full">
                    <div className="text-4xl text-brand-teal mb-6"><i className="fas fa-rocket"></i></div>
                    <h3 className="text-2xl font-bold mb-4 text-brand-dark">Our Mission</h3>
                    <p className="text-text-gray leading-relaxed">
                        To foster a supportive community where mentors and mentees grow together, exchange ideas, and create lasting impact. We aim to help everyone, regardless of background, find their path in tech.
                    </p>
                </div>
            </Reveal>
            {/* Vision Card */}
            <Reveal width="100%" delay={400}>
                <div className="bg-white p-10 rounded-2xl shadow-xl border-b-[5px] border-brand-amber h-full">
                    <div className="text-4xl text-brand-teal mb-6"><i className="fas fa-eye"></i></div>
                    <h3 className="text-2xl font-bold mb-4 text-brand-dark">Our Vision</h3>
                    <p className="text-text-gray leading-relaxed">
                        We envision a world where individuals can easily access guidance, knowledge sharing, and meaningful connections to drive personal and professional success in the digital age.
                    </p>
                </div>
            </Reveal>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-5 grid md:grid-cols-2 gap-16 items-center">
            <div>
                <Reveal>
                    <div className="mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-teal mb-4">The Story Behind TechStorm</h2>
                    </div>
                </Reveal>
                <Reveal delay={200}>
                    <p className="mb-6 text-text-gray leading-relaxed">
                        TechStorm was founded with the belief that <strong>mentorship is the bridge between potential and achievement</strong>. We are passionate about supporting individuals at every stage of their journey by providing structured guidance, skill development, and networking opportunities.
                    </p>
                    <p className="mb-8 text-text-gray leading-relaxed">
                        What started as a small team dedicated to helping learners navigate career and academic challenges has grown into a thriving mentorship hub empowering future leaders across industries.
                    </p>
                </Reveal>
                <Reveal delay={300}>
                    <Link href="/team" className="bg-brand-amber text-brand-dark font-semibold px-8 py-3 rounded-full hover:bg-[#e6a200] transition transform hover:-translate-y-1 shadow-md inline-block">
                        Meet Our Team
                    </Link>
                </Reveal>
            </div>
            <div className="relative">
                <Reveal width="100%" delay={200}>
                    <Image 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="TechStorm Team Story" 
                        width={800} 
                        height={600}
                        className="rounded-3xl shadow-[20px_20px_0_#007C85] w-full h-auto"
                    />
                </Reveal>
            </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20 bg-light-bg">
        <div className="container mx-auto px-5">
            <div className="text-center mb-16 flex flex-col items-center">
                <Reveal>
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-teal mb-4">Our Core Values</h2>
                </Reveal>
                <Reveal delay={100}>
                    <p className="text-text-gray max-w-2xl mx-auto">The principles that guide every interaction and program at TechStorm.</p>
                </Reveal>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { icon: 'fa-hands-helping', title: 'Guidance & Growth', desc: 'Focused on holistic development through structured mentorship.' },
                    { icon: 'fa-share-alt', title: 'Knowledge Sharing', desc: 'Collaborative learning where ideas are exchanged freely.' },
                    { icon: 'fa-globe', title: 'Inclusivity', desc: 'Making tech accessible to individuals from all backgrounds.' },
                    { icon: 'fa-link', title: 'Connections', desc: 'Building meaningful, lasting professional relationships.' }
                ].map((value, index) => (
                    <Reveal key={index} width="100%" delay={index * 100}>
                        <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 h-full">
                            <div className="w-20 h-20 bg-[rgba(0,124,133,0.1)] rounded-full flex items-center justify-center text-3xl text-brand-teal mx-auto mb-6">
                                <i className={`fas ${value.icon}`}></i>
                            </div>
                            <h4 className="text-lg font-bold text-brand-dark mb-3">{value.title}</h4>
                            <p className="text-sm text-text-gray">{value.desc}</p>
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="py-20">
        <div className="container mx-auto px-5">
            <div className="text-center mb-12">
                <Reveal>
                    <h2 className="text-3xl font-bold text-brand-dark">Our Impact</h2>
                </Reveal>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                    { val: "20+", label: "Corporate Partners", color: "text-brand-amber" },
                    { val: "500+", label: "Mentees Empowered", color: "text-brand-teal" },
                    { val: "50+", label: "Expert Mentors", color: "text-brand-amber" },
                    { val: "100%", label: "Commitment to Growth", color: "text-brand-teal" }
                ].map((stat, i) => (
                    <Reveal key={i} delay={i * 100}>
                        <div>
                            <h3 className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>{stat.val}</h3>
                            <p className="text-text-gray font-medium">{stat.label}</p>
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
      </section>
    </>
  );
}