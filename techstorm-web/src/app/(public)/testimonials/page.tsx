import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

export default function Testimonials() {
  return (
    <>
      {/* HERO */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-white to-slate-50 text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-teal">Voices of Impact</h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg text-text-gray max-w-2xl mx-auto">
                    Hear from the mentees, partners, and professionals whose careers have been transformed by TechStorm Global.
                </p>
            </Reveal>
        </div>
      </section>

      {/* FEATURED STORY */}
      <section className="container mx-auto px-5 mb-20">
        <Reveal width="100%" delay={300}>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl grid md:grid-cols-2">
                <div className="relative min-h-[400px]">
                    <Image 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Featured Success Story" 
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-10 md:p-14 flex flex-col justify-center">
                    <i className="fas fa-quote-left text-5xl text-brand-teal/10 mb-4"></i>
                    <div className="text-brand-amber font-bold tracking-wider text-sm uppercase mb-2">Featured Story</div>
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-6 leading-tight">"TechStorm didn't just teach me coding; they gave me a career."</h2>
                    <p className="text-text-gray mb-8 leading-relaxed">
                        Before joining the program, I was struggling to find my path in the tech industry. The mentorship I received was personal, rigorous, and incredibly supportive. Today, I'm working as a Junior Cloud Engineer at a top financial firm.
                    </p>
                    <div className="flex items-center gap-4">
                         <div>
                            <h4 className="font-bold text-brand-dark text-lg">Abena K.</h4>
                            <span className="text-brand-teal font-medium">Cloud Engineer @ FirstRand</span>
                        </div>
                    </div>
                </div>
            </div>
        </Reveal>
      </section>

      {/* TESTIMONIAL GRID */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-5">
            <div className="text-center mb-12">
                <Reveal>
                    <h2 className="text-3xl font-bold text-brand-teal">What Our Community Says</h2>
                </Reveal>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { text: "The AI mentorship track was an eye-opener. The practical projects helped me build a portfolio that actually got me hired.", name: "Kwesi A.", role: "Data Scientist", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                    { text: "I loved the networking events. Meeting industry leaders in Accra gave me the confidence to start my own tech consultancy.", name: "Sarah J.", role: "Entrepreneur", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 4.5 },
                    { text: "As a partner organization, working with TechStorm to recruit interns has been seamless. The quality of talent is top-notch.", name: "Mr. Osei", role: "HR Manager, TechCorp", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                    { text: "The web development bootcamp was intense but worth it. The mentors were always available to unblock me when I got stuck.", name: "David M.", role: "Frontend Dev", img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                    { text: "TechStorm provides a holistic approach. We didn't just code; we learned soft skills, resume writing, and interview prep.", name: "Amina Y.", role: "Product Designer", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 5 },
                    { text: "A fantastic community. Even after graduating, I still come back to mentor others. It's a cycle of giving back.", name: "Kofi B.", role: "Alumni & Mentor", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80", stars: 4.5 }
                ].map((item, index) => (
                    <Reveal key={index} width="100%" delay={index * 100}>
                        <div className="bg-slate-50 p-8 rounded-xl hover:-translate-y-1 transition-transform duration-300 border-b-4 border-transparent hover:border-brand-teal shadow-sm h-full">
                            <div className="text-brand-amber mb-4 text-sm flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fas fa-star ${i < Math.floor(item.stars) ? '' : (item.stars % 1 !== 0 && i === Math.floor(item.stars) ? 'fa-star-half-alt' : 'text-slate-300')}`}></i>
                                ))}
                            </div>
                            <p className="text-slate-600 italic mb-6 leading-relaxed">"{item.text}"</p>
                            <div className="flex items-center gap-3">
                                <Image src={item.img} alt={item.name} width={48} height={48} className="rounded-full object-cover" />
                                <div>
                                    <h4 className="font-bold text-brand-dark text-sm">{item.name}</h4>
                                    <span className="text-brand-teal text-xs font-semibold">{item.role}</span>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
             <div>
                <Reveal delay={100}>
                    <h3 className="text-4xl md:text-5xl font-bold text-brand-amber mb-2">98%</h3>
                    <p className="text-slate-400">Satisfaction Rate</p>
                </Reveal>
            </div>
            <div>
                <Reveal delay={200}>
                    <h3 className="text-4xl md:text-5xl font-bold text-brand-amber mb-2">50+</h3>
                    <p className="text-slate-400">Hiring Partners</p>
                </Reveal>
            </div>
            <div>
                <Reveal delay={300}>
                    <h3 className="text-4xl md:text-5xl font-bold text-brand-amber mb-2">500+</h3>
                    <p className="text-slate-400">Careers Launched</p>
                </Reveal>
            </div>
        </div>
      </section>
    </>
  );
}
