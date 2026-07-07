import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: "Blog | TechStorm Global",
  description: "Read the latest insights, tutorials, and success stories from TechStorm Global.",
};

async function getPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-slate-50">
        <div className="container mx-auto px-5 max-w-7xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-playfair">
              The TechStorm <span className="text-brand-teal">Journal</span>
            </h1>
            <p className="text-slate-600 text-lg">
              Insights, tutorials, and inspiration from the forefront of technology education.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
              <i className="fas fa-book-open text-5xl text-brand-teal/30 mb-4"></i>
              <h3 className="text-2xl font-bold text-slate-700">No Posts Yet</h3>
              <p className="text-slate-500 mt-2">Check back soon for amazing content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any, i: number) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group h-full">
                  <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
                    <div className="relative h-56 w-full bg-slate-200 overflow-hidden">
                      {post.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-teal/20 to-brand-amber/20 flex items-center justify-center">
                          <i className="fas fa-code text-4xl text-brand-teal/40"></i>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex gap-2 flex-wrap mb-4">
                        {post.tags?.slice(0,2).map((tag: string) => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-brand-teal bg-brand-teal/10 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-bold text-brand-dark mb-3 group-hover:text-brand-teal transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1">
                        {post.excerpt || post.content.substring(0, 120) + "..."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden relative">
                            {post.author?.image ? (
                              <Image src={post.author.image} alt={post.author.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-brand-dark flex items-center justify-center text-xs text-white font-bold">
                                {post.author?.name?.charAt(0) || "T"}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{post.author?.name || "TechStorm"}</p>
                            <p className="text-[10px] text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                          {post.readTime} min read
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
