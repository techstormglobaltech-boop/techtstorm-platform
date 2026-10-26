"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import Modal from "@/components/ui/Modal";
import { gradeSubmission } from "@/app/actions/submissions";
import { updateEnrollmentStatus } from "@/app/actions/mentor-stats";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface EnrolledCourse {
  id: string;
  title: string;
  enrolledAt: Date;
  enrollmentId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  paymentReference?: string | null;
  progress: number;
  quizAttempts: any[];
  submissions: any[];
}

interface Student {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  enrolledCourses: EnrolledCourse[];
}

interface StudentsManagerProps {
  initialStudents: Student[];
  initialTab?: "ACTIVE" | "PENDING";
}

export default function StudentsManager({ initialStudents, initialTab = "ACTIVE" }: StudentsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING">(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradeData, setGradeData] = useState({ grade: "", feedback: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingEnrollmentId, setProcessingEnrollmentId] = useState<string | null>(null);

  // Extract all pending enrollments
  const allPendingRequests = students.flatMap(student => 
    student.enrolledCourses
      .filter(c => c.status === "PENDING")
      .map(c => ({
        student,
        course: c,
      }))
  );

  // Students who have at least one approved course or no pending filter
  const activeStudents = students.filter(student => 
    student.enrolledCourses.some(c => c.status === "APPROVED" || !c.status)
  );

  const filteredStudents = (activeTab === "ACTIVE" ? activeStudents : students).filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingRequests = allPendingRequests.filter(req => 
    req.student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.course.paymentReference && req.course.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpdateEnrollmentStatus = async (
    enrollmentId: string, 
    newStatus: "APPROVED" | "REJECTED",
    studentName?: string,
    courseTitle?: string
  ) => {
    setProcessingEnrollmentId(enrollmentId);
    try {
      const result = await updateEnrollmentStatus(enrollmentId, newStatus);
      if (result.success) {
        toast.success(
          newStatus === "APPROVED" 
            ? `Approved ${studentName || "student"} for ${courseTitle || "course"}!` 
            : `Declined enrollment request.`
        );

        // Update local state smoothly
        setStudents(prev => 
          prev.map(s => ({
            ...s,
            enrolledCourses: s.enrolledCourses.map(c => 
              c.enrollmentId === enrollmentId ? { ...c, status: newStatus } : c
            )
          }))
        );

        if (selectedStudent) {
          setSelectedStudent(prev => prev ? {
            ...prev,
            enrolledCourses: prev.enrolledCourses.map(c => 
              c.enrollmentId === enrollmentId ? { ...c, status: newStatus } : c
            )
          } : null);
        }

        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.error || "Failed to update enrollment status.");
      }
    } catch (error) {
      toast.error("An error occurred while updating status.");
    } finally {
      setProcessingEnrollmentId(null);
    }
  };

  const handleGrade = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    
    setIsSubmitting(true);
    const result = await gradeSubmission(gradingSubmission.id, gradeData, courseId);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Grade saved!");
      setGradingSubmission(null);
      setGradeData({ grade: "", feedback: "" });
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error("Failed to save grade");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "ACTIVE"
                ? "bg-white text-brand-dark shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <i className="fas fa-user-graduate text-xs"></i>
            <span>Active Students</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {activeStudents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "PENDING"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <i className="fas fa-clock text-xs text-amber-500"></i>
            <span>Pending Approvals</span>
            {allPendingRequests.length > 0 && (
              <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                {allPendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
                type="text" 
                placeholder={activeTab === "PENDING" ? "Search by student, course, or ref..." : "Search by name or email..."} 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* VIEW 1: ACTIVE STUDENTS TABLE */}
      {activeTab === "ACTIVE" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
              <tr>
                <th className="p-5">Student Info</th>
                <th className="p-5">Approved Courses</th>
                <th className="p-5">Overall Progress</th>
                <th className="p-5">Joined</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, index) => {
                const approvedCourses = student.enrolledCourses.filter(c => c.status === "APPROVED" || !c.status);
                const avgProgress = approvedCourses.length > 0 
                  ? Math.round(approvedCourses.reduce((acc, curr) => acc + curr.progress, 0) / approvedCourses.length)
                  : 0;

                return (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-teal/10 overflow-hidden relative border border-slate-100 shrink-0">
                          {student.image ? (
                            <Image src={student.image} alt="Profile" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-teal font-bold">
                              {student.name?.[0] || student.email[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-brand-dark">{student.name || "Unknown"}</div>
                          <div className="text-xs text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-1">
                        {approvedCourses.map((c) => (
                          <div key={c.id} className="text-xs font-medium text-slate-600 truncate max-w-[220px]" title={c.title}>
                            • {c.title}
                          </div>
                        ))}
                        {approvedCourses.length === 0 && (
                          <span className="text-xs text-slate-400 italic">No approved courses</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                          <div 
                            className="h-full bg-brand-teal rounded-full" 
                            style={{ width: `${avgProgress}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-700 min-w-[35px]">{avgProgress}%</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500 text-xs">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                          <button 
                              onClick={() => setSelectedStudent(student)}
                              className="bg-slate-100 text-slate-700 hover:bg-brand-teal hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                              Review Performance
                          </button>
                          <button 
                              onClick={() => window.location.href = `mailto:${student.email}`}
                              className="text-slate-400 hover:text-brand-teal transition-colors p-2"
                              title="Email Student"
                          >
                              <i className="fas fa-envelope"></i>
                          </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 italic">
                    No active students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: PENDING APPROVALS TABLE */}
      {activeTab === "PENDING" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-amber-50/70 text-amber-900 font-bold uppercase text-xs border-b border-amber-100">
              <tr>
                <th className="p-5">Applicant</th>
                <th className="p-5">Course</th>
                <th className="p-5">Payment / MoMo Reference</th>
                <th className="p-5">Requested Date</th>
                <th className="p-5 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPendingRequests.map((req, index) => {
                const { student, course } = req;
                const isProcessing = processingEnrollmentId === course.enrollmentId;

                return (
                  <motion.tr 
                    key={course.enrollmentId || `${student.id}-${course.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 overflow-hidden relative border border-amber-200 shrink-0">
                          {student.image ? (
                            <Image src={student.image} alt="Profile" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-800 font-bold">
                              {student.name?.[0] || student.email[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-brand-dark">{student.name || "Unknown"}</div>
                          <div className="text-xs text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="font-bold text-brand-dark">{course.title}</div>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        Enrollment Request
                      </span>
                    </td>

                    <td className="p-5">
                      {course.paymentReference ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800">
                          <i className="fas fa-receipt text-brand-teal text-[11px]"></i>
                          <span>{course.paymentReference}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No reference provided</span>
                      )}
                    </td>

                    <td className="p-5 text-xs text-slate-500">
                      {new Date(course.enrolledAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>

                    <td className="p-5 text-right">
                      {course.enrollmentId && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateEnrollmentStatus(
                              course.enrollmentId!, 
                              "APPROVED",
                              student.name || student.email,
                              course.title
                            )}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <i className="fas fa-check"></i>
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleUpdateEnrollmentStatus(
                              course.enrollmentId!, 
                              "REJECTED",
                              student.name || student.email,
                              course.title
                            )}
                            disabled={isProcessing}
                            className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <i className="fas fa-times"></i>
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}

              {filteredPendingRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-400">
                    <i className="fas fa-check-circle text-3xl text-emerald-500/70 mb-2 block"></i>
                    <p className="font-medium text-slate-600">No pending enrollment requests.</p>
                    <p className="text-xs text-slate-400 mt-1">All applicant requests have been reviewed.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Modal 
            isOpen={!!selectedStudent} 
            onClose={() => setSelectedStudent(null)} 
            title={`Performance: ${selectedStudent?.name || 'Student'}`}
        >
            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedStudent.enrolledCourses.map((course, idx) => (
                    <motion.div 
                        key={course.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-4 pb-6 border-b border-slate-100 last:border-0"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-black text-brand-dark">{course.title}</h4>
                              {course.status && (
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                  course.status === "APPROVED" 
                                    ? "bg-emerald-100 text-emerald-700"
                                    : course.status === "PENDING"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-700"
                                }`}>
                                  Status: {course.status}
                                </span>
                              )}
                            </div>
                            <span className="text-xs bg-brand-teal/10 text-brand-teal px-2 py-1 rounded font-bold">
                              {course.progress}% Completed
                            </span>
                        </div>

                        {/* Inline Approval if pending */}
                        {course.status === "PENDING" && course.enrollmentId && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                            <div className="text-xs text-amber-900">
                              <span className="font-bold">Pending Approval</span>
                              {course.paymentReference && (
                                <span className="block text-slate-600 font-mono mt-0.5">Ref: {course.paymentReference}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateEnrollmentStatus(
                                  course.enrollmentId!,
                                  "APPROVED",
                                  selectedStudent.name || selectedStudent.email,
                                  course.title
                                )}
                                className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded shadow-sm hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateEnrollmentStatus(
                                  course.enrollmentId!,
                                  "REJECTED",
                                  selectedStudent.name || selectedStudent.email,
                                  course.title
                                )}
                                className="bg-white text-rose-600 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded hover:bg-rose-50"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Quizzes */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quiz Results</p>
                            {course.quizAttempts.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {course.quizAttempts.map((attempt, ai) => (
                                        <motion.div 
                                            key={ai} 
                                            whileHover={{ scale: 1.01 }}
                                            className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm border border-slate-100 transition-colors hover:border-brand-teal/30"
                                        >
                                            <span className="text-slate-600 truncate mr-4">{attempt.quiz?.title || "Quiz"}</span>
                                            <span className={`font-bold ${attempt.score / attempt.totalQuestions >= 0.7 ? 'text-green-600' : 'text-amber-600'}`}>
                                                {attempt.score}/{attempt.totalQuestions}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-slate-400 italic">No quizzes taken yet.</p>}
                        </div>

                        {/* Assignments */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignments</p>
                            {course.submissions.length > 0 ? (
                                <div className="space-y-2">
                                    {course.submissions.map((sub, si) => (
                                        <motion.div 
                                            key={si} 
                                            whileHover={{ y: -2 }}
                                            className="p-3 bg-white border border-slate-100 rounded-lg space-y-2 shadow-sm"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-brand-dark">{sub.assignment?.title || "Assignment"}</span>
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${sub.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            {sub.status === 'GRADED' ? (
                                                <div className="text-[11px] text-slate-500">
                                                    <span className="font-bold text-brand-teal">Grade: {sub.grade}</span>
                                                    <p className="italic mt-1 line-clamp-1">"{sub.feedback}"</p>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setGradingSubmission({...sub, courseId: course.id})}
                                                    className="w-full py-1.5 bg-brand-dark text-white text-[10px] font-bold rounded-md hover:bg-black transition-colors"
                                                >
                                                    Grade Work
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-slate-400 italic">No submissions yet.</p>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </Modal>
      )}

      {/* Mini Grading Modal */}
      {gradingSubmission && (
        <Modal 
            isOpen={!!gradingSubmission} 
            onClose={() => setGradingSubmission(null)} 
            title="Grade Assignment"
        >
            <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 whitespace-pre-line max-h-40 overflow-y-auto">
                    {gradingSubmission.content}
                </div>
                <form onSubmit={(e) => handleGrade(e, gradingSubmission.courseId)} className="space-y-4">
                    <input 
                        type="text" 
                        required 
                        placeholder="Grade (e.g. A, 90/100)" 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-teal"
                        value={gradeData.grade}
                        onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
                    />
                    <textarea 
                        rows={3} 
                        placeholder="Feedback..." 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-teal resize-none"
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setGradingSubmission(null)} className="flex-1 py-2 text-sm font-bold text-slate-500 bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-2 text-sm font-bold text-white bg-brand-teal rounded-lg disabled:opacity-50">
                            {isSubmitting ? "Saving..." : "Save Grade"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
      )}
    </div>
  );
}
