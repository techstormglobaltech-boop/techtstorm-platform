"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, dispatch, isPending] = useActionState(resetPassword, undefined);

  if (!token) {
    return (
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">Invalid Link</h2>
        <p className="text-gray-600 mb-6">This password reset link is invalid or missing the token.</p>
        <Link href="/login" className="text-brand-teal hover:underline">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-brand-dark">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-text-gray">
          Enter your new password below.
        </p>
      </div>
      <form action={dispatch} className="mt-8 space-y-6">
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="password" className="sr-only">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-teal focus:border-brand-teal focus:z-10 sm:text-sm"
            placeholder="New Password"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-teal hover:bg-[#006066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 transition-colors"
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </button>
        </div>
        
        <div className="flex h-8 items-end space-x-1 justify-center" aria-live="polite" aria-atomic="true">
          {message && (
            <div className="text-center">
                <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                {message}
                </p>
                {message.includes("success") && (
                    <Link href="/login" className="block mt-2 text-brand-teal underline">
                        Sign in with new password
                    </Link>
                )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
