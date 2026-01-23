"use server";

import { db } from "@/lib/db";

export async function getHomeData() {
  try {
    const [courses, events, totalMentees, totalCourses, totalMentors] = await Promise.all([
      db.course.findMany({
        where: { status: "PUBLISHED" },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          instructor: { select: { name: true } },
          _count: { select: { modules: true } }
        }
      }),
      db.event.findMany({
        where: { date: { gte: new Date() } },
        take: 3,
        orderBy: { date: "asc" }
      }),
      db.user.count({ where: { role: "MENTEE" } }),
      db.course.count({ where: { status: "PUBLISHED" } }),
      db.user.count({ where: { role: "MENTOR" } }),
    ]);

    return {
      courses,
      events,
      stats: {
        totalMentees,
        totalCourses,
        totalMentors
      }
    };
  } catch (error) {
    console.error("Home data fetch error:", error);
    return null;
  }
}
