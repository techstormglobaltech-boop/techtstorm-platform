"use client";

import { useActionState, Suspense } from "react";
import { authenticate } from "@/app/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginFormInner() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const isExpired = reason === "session_expired" || searchParams.get("expired") === "true";
  const callbackUrl = searchParams.get("callbackUrl") || "";

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-brand-dark">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm text-text-gray">
          Sign in to your account
        </p>
      </div>

      {isExpired && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 mt-0.5">
            <i className="fas fa-clock-rotate-left text-base"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-amber-900">Your session has expired</h3>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Please sign in again to continue your session.
            </p>
          </div>
        </div>
      )}

      <form action={dispatch} className="mt-8 space-y-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="rounded-md shadow-sm -space-y-px">
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
              autoComplete="current-password"
              required
              minLength={6}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-teal focus:border-brand-teal focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-brand-teal hover:text-[#006066]">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-teal hover:bg-[#006066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 transition-colors"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </div>
        
        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </form>
      
      <div className="text-center text-sm">
        <p className="text-text-gray">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-brand-teal hover:text-[#006066]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100 animate-pulse h-96 flex items-center justify-center text-slate-400">
        Loading...
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  );
}
