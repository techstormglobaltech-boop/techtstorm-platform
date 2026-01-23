import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-[#cbd5e1] py-16 pb-8 text-center mt-auto border-t border-slate-800">
        <div className="container mx-auto px-5">
            <div className="mb-8 flex justify-center">
                <Link href="/" className="h-12 block">
                    <Image 
                        src="/logo.png" 
                        alt="TechStorm Global" 
                        width={180} 
                        height={48} 
                        style={{ height: 'auto' }}
                        className="h-full w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                    />
                </Link>
            </div>
            <div className="flex justify-center gap-6 mb-8 text-xl">
                <a href="#" className="hover:text-brand-teal transition-colors"><i className="fab fa-facebook"></i></a>
                <a href="#" className="hover:text-brand-teal transition-colors"><i className="fab fa-twitter"></i></a>
                <a href="#" className="hover:text-brand-teal transition-colors"><i className="fab fa-linkedin"></i></a>
                <a href="#" className="hover:text-brand-teal transition-colors"><i className="fab fa-instagram"></i></a>
            </div>
            <p className="opacity-60 text-sm tracking-wide">&copy; {new Date().getFullYear()} TechStorm Global. All rights reserved.</p>
        </div>
    </footer>
  );
}
