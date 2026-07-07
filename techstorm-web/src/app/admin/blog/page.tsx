import BlogManager from "@/components/admin/BlogManager";
import { auth } from "@/auth";

export const metadata = {
  title: "Blog Engine | Admin | TechStorm Global",
};

export default async function AdminBlogPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark">Blog Engine</h2>
          <p className="text-slate-500 mt-1">
            Write, edit, and publish SEO-optimized articles.
          </p>
        </div>
      </div>

      <BlogManager token={token} />
    </div>
  );
}
