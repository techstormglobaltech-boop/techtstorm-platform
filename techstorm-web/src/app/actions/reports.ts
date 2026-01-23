"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

export async function getPlatformReports() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return null;

  // 1. Fetch real stats
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalCompletedLessons,
    totalLessons,
    categoryCounts
  ] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.enrollment.count(),
    db.lessonProgress.count({ where: { isCompleted: true } }),
    db.lesson.count(),
    db.course.groupBy({
        by: ['category'],
        _count: { id: true }
    })
  ]);

  const completionRate = totalLessons > 0 ? (totalCompletedLessons / totalLessons) * 100 : 0;
  
  const topCategories = categoryCounts.map(c => ({
    name: c.category || "Uncategorized",
    count: c._count.id
  }));

  // 2. Get AI Insights from FastAPI
  let aiInsights = {
    summary: "Generating live platform analysis...",
    insights: ["Calculating growth trends...", "Analyzing student behavior..."],
    recommendation: "Please wait while our AI analyst reviews your data."
  };

  try {
    const aiResponse = await fetch(`${AI_ENGINE_URL}/api/v1/reports/generate-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            total_users: totalUsers,
            total_courses: totalCourses,
            total_enrollments: totalEnrollments,
            completion_rate: Math.round(completionRate),
            top_categories: topCategories
        })
    });

    if (aiResponse.ok) {
        aiInsights = await aiResponse.json();
    }
  } catch (error) {
    console.error("AI Report Error:", error);
  }

  // 3. Recent Activity (for the table)
  const recentCompletions = await db.enrollment.findMany({
    take: 5,
    orderBy: { enrolledAt: "desc" },
    include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
    }
  });

  return {
    stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        completionRate: Math.round(completionRate),
        revenue: 0 // Placeholder
    },
    topCategories,
    aiInsights,
    recentCompletions
  };
}
