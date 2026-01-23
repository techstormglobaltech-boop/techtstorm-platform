import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Spinning Ring */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-teal rounded-full animate-spin border-t-transparent"></div>
        
        {/* Center Logo Icon */}
        <div className="relative w-12 h-12">
            <Image 
                src="/Asset 3.png" 
                alt="Loading..." 
                fill 
                className="object-contain animate-pulse"
            />
        </div>
      </div>
    </div>
  );
}
