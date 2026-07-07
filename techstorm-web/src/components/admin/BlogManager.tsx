"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

export default function BlogManager({ token }: { token?: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = currentId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/blog/${currentId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/blog`;
      
      const method = currentId ? "PATCH" : "POST";
      
      const body = {
        title,
        excerpt,
        content,
        coverImage,
        tags: tags.split(",").map(t => t.trim()).filter(t => t),
        isPublished
      };

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setIsEditing(false);
        resetForm();
        fetchPosts();
      } else {
        alert("Failed to save post");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (post: any) => {
    setCurrentId(post.id);
    setTitle(post.title);
    setExcerpt(post.excerpt || "");
    setContent(post.content);
    setTags(post.tags?.join(", ") || "");
    setCoverImage(post.coverImage || "");
    setIsPublished(post.isPublished);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setCurrentId(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setTags("");
    setCoverImage("");
    setIsPublished(false);
  };

  const handleAiDraft = async () => {
    if (!title && !content) {
      alert("Please provide a title or brief outline in the content area first.");
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/ai/enhance`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ outline: title + "\n" + content })
      });
      if (res.ok) {
        const data = await res.json();
        // Assuming AI returns { title, content, excerpt, tags }
        if (data.content) setContent(data.content);
        if (data.title) setTitle(data.title);
      }
    } catch (err) {
      console.error(err);
      alert("AI drafting failed.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "course-content"); // Using existing bucket or we can create a new one

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) setCoverImage(data.url);
      } else {
        alert("Image upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image.");
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-xl font-bold text-brand-dark">
            {currentId ? "Edit Post" : "Create New Post"}
          </h3>
          <div className="flex gap-3">
            <button 
              onClick={() => { setIsEditing(false); resetForm(); }}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-[#006066]"
            >
              Save Post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Post Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal bg-slate-50 hover:bg-white transition-all text-lg font-medium text-brand-dark"
                placeholder="E.g., The Future of AI in Education"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Article Content</label>
                <button 
                  onClick={handleAiDraft}
                  disabled={isGeneratingAi}
                  className="text-xs bg-brand-amber text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#d97706] transition-all shadow-sm shadow-brand-amber/20"
                >
                  <i className={`fas ${isGeneratingAi ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
                  {isGeneratingAi ? 'Drafting with AI...' : 'Draft with AI'}
                </button>
              </div>
              <div data-color-mode="light" className="rounded-xl overflow-hidden border border-slate-200 focus-within:ring-4 focus-within:ring-brand-teal/10 focus-within:border-brand-teal transition-all">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  height={600}
                  previewOptions={{
                    className: "prose prose-slate max-w-none"
                  }}
                  style={{ border: 'none', boxShadow: 'none' }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit shadow-inner">
            <h4 className="font-bold text-brand-dark flex items-center gap-2 border-b border-slate-200 pb-3">
              <i className="fas fa-sliders-h text-brand-teal"></i>
              Publishing Settings
            </h4>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Short Excerpt</label>
              <textarea 
                value={excerpt} 
                onChange={e => setExcerpt(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal bg-white transition-all text-sm text-slate-600 resize-none"
                rows={4}
                placeholder="A compelling summary for social media previews..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image</label>
              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="text" 
                  value={coverImage} 
                  onChange={e => setCoverImage(e.target.value)} 
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal bg-white transition-all text-sm"
                  placeholder="Paste URL..."
                />
                <label className="cursor-pointer bg-white border border-slate-200 hover:border-brand-teal hover:text-brand-teal text-slate-500 w-12 h-12 flex items-center justify-center rounded-xl transition-all shrink-0 shadow-sm">
                  <i className="fas fa-cloud-upload-alt text-lg"></i>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              {coverImage && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="Cover Preview" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tags</label>
              <input 
                type="text" 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal bg-white transition-all text-sm"
                placeholder="React, AI, Career"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={isPublished} 
                    onChange={e => setIsPublished(e.target.checked)} 
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-teal"></div>
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-brand-dark transition-colors">
                  Publish immediately
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-brand-dark">All Blog Posts</h3>
        <button 
          onClick={() => setIsEditing(true)}
          className="bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#006066] transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> New Post
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Author</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>Loading posts...</p>
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No blog posts found. Create your first one!
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-brand-dark">{post.title}</td>
                  <td className="p-4 text-slate-600">{post.author?.name || 'Unknown'}</td>
                  <td className="p-4">
                    {post.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Published</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick={() => handleEdit(post)} className="text-blue-500 hover:text-blue-700">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
