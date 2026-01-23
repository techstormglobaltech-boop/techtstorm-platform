import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function Services() {
  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Expert Mentorship & <span className="text-brand-amber">Training</span></h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                    Designed to equip you with the skills, confidence, and networks you need to thrive.
                </p>
            </Reveal>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-20 text-center bg-white">
        <div className="container mx-auto px-5">
            <Reveal>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-teal mb-6">Our Approach</h2>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg text-text-gray max-w-3xl mx-auto leading-relaxed">
                    At TechStorm, mentorship is more than just advice—it's a journey we take together. We support mentees in navigating their careers, academics, and personal growth through holistic development programs.
                </p>
            </Reveal>
        </div>
      </section>

      {/* SERVICE BLOCKS */}
      <div className="flex flex-col">
        {/* Block 1: AI */}
        <div className="py-20 border-b border-slate-200">
            <div className="container mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
                <Reveal width="100%">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <Image 
                            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                            alt="AI Mentorship" 
                            width={800} 
                            height={600}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                </Reveal>
                <div>
                    <Reveal delay={200}>
                        <h3 className="text-3xl font-bold text-brand-dark mb-4 flex items-center gap-4">
                            <i className="fas fa-brain text-brand-teal"></i> AI Mentorship
                        </h3>
                    </Reveal>
                    <Reveal delay={300}>
                        <p className="text-text-gray mb-6 text-lg">
                            Dive deep into the world of Artificial Intelligence. Our mentors guide you through the theoretical foundations and practical applications of AI, preparing you for the future of tech.
                        </p>
                    </Reveal>
                    <Reveal delay={400}>
                        <ul className="space-y-3 mb-8">
                            {['Machine Learning Fundamentals', 'Neural Networks & Deep Learning', 'Real-world AI Project Development'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-brand-dark">
                                    <i className="fas fa-check-circle text-brand-amber"></i> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/courses?category=AI" className="bg-brand-amber text-brand-dark font-semibold px-8 py-3 rounded-full hover:bg-[#e6a200] transition transform hover:-translate-y-1 shadow-md inline-block">
                            Start Learning AI
                        </Link>
                    </Reveal>
                </div>
            </div>
        </div>

        {/* Block 2: Data Science (Reversed on desktop) */}
        <div className="py-20 border-b border-slate-200 bg-light-bg">
            <div className="container mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
                <div className="order-1 md:order-2">
                    <Reveal width="100%">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <Image 
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                alt="Data Science" 
                                width={800} 
                                height={600}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </Reveal>
                </div>
                <div className="order-2 md:order-1">
                    <Reveal delay={200}>
                        <h3 className="text-3xl font-bold text-brand-dark mb-4 flex items-center gap-4">
                            <i className="fas fa-chart-pie text-brand-teal"></i> Data Science Mentorship
                        </h3>
                    </Reveal>
                    <Reveal delay={300}>
                        <p className="text-text-gray mb-6 text-lg">
                            Data is the new oil. Learn how to extract insights, visualize trends, and make data-driven decisions. We cover the entire data pipeline from collection to interpretation.
                        </p>
                    </Reveal>
                    <Reveal delay={400}>
                        <ul className="space-y-3 mb-8">
                            {['Data Analytics & Visualization', 'Python/R for Data Science', 'Big Data Technologies'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-brand-dark">
                                    <i className="fas fa-check-circle text-brand-amber"></i> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/courses?category=Data%20Science" className="bg-brand-amber text-brand-dark font-semibold px-8 py-3 rounded-full hover:bg-[#e6a200] transition transform hover:-translate-y-1 shadow-md inline-block">
                            Join Data Track
                        </Link>
                    </Reveal>
                </div>
            </div>
        </div>

        {/* Block 3: Programming */}
        <div className="py-20 border-b border-slate-200">
            <div className="container mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
                <Reveal width="100%">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <Image 
                            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                            alt="Programming" 
                            width={800} 
                            height={600}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                </Reveal>
                <div>
                    <Reveal delay={200}>
                        <h3 className="text-3xl font-bold text-brand-dark mb-4 flex items-center gap-4">
                            <i className="fas fa-laptop-code text-brand-teal"></i> Programming Training
                        </h3>
                    </Reveal>
                    <Reveal delay={300}>
                        <p className="text-text-gray mb-6 text-lg">
                            Whether you are a complete beginner or looking to sharpen your skills, our programming track offers hands-on coding experience in essential languages and modern frameworks.
                        </p>
                    </Reveal>
                    <Reveal delay={400}>
                        <ul className="space-y-3 mb-8">
                            {['Web Development (Frontend & Backend)', 'Software Engineering Best Practices', 'Algorithms & Data Structures'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-brand-dark">
                                    <i className="fas fa-check-circle text-brand-amber"></i> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/courses?category=Programming" className="bg-brand-amber text-brand-dark font-semibold px-8 py-3 rounded-full hover:bg-[#e6a200] transition transform hover:-translate-y-1 shadow-md inline-block">
                            Start Coding
                        </Link>
                    </Reveal>
                </div>
            </div>
        </div>

        {/* Block 4: Webinars (Reversed) */}
        <div className="py-20 border-b border-slate-200 bg-light-bg">
            <div className="container mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
                <div className="order-1 md:order-2">
                    <Reveal width="100%">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <Image 
                                src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                alt="Webinars" 
                                width={800} 
                                height={600}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </Reveal>
                </div>
                <div className="order-2 md:order-1">
                    <Reveal delay={200}>
                        <h3 className="text-3xl font-bold text-brand-dark mb-4 flex items-center gap-4">
                            <i className="fas fa-video text-brand-teal"></i> Webinars & Seminars
                        </h3>
                    </Reveal>
                    <Reveal delay={300}>
                        <p className="text-text-gray mb-6 text-lg">
                            Gain access to exclusive sessions led by industry experts. We cover emerging tech trends, soft skills, leadership, and career growth strategies to keep you ahead of the curve.
                        </p>
                    </Reveal>
                    <Reveal delay={400}>
                        <ul className="space-y-3 mb-8">
                            {['Expert-led Tech Talks', 'Career Development Workshops', 'Leadership & Soft Skills'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-brand-dark">
                                    <i className="fas fa-check-circle text-brand-amber"></i> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/events" className="bg-brand-amber text-brand-dark font-semibold px-8 py-3 rounded-full hover:bg-[#e6a200] transition transform hover:-translate-y-1 shadow-md inline-block">
                            View Events
                        </Link>
                    </Reveal>
                </div>
            </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <section className="py-20 bg-brand-teal text-white text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Accelerate Your Career?</h2>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">Join thousands of learners and mentors making a difference in the tech world.</p>
            </Reveal>
            <Reveal delay={300}>
                <Link href="/courses" className="bg-white text-brand-teal font-bold px-8 py-4 rounded-full hover:bg-brand-amber hover:text-brand-dark transition-all transform hover:-translate-y-1 shadow-lg inline-block">
                    Get Started Today
                </Link>
            </Reveal>
        </div>
      </section>
    </>
  );
}