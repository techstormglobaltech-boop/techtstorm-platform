import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TechStorm Global',
  description: 'Privacy Policy for TechStorm Global platform.',
};

async function getPrivacyPolicy() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/legal/PRIVACY_POLICY`, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching Privacy Policy:", error);
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const doc = await getPrivacyPolicy();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-5">
          <div className="bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-slate-100">
            <header className="mb-12 border-b border-slate-100 pb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold font-playfair text-brand-dark mb-4">
                {doc?.title || 'Privacy Policy'}
              </h1>
              {doc?.updatedAt && (
                <p className="text-slate-500 font-medium">
                  Last Updated: {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </header>

            <article className="prose prose-slate prose-lg max-w-none prose-headings:font-playfair prose-headings:text-brand-dark prose-a:text-brand-teal hover:prose-a:text-brand-amber">
              <ReactMarkdown>
                {doc?.content || 'This document is currently being updated. Please check back later.'}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
