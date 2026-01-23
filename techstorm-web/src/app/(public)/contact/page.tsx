"use client";
import { useState, FormEvent } from 'react';
import Reveal from "@/components/ui/Reveal";

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert(`Thank you, ${formData.name}! We have received your message.`);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <section className="pt-32 pb-20 bg-brand-teal text-white text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg opacity-90">We are just one message away from starting your journey.</p>
            </Reveal>
        </div>
      </section>

      <div className="container mx-auto px-5 pb-20">
        <Reveal width="100%" delay={300}>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden -mt-12 relative z-10 grid md:grid-cols-5">
                
                {/* Form Section */}
                <div className="p-10 md:p-14 md:col-span-3">
                    <h2 className="text-3xl font-bold text-brand-dark mb-4">Get in Touch</h2>
                    <p className="text-text-gray mb-8">Have questions about our mentorship programs or services? We’d love to hear from you!</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-brand-dark font-semibold mb-2">Your Name</label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-light-bg border-2 border-slate-200 rounded-lg focus:outline-none focus:border-brand-teal focus:bg-white transition-colors"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-brand-dark font-semibold mb-2">Email Address</label>
                            <input 
                                type="email" 
                                className="w-full p-4 bg-light-bg border-2 border-slate-200 rounded-lg focus:outline-none focus:border-brand-teal focus:bg-white transition-colors"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-brand-dark font-semibold mb-2">Message</label>
                            <textarea 
                                rows={5}
                                className="w-full p-4 bg-light-bg border-2 border-slate-200 rounded-lg focus:outline-none focus:border-brand-teal focus:bg-white transition-colors resize-none"
                                placeholder="How can we help you?"
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-brand-amber text-brand-dark font-bold py-4 rounded-lg hover:bg-[#e6a200] transition-transform transform hover:-translate-y-1 shadow-md">
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Info Section */}
                <div className="bg-light-bg p-10 md:p-14 md:col-span-2 flex flex-col justify-between border-l-0 md:border-l border-slate-200">
                    <div>
                        <h3 className="text-xl font-bold text-brand-dark mb-8">Contact Information</h3>
                        
                        <div className="flex gap-4 mb-8">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-teal shadow-sm shrink-0">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-dark">Our Office</h4>
                                <p className="text-text-gray text-sm">Headquarters – East Legon,<br/>Accra, Ghana</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-8">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-teal shadow-sm shrink-0">
                                <i className="fas fa-phone-alt"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-dark">Call Us</h4>
                                <p className="text-text-gray text-sm">+233 (0) 555-555-555</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-8">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-teal shadow-sm shrink-0">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-dark">Email Us</h4>
                                <p className="text-text-gray text-sm">hello@techstormglobal.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 h-48 rounded-xl overflow-hidden shadow-md">
                         <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31756.26526830578!2d-0.17066779999999998!3d5.6427778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9c7eb4659b8d%3A0x8e83161358c54d58!2sEast%20Legon%2C%20Accra!5e0!3m2!1sen!2sgh!4v1700000000000!5m2!1sen!2sgh" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen={true} 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>
        </Reveal>
      </div>
    </>
  );
}