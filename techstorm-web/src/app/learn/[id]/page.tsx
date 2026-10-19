import { getCourseContent } from "@/app/actions/lesson";
import LessonPlayer from "@/components/learn/LessonPlayer";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn',
};

export default async function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.error === "SessionExpired") {
    redirect(`/login?reason=session_expired&callbackUrl=/learn/${id}`);
  }

  const course = await getCourseContent(id);

  if (!course) {
    redirect("/mentee/my-courses");
  }

  return <LessonPlayer course={course} />;
}
