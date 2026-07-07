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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-teal outline-none"
                placeholder="Amazing Blog Post Title"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Content (Markdown)</label>
                <button 
                  onClick={handleAiDraft}
                  disabled={isGeneratingAi}
                  className="text-xs bg-brand-amber/20 text-brand-amber font-bold px-3 py-1 rounded-full flex items-center gap-2 hover:bg-brand-amber/30 transition-colors"
                >
                  <i className={`fas ${isGeneratingAi ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
                  {isGeneratingAi ? 'AI is thinking...' : 'Enhance with AI'}
                </button>
              </div>
              <div data-color-mode="light">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  height={500}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 h-fit">
            <h4 className="font-semibold text-brand-dark border-b pb-2">Publish Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
              <textarea 
                value={excerpt} 
                onChange={e => setExcerpt(e.target.value)} 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-teal outline-none text-sm"
                rows={3}
                placeholder="Short summary for SEO cards..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image</label>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="text" 
                  value={coverImage} 
                  onChange={e => setCoverImage(e.target.value)} 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-teal outline-none text-sm"
                  placeholder="Image URL or upload..."
                />
                <label className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0">
                  <i className="fas fa-upload"></i>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              {coverImage && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="Cover Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags (Comma separated)</label>
              <input 
                type="text" 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-teal outline-none text-sm"
                placeholder="React, AI, Career"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isPublished" 
                checked={isPublished} 
                onChange={e => setIsPublished(e.target.checked)} 
                className="w-4 h-4 text-brand-teal rounded focus:ring-brand-teal"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">
                Publish Immediately
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
