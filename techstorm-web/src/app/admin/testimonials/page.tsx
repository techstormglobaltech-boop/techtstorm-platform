import { getTestimonials } from "@/app/actions/admin/testimonials";
import TestimonialsList from "@/components/admin/testimonials/TestimonialsList";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-brand-dark">Testimonials</h1>
            <p className="text-slate-500">Manage student and mentor success stories.</p>
        </div>
      </div>
      <TestimonialsList testimonials={testimonials} />
    </div>
  );
}
