import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image?: string | null;
  company?: string | null;
  rating: number;
}

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-5">
        <div className="text-center mb-16">
          <Reveal>
            <h2 className="text-4xl font-bold text-brand-dark">What People <span className="text-brand-teal">Say</span></h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Hear from our students and mentors about their experience with TechStorm Global.</p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 100} width="100%">
              <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all border border-slate-100 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-brand-teal/20">
                     {testimonial.image ? (
                        <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xl">
                            {testimonial.name.charAt(0)}
                        </div>
                     )}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark">{testimonial.name}</h4>
                    <p className="text-xs text-brand-teal font-bold uppercase tracking-wider">{testimonial.role}</p>
                    {testimonial.company && <p className="text-xs text-slate-400">{testimonial.company}</p>}
                  </div>
                </div>
                
                <div className="flex gap-1 mb-4 text-amber-400 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < testimonial.rating ? "" : "text-slate-200"}`}></i>
                    ))}
                </div>

                <p className="text-slate-600 leading-relaxed italic flex-1">"{testimonial.content}"</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
