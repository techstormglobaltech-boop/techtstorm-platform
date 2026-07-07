import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';

async function getPost(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found | TechStorm Global' };

  return {
    title: `${post.title} | TechStorm Blog`,
    description: post.excerpt || "Read this article on TechStorm Global",
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.coverImage ? [post.coverImage] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-brand-dark mb-4">Post Not Found</h1>
            <p className="text-slate-600 mb-8">The article you are looking for does not exist or has been removed.</p>
            <Link href="/blog" className="bg-brand-teal text-white px-6 py-3 rounded-full hover:bg-[#006066]">
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-white">
        
        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-5 text-center mb-12">
          <div className="flex gap-2 justify-center flex-wrap mb-6">
            {post.tags?.map((tag: string) => (
              <Link key={tag} href={`/blog?tag=${tag}`} className="text-xs font-bold uppercase tracking-wider text-brand-amber bg-brand-amber/10 px-3 py-1.5 rounded-full hover:bg-brand-amber/20 transition-colors">
                {tag}
              </Link>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark mb-8 font-playfair leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden relative border-2 border-white shadow-sm">
                {post.author?.image ? (
                  <Image src={post.author.image} alt={post.author.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-dark flex items-center justify-center text-lg text-white font-bold">
                    {post.author?.name?.charAt(0) || "T"}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">{post.author?.name || "TechStorm Team"}</p>
                <p className="text-xs">{post.author?.title || "Contributor"}</p>
              </div>
            </div>
            <div className="h-10 border-l border-slate-200"></div>
            <div className="text-left">
              <p className="font-medium text-slate-700">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-xs flex items-center gap-1">
                <i className="far fa-clock"></i> {post.readTime} min read
              </p>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="max-w-6xl mx-auto px-5 mb-16">
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-5">
          <div className="prose prose-lg prose-slate max-w-none prose-headings:font-playfair prose-headings:text-brand-dark prose-a:text-brand-teal hover:prose-a:text-brand-amber prose-img:rounded-xl">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
          
          {/* Bottom CTA */}
          <div className="mt-20 p-10 bg-slate-50 rounded-3xl border border-slate-100 text-center">
            <h3 className="text-3xl font-bold font-playfair text-brand-dark mb-4">Loved this article?</h3>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto">
              Join TechStorm Global today and start your journey towards mastering software engineering and AI.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/courses" className="bg-brand-teal text-white px-8 py-4 rounded-full font-bold hover:bg-[#006066] transition-transform hover:-translate-y-1 shadow-lg">
                Explore Courses
              </Link>
              <Link href="/newsletter" className="bg-white text-brand-dark px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-transform hover:-translate-y-1 shadow-md border border-slate-200">
                Subscribe to Tech News
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
