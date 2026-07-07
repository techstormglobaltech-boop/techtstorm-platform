import { getLatestNewsletter, getAllNewsletters } from "@/app/actions/newsletter";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function NewsletterPage() {
  const [latestNewsletter, allNewsletters] = await Promise.all([
    getLatestNewsletter(),
    getAllNewsletters()
  ]);

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4">TechStorm Weekly Digest</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stay ahead of the curve. Your weekly dose of AI and Software Engineering news, curated for students.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content - Latest Newsletter */}
            <div className="lg:col-span-2 flex-grow bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
              {latestNewsletter ? (
                <>
                  <div className="mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-3xl font-bold text-brand-dark mb-2">{latestNewsletter.title}</h2>
                    <p className="text-slate-500">
                      Published on {new Date(latestNewsletter.generatedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="prose prose-lg prose-slate max-w-none prose-headings:text-brand-dark prose-a:text-brand-teal hover:prose-a:text-[#005f66] prose-img:rounded-xl">
                    <ReactMarkdown>{latestNewsletter.content}</ReactMarkdown>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-5xl text-brand-teal/30 mb-4"><i className="fas fa-newspaper"></i></div>
                  <h3 className="text-2xl font-bold text-brand-dark mb-2">No News Yet</h3>
                  <p className="text-slate-500">Our AI is busy gathering the latest tech news. Check back soon!</p>
                </div>
              )}
            </div>

            {/* Sidebar - Archive */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-32">
                <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-slate-100 pb-2">Past Issues</h3>
                
                <div className="space-y-4">
                  {allNewsletters.length > 0 ? (
                    allNewsletters.filter((n: any) => n.id !== latestNewsletter?.id).slice(0, 5).map((newsletter: any) => (
                      <div key={newsletter.id} className="group cursor-pointer">
                        <h4 className="text-sm font-semibold text-brand-dark group-hover:text-brand-teal transition-colors line-clamp-2">
                          {newsletter.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(newsletter.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">No past issues available.</p>
                  )}
                </div>

                <div className="mt-8 bg-brand-teal/5 p-4 rounded-xl border border-brand-teal/10">
                  <h4 className="font-bold text-brand-dark text-sm mb-2">Want to learn more?</h4>
                  <p className="text-xs text-slate-600 mb-4">Join TechStorm Global and get mentored by industry experts.</p>
                  <Link href="/register" className="block text-center w-full bg-brand-teal text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#006b73] transition-colors">
                    Join Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
