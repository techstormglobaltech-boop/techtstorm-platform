import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
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
      <LoginForm />
    </div>
  );
}
