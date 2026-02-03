import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#f0fdff] to-[#fffbeb] px-4">
      <div className="mb-8">
        <Link href="/">
          <Image 
            src="/logo.png" 
            alt="TechStorm Global" 
            width={180} 
            height={50} 
            className="object-contain"
            priority
          />
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
