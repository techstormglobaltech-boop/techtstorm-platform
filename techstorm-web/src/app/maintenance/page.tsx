import Link from "next/link";
import Image from "next/image";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-10 animate-pulse">
        <Image src="/logo.png" alt="TechStorm Global" width={200} height={60} className="object-contain" />
      </div>
      
      <div className="max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-brand-amber/10 text-brand-amber rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fas fa-tools"></i>
        </div>
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Under Maintenance</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
            We are currently performing some scheduled updates to improve your learning experience. 
            We'll be back online shortly!
        </p>
        
        <div className="pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-4">Are you an administrator?</p>
            <Link href="/login" className="text-brand-teal font-bold hover:underline text-sm">
                Login to Dashboard
            </Link>
        </div>
      </div>
      
      <p className="mt-10 text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} TechStorm Global. All rights reserved.
      </p>
    </div>
  );
}
