import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from 'next';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/user";

export const metadata: Metadata = {
  title: 'Register',
};

export default async function RegisterPage() {
  const session = await auth();
  const isExpired = session?.error === "SessionExpired";

  if (session?.user && !isExpired) {
    if (session.user.role === UserRole.ADMIN) redirect("/admin");
    if (session.user.role === UserRole.MENTOR) redirect("/mentor");
    redirect("/mentee");
  }

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
      <RegisterForm />
    </div>
  );
}
