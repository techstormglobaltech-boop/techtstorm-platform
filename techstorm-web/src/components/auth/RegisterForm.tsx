"use client";

import { useActionState, useState } from "react"; // Correct import for React 19
import { register } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Wrapper to handle redirect on client side if successful
// Since server action returns object, we need to handle it. 
// We can't pass 'router.push' to server action.

export default function RegisterForm() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  
  // Custom wrapper to handle the server action result
  const handleRegister = async (prevState: any, formData: FormData) => {
    const result = await register(formData);
    if (result.success) {
      setEmail(formData.get("email") as string);
      setIsSuccess(true);
      return { success: result.message };
    }
    return { error: result.error };
  };

  const [state, dispatch, isPending] = useActionState(handleRegister, undefined);

  if (isSuccess) {
    return (
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-slate-100 text-center">
         <div className="h-16 w-16 bg-teal-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <i className="fas fa-envelope text-2xl text-teal-600"></i>
         </div>
         <h2 className="text-2xl font-bold text-slate-800">Check your email</h2>
         <p className="text-slate-500">
           We've sent a verification link to <span className="font-semibold text-slate-700">{email}</span>.
         </p>
         <p className="text-sm text-slate-400 mt-4">
           Please click the link in the email to activate your account.
         </p>
         <div className="pt-6">
           <Link href="/login" className="text-brand-teal hover:underline font-medium">
             Back to Login
           </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-brand-dark">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-text-gray">
          Join TechStorm today
        </p>
      </div>
      <form action={dispatch} className="mt-8 space-y-6">
        <div className="rounded-md shadow-sm -space-y-px">
          <div className="mb-4">
            <label htmlFor="name" className="sr-only">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-teal focus:border-brand-teal focus:z-10 sm:text-sm"
              placeholder="Full Name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-teal focus:border-brand-teal focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-teal focus:border-brand-teal focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-teal hover:bg-[#006066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 transition-colors"
          >
            {isPending ? "Creating Account..." : "Sign Up"}
          </button>
        </div>
        
        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
        </div>
      </form>

      <div className="text-center text-sm">
        <p className="text-text-gray">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-teal hover:text-[#006066]">
                Sign in
            </Link>
        </p>
      </div>
    </div>
  );
}
