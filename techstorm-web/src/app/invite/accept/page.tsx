import { acceptInvitation } from "@/app/actions/invitations";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AcceptInvitePage({ searchParams }: { searchParams: Promise<{ token: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Invalid Link</h1>
            <p className="text-slate-500">The invitation link is missing or malformed.</p>
            <Link href="/" className="mt-6 inline-block text-brand-teal font-bold hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const result = await acceptInvitation(token);

  if (result.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md">
            <h1 className="text-2xl font-bold text-amber-500 mb-4">Oops!</h1>
            <p className="text-slate-500">{result.error}</p>
            <Link href="/" className="mt-6 inline-block text-brand-teal font-bold hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fas fa-check-circle"></i>
        </div>
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Welcome Aboard!</h1>
        <p className="text-slate-500 mb-8">
            Your invitation has been accepted. You are now enrolled in your new course.
        </p>
        <Link href={`/learn/${result.courseId}`} className="block w-full bg-brand-teal text-white font-bold py-4 rounded-xl hover:bg-[#006066] transition-all shadow-lg shadow-brand-teal/20">
            Go to My Course
        </Link>
      </div>
    </div>
  );
}
