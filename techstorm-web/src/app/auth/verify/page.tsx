"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Verification failed");

        setStatus("success");
        toast.success("Email verified successfully!");
        
        // Auto-login logic (optional, depending on your auth setup)
        // For NextAuth, we usually redirect to login or try to set the session.
        // Since the backend returned a token, we could potentially use credentials login
        // but typically we just ask them to login now that they are verified.
        
        setTimeout(() => {
            router.push("/login?verified=true");
        }, 2000);

      } catch (error: any) {
        console.error(error);
        setStatus("error");
        toast.error(error.message);
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === "verifying" && (
          <div className="animate-pulse">
            <div className="h-16 w-16 bg-teal-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <i className="fas fa-spinner fa-spin text-2xl text-teal-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying...</h2>
            <p className="text-slate-500">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="h-16 w-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <i className="fas fa-check text-2xl text-green-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verified!</h2>
            <p className="text-slate-500 mb-6">Your email has been successfully verified. You can now access your account.</p>
            <button 
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="h-16 w-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
            <p className="text-slate-500 mb-6">The verification link is invalid or has expired.</p>
            <button 
              onClick={() => router.push("/register")}
              className="w-full py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Back to Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
