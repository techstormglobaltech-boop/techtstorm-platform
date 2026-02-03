import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
}

export default function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-5 text-center relative z-10">
        <Reveal>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">Our Sponsors</h2>
        </Reveal>
        <Reveal delay={200}>
            <p className="text-text-gray text-xl mb-12 max-w-2xl mx-auto opacity-90">Proudly supported by industry leaders who believe in our mission.</p>
        </Reveal>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {sponsors.map((sponsor, index) => (
                <Reveal key={sponsor.id} delay={300 + (index * 100)}>
                    <a 
                        href={sponsor.websiteUrl || "#"} 
                        target={sponsor.websiteUrl ? "_blank" : "_self"}
                        rel={sponsor.websiteUrl ? "noopener noreferrer" : ""}
                        className="group block transition-transform hover:-translate-y-2"
                    >
                        <div className="relative h-16 w-32 md:h-20 md:w-48 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                             <Image 
                                src={sponsor.logoUrl} 
                                alt={sponsor.name} 
                                fill 
                                className="object-contain"
                            />
                        </div>
                    </a>
                </Reveal>
            ))}
        </div>
      </div>
    </section>
  );
}
