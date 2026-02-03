import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { getPublicTestimonials } from "@/app/actions/testimonials";

export default async function Testimonials() {
  const testimonials = await getPublicTestimonials();
  const featured = testimonials[0];
  const rest = testimonials.slice(1);

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
      {featured && (
        <section className="container mx-auto px-5 mb-20">
            <Reveal width="100%" delay={300}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl grid md:grid-cols-2">
                    <div className="relative min-h-[400px] bg-slate-100">
                        {featured.image ? (
                            <Image 
                                src={featured.image} 
                                alt={featured.name} 
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <i className="fas fa-user text-6xl"></i>
                            </div>
                        )}
                    </div>
                    <div className="p-10 md:p-14 flex flex-col justify-center">
                        <i className="fas fa-quote-left text-5xl text-brand-teal/10 mb-4"></i>
                        <div className="text-brand-amber font-bold tracking-wider text-sm uppercase mb-2">Featured Story</div>
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-6 leading-tight">"{featured.content.substring(0, 100)}..."</h2>
                        <p className="text-text-gray mb-8 leading-relaxed">
                            {featured.content}
                        </p>
                        <div className="flex items-center gap-4">
                            <div>
                                <h4 className="font-bold text-brand-dark text-lg">{featured.name}</h4>
                                <span className="text-brand-teal font-medium">{featured.role} {featured.company ? `@ ${featured.company}` : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
      )}

      {/* TESTIMONIAL GRID */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-5">
            <div className="text-center mb-12">
                <Reveal>
                    <h2 className="text-3xl font-bold text-brand-teal">What Our Community Says</h2>
                </Reveal>
            </div>
            
            {testimonials.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((item: any, index: number) => (
                        <Reveal key={item.id} width="100%" delay={index * 100}>
                            <div className="bg-slate-50 p-8 rounded-xl hover:-translate-y-1 transition-transform duration-300 border-b-4 border-transparent hover:border-brand-teal shadow-sm h-full flex flex-col">
                                <div className="text-brand-amber mb-4 text-sm flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={`fas fa-star ${i < item.rating ? '' : 'text-slate-300'}`}></i>
                                    ))}
                                </div>
                                <p className="text-slate-600 italic mb-6 leading-relaxed flex-1">"{item.text || item.content}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 relative shrink-0">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                                                {item.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-dark text-sm">{item.name}</h4>
                                        <span className="text-brand-teal text-xs font-semibold">{item.role}</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500">No testimonials found. Check back soon!</p>
                </div>
            )}
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