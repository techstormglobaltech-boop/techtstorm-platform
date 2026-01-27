import Reveal from "@/components/ui/Reveal";
import { getGalleryImages } from "@/app/actions/gallery";
import GalleryGrid from "@/components/public/GalleryGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Impactors | TechStorm Global",
  description: "Explore our moments, events, and community highlights.",
};

export default async function GalleryPage() {
  const images = await getGalleryImages();
  console.log("Gallery Page Images:", images);

  return (
    <>
      {/* HERO SECTION */}
      <section className="pt-32 pb-16 bg-white text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-teal">Our Moments</h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg text-text-gray max-w-2xl mx-auto">
                    Explore the vibrant community, past events, and success stories at TechStorm.
                </p>
            </Reveal>
        </div>
      </section>

      <GalleryGrid initialItems={images} />
    </>
  );
}