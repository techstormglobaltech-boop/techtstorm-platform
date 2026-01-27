"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-5">
        <nav className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="h-[50px] flex items-center">
                 <Image 
                    src="/logo.png" 
                    alt="TechStorm Global" 
                    width={180} 
                    height={60} 
                    className="h-full w-auto object-contain"
                    priority
                 />
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden md:flex items-center gap-8">
                <li><Link href="/" className="font-medium text-brand-dark hover:text-brand-teal transition-colors">Home</Link></li>
                <li><Link href="/about" className="font-medium text-brand-dark hover:text-brand-teal transition-colors">About</Link></li>
                <li><Link href="/services" className="font-medium text-brand-dark hover:text-brand-teal transition-colors">Services</Link></li>
                <li><Link href="/gallery" className="font-medium text-brand-dark hover:text-brand-teal transition-colors">Our Impactors</Link></li>
                
                {/* Dropdown */}
                <li 
                    className="relative group cursor-pointer font-medium text-brand-dark hover:text-brand-teal transition-colors"
                >
                    <span className="flex items-center gap-1 py-4">More <i className="fas fa-chevron-down text-xs ml-1"></i></span>
                    <ul className="absolute top-full left-0 bg-white shadow-xl rounded-lg w-56 py-2 mt-0 border-t-4 border-brand-amber opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                         <li><Link href="/courses" className="block px-6 py-3 text-sm text-text-gray hover:bg-light-bg hover:text-brand-teal hover:pl-8 transition-all">Courses</Link></li>
                         <li><Link href="/team" className="block px-6 py-3 text-sm text-text-gray hover:bg-light-bg hover:text-brand-teal hover:pl-8 transition-all">Team</Link></li>
                         <li><Link href="/testimonials" className="block px-6 py-3 text-sm text-text-gray hover:bg-light-bg hover:text-brand-teal hover:pl-8 transition-all">Testimonials</Link></li>
                         <li><Link href="/events" className="block px-6 py-3 text-sm text-text-gray hover:bg-light-bg hover:text-brand-teal hover:pl-8 transition-all">Events</Link></li>
                    </ul>
                </li>

                <li><Link href="/contact" className="bg-brand-amber text-brand-dark font-semibold px-8 py-3 rounded-full hover:bg-[#e6a200] transition-transform transform hover:-translate-y-1 shadow-md hover:shadow-lg">Contact Us</Link></li>
            </ul>

            {/* Mobile Toggle */}
            <button className="md:hidden text-2xl text-brand-teal focus:outline-none" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`md:hidden fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-white p-8 transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-inner`}>
            <ul className="flex flex-col gap-6 items-start">
                <li><Link href="/" className="text-xl font-medium text-brand-dark block w-full" onClick={() => setIsOpen(false)}>Home</Link></li>
                <li><Link href="/about" className="text-xl font-medium text-brand-dark block w-full" onClick={() => setIsOpen(false)}>About</Link></li>
                <li><Link href="/services" className="text-xl font-medium text-brand-dark block w-full" onClick={() => setIsOpen(false)}>Services</Link></li>
                <li><Link href="/gallery" className="text-xl font-medium text-brand-dark block w-full" onClick={() => setIsOpen(false)}>Our Impactors</Link></li>
                
                <li className="w-full">
                    <div className="flex justify-between items-center text-xl font-medium text-brand-dark cursor-pointer py-2" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        More <i className={`fas fa-chevron-down text-sm transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                    </div>
                    {dropdownOpen && (
                        <ul className="mt-2 pl-4 border-l-2 border-brand-teal space-y-3">
                            <li><Link href="/courses" className="block py-2 text-text-gray hover:text-brand-teal" onClick={() => setIsOpen(false)}>Courses</Link></li>
                            <li><Link href="/team" className="block py-2 text-text-gray hover:text-brand-teal" onClick={() => setIsOpen(false)}>Team</Link></li>
                            <li><Link href="/testimonials" className="block py-2 text-text-gray hover:text-brand-teal" onClick={() => setIsOpen(false)}>Testimonials</Link></li>
                            <li><Link href="/events" className="block py-2 text-text-gray hover:text-brand-teal" onClick={() => setIsOpen(false)}>Events</Link></li>
                        </ul>
                    )}
                </li>

                <li className="pt-6 w-full"><Link href="/contact" className="block w-full text-center bg-brand-amber text-brand-dark font-semibold px-8 py-4 rounded-full text-lg shadow-md" onClick={() => setIsOpen(false)}>Contact Us</Link></li>
            </ul>
        </div>
      </div>
    </header>
  );
}
