"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "react-hot-toast";

function SetupContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/setup-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to setup account");

      toast.success("Account setup complete! Redirecting...");
      
      // Save token (Assuming you have a way to persist session, e.g., via NextAuth or local storage)
      // For now, redirect to login with a success param or handle session.
      // Ideally, integrate with your auth provider here.
      
      setTimeout(() => {
        router.push("/login?setup=success");
      }, 1500);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return <div className="text-center p-10 text-red-500">Invalid Invitation Link</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Setup Your Account</h2>
          <p className="text-slate-500 mt-2">Welcome to TechStorm Global Team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}
