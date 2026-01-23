"use server";

import { db } from "@/lib/db";

export async function getPublishedCourses() {
  const courses = await db.course.findMany({
    where: {
      status: "PUBLISHED"
    },
    include: {
      instructor: {
        select: { name: true }
      },
      _count: {
        select: { modules: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return courses;
}

export async function getCourseById(id: string) {
  const course = await db.course.findUnique({
    where: { id },
    include: {
      instructor: {
        select: { name: true, image: true, email: true }
      },
      modules: {
        include: {
          lessons: true
        },
        orderBy: { position: "asc" }
      },
      _count: {
        select: { enrollments: true }
      }
    }
  });

  return course;
}
