import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-[#cbd5e1] pt-16 pb-8 border-t border-slate-800">
        <div className="container mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                {/* Brand Column */}
                <div className="flex flex-col items-center md:items-start">
                    <Link href="/" className="h-10 block mb-6">
                        <Image 
                            src="/logo.png" 
                            alt="TechStorm Global" 
                            width={160} 
                            height={40} 
                            style={{ height: 'auto' }}
                            className="h-full w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                        />
                    </Link>
                    <p className="text-sm text-slate-400 leading-relaxed text-center md:text-left mb-6">
                        Empowering the next generation of tech leaders through mentorship, practical training, and community.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-teal hover:text-white transition-all duration-300" aria-label="Facebook">
                            <i className="fab fa-facebook-f text-sm"></i>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-teal hover:text-white transition-all duration-300" aria-label="X (Twitter)">
                            <i className="fab fa-x-twitter text-sm"></i>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-teal hover:text-white transition-all duration-300" aria-label="LinkedIn">
                            <i className="fab fa-linkedin-in text-sm"></i>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-teal hover:text-white transition-all duration-300" aria-label="Instagram">
                            <i className="fab fa-instagram text-sm"></i>
                        </a>
                        <a href="https://www.youtube.com/channel/UC8M5v0tt1eWey4iphX6ai7Q" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all duration-300" aria-label="YouTube">
                            <i className="fab fa-youtube text-sm"></i>
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-white font-bold mb-6">Company</h4>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li><Link href="/about" className="hover:text-brand-teal transition-colors">About Us</Link></li>
                        <li><Link href="/team" className="hover:text-brand-teal transition-colors">Our Team</Link></li>
                        <li><Link href="/gallery" className="hover:text-brand-teal transition-colors">Our Impactors</Link></li>
                        <li><Link href="/contact" className="hover:text-brand-teal transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 className="text-white font-bold mb-6">Resources</h4>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li><Link href="/courses" className="hover:text-brand-teal transition-colors">Courses</Link></li>
                        <li><Link href="/events" className="hover:text-brand-teal transition-colors">Events</Link></li>
                        <li><Link href="/testimonials" className="hover:text-brand-teal transition-colors">Testimonials</Link></li>
                        <li><Link href="/blog" className="hover:text-brand-teal transition-colors">Blog</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="text-white font-bold mb-6">Get in Touch</h4>
                    <ul className="space-y-4 text-sm text-slate-400">
                        <li className="flex items-start gap-3">
                            <i className="fas fa-map-marker-alt mt-1 text-brand-teal"></i>
                            <span>Accra, Ghana</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <i className="fas fa-envelope mt-1 text-brand-teal"></i>
                            <a href="mailto:info@techstormglobal.com" className="hover:text-white transition-colors">info@techstormglobal.com</a>
                        </li>
                        <li className="flex items-start gap-3">
                            <i className="fas fa-phone mt-1 text-brand-teal"></i>
                            <a href="tel:+233249438890" className="hover:text-white transition-colors">+233 24 943 8890</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} TechStorm Global. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                </div>
            </div>
        </div>
    </footer>
  );
}