"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [message, dispatch, isPending] = useActionState(forgotPassword, undefined);

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-brand-dark">
          Forgot Password
        </h2>
        <p className="mt-2 text-sm text-text-gray">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>
      <form action={dispatch} className="mt-8 space-y-6">
        <div>
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
          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-teal hover:bg-[#006066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 transition-colors"
          >
            {isPending ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
        
        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {message && (
            <p className={`text-sm ${message.includes("Check your email") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>
          )}
        </div>
      </form>
      
      <div className="text-center text-sm">
        <Link href="/login" className="font-medium text-brand-teal hover:text-[#006066]">
            Back to Sign in
        </Link>
      </div>
    </div>
  );
}
