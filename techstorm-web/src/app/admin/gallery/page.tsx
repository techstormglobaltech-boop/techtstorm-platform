import { getGalleryImages } from "@/app/actions/gallery";
import GalleryManager from "@/components/admin/GalleryManager";

export const metadata: Metadata = {
  title: "Admin | Our Impactors",
  description: "Manage photos shown on the public impactors page.",
};

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Our Impactors</h1>
          <p className="text-slate-500 mt-1">Upload and manage photos for the public impactors page.</p>
        </div>
      </div>

      <GalleryManager initialImages={images} />
    </div>
  );
}
