import { getGalleryImages } from "@/app/actions/gallery";
import GalleryManager from "@/components/admin/GalleryManager";

export const metadata = {
  title: "Admin | Gallery Manager",
  description: "Manage photos shown on the public gallery page.",
};

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">Gallery Manager</h1>
        <p className="text-slate-500 mt-1">Upload and manage photos for the public gallery.</p>
      </div>

      <GalleryManager initialImages={images} />
    </div>
  );
}
