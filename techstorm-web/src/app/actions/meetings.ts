"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getEnrolledCourses() {
  const session = await auth();
  if (!session?.user?.id) return [];
  
  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: { select: { id: true, title: true } } }
  });
  
  return enrollments.map(e => e.course);
}

export async function createMeeting(data: {
  title: string;
  description?: string;
  startTime: string;
  link: string;
  courseId: string;
  isRecurring?: boolean;
  daysOfWeek?: string[]; // e.g. ["1", "3", "5"] for Mon, Wed, Fri
  endDate?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "MENTOR" && session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    if (!data.isRecurring) {
      // Single Meeting logic
      await db.meeting.create({
        data: {
          title: data.title,
          description: data.description,
          startTime: new Date(data.startTime),
          link: data.link,
          courseId: data.courseId,
          mentorId: session.user.id!,
        },
      });
    } else {
      // Recurring Meeting Logic
      const start = new Date(data.startTime);
      const end = new Date(data.endDate!);
      const selectedDays = data.daysOfWeek?.map(Number) || []; // Convert to numbers [0-6]
      
      const meetingsToCreate: any[] = [];
      let current = new Date(start);

      while (current <= end) {
        if (selectedDays.includes(current.getDay())) {
          meetingsToCreate.push({
            title: data.title,
            description: data.description,
            startTime: new Date(current),
            link: data.link,
            courseId: data.courseId,
            mentorId: session.user.id!,
          });
        }
        // Move to next day
        current.setDate(current.getDate() + 1);
      }

      if (meetingsToCreate.length > 0) {
        await db.meeting.createMany({
          data: meetingsToCreate
        });
      }
    }

    revalidatePath("/mentor/schedule");
    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    console.error("Meeting creation error:", error);
    return { error: "Failed to schedule sessions" };
  }
}

export async function getMentorMeetings() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.meeting.findMany({
    where: { 
        mentorId: session.user.id,
        startTime: {
            gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // Show last 24h history too
        }
    },
    include: { 
        course: { select: { title: true } },
        mentee: { select: { name: true, image: true, email: true } }
    },
    orderBy: { startTime: "asc" },
  });
}

export async function approveSession(meetingId: string, link: string) {
  const session = await auth();
  if (session?.user?.role !== "MENTOR") return { error: "Unauthorized" };

  try {
    await db.meeting.update({
        where: { id: meetingId, mentorId: session.user.id },
        data: { 
            status: "SCHEDULED",
            link: link
        }
    });
    revalidatePath("/mentor/schedule");
    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    return { error: "Failed to approve session" };
  }
}

export async function rejectSession(meetingId: string) {
  const session = await auth();
  if (session?.user?.role !== "MENTOR") return { error: "Unauthorized" };

  try {
    await db.meeting.update({
        where: { id: meetingId, mentorId: session.user.id },
        data: { status: "CANCELLED" }
    });
    revalidatePath("/mentor/schedule");
    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    return { error: "Failed to reject session" };
  }
}

export async function getMenteeMeetings() {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Get meetings for courses the user is enrolled in (lectures) OR private sessions
  return await db.meeting.findMany({
    where: {
      OR: [
        {
          course: { enrollments: { some: { userId: session.user.id } } },
          menteeId: null // Public lectures
        },
        {
          menteeId: session.user.id // Private sessions
        }
      ],
      startTime: {
        gte: new Date(new Date().getTime() - 60 * 60 * 1000)
      }
    },
    include: {
      course: { select: { title: true } },
      mentor: { select: { name: true } }
    },
    orderBy: { startTime: "asc" },
  });
}

export async function requestSession(data: {
  title: string;
  description: string;
  startTime: string;
  courseId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const course = await db.course.findUnique({
      where: { id: data.courseId },
      select: { instructorId: true }
    });

    if (!course) return { error: "Course not found" };

    await db.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        courseId: data.courseId,
        mentorId: course.instructorId,
        menteeId: session.user.id,
        status: "REQUESTED", // Requires schema update
        link: "",
      }
    });

    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    console.error("Booking error:", error);
    return { error: "Failed to request session" };
  }
}

export async function deleteMeeting(id: string) {
  const session = await auth();
  if (session?.user?.role !== "MENTOR" && session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await db.meeting.delete({ where: { id } });
    revalidatePath("/mentor/schedule");
    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete meeting" };
  }
}
