"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-subtle border-t border-border-subtle relative z-20">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-start gap-12 w-full">
        {/* Brand & Mission Info */}
        <div className="flex flex-col max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <span className="text-headline-md font-headline-md text-primary tracking-tight">TechStorm</span>
          </div>
          <p className="text-body-sm font-body-sm text-text-muted leading-relaxed mb-4">
            Empowering emerging African tech leaders in AI, Data Science & Software Engineering through industry-calibrated coursework, 1-on-1 mentorship, and project acceleration.
          </p>
          
          {/* Contact Meta */}
          <div className="space-y-1.5 text-xs text-on-surface-variant font-code-snippet">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
              <span>Accra Campus, Greater Accra Region, Ghana</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">phone</span>
              <span>+233 54 868 4980</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
              <span>millsclifford10@gmail.com</span>
            </div>
          </div>
        </div>
        
        {/* Links Cluster 1: Curriculum */}
        <div>
          <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-4">Academic Tracks</h4>
          <ul className="space-y-2.5">
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/courses">Computer Vision & Edge AI</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/courses">Python & Data Analytics</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/courses">Full-Stack Web Architecture</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/courses">Generative AI Engineering</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/courses">Cloud & DevOps Systems</Link></li>
          </ul>
        </div>
        
        {/* Links Cluster 2: Community & Institution */}
        <div>
          <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-4">Ecosystem</h4>
          <ul className="space-y-2.5">
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/about">Mentorship Fellows</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/about">Scholarships & Aid</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/about">Accra Campus & Hubs</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/about">Impact Report</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/about">Discord Community</Link></li>
          </ul>
        </div>
        
        {/* Links Cluster 3: Institutional Links */}
        <div>
          <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-4">Governance</h4>
          <ul className="space-y-2.5">
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/privacy">Privacy Policy</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/terms">Terms of Service</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/terms">Academic Integrity Code</Link></li>
            <li><Link className="text-text-muted font-body-sm text-body-sm hover:text-primary transition-colors duration-150" href="/terms">Security Disclosure</Link></li>
          </ul>
        </div>
      </div>
      
      {/* Subfooter */}
      <div className="border-t border-border-subtle/80 max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <p className="font-body-sm text-body-sm text-center sm:text-left">
          © 2026 TechStorm Global. Accra, Ghana. Empowering emerging African tech leaders in AI, Data Science & Software Engineering.
        </p>
        <div className="flex items-center gap-4">
          <Link className="hover:text-primary transition-colors" href="#">Twitter (X)</Link>
          <Link className="hover:text-primary transition-colors" href="#">LinkedIn</Link>
          <Link className="hover:text-primary transition-colors" href="#">GitHub</Link>
          <Link className="hover:text-primary transition-colors" href="#">YouTube</Link>
        </div>
      </div>
    </footer>
  );
}