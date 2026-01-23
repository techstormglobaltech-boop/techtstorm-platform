"use client";
import { useState, useTransition } from "react";
import { gradeSubmission } from "@/app/actions/submissions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";

interface SubmissionsManagerProps {
  initialSubmissions: any[];
  courseId: string;
}

export default function SubmissionsManager({ initialSubmissions, courseId }: SubmissionsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeSubmission, setActiveSubmission] = useState<any>(null);
  const [gradeData, setGradeData] = useState({ grade: "", feedback: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeData.grade) return;

    setIsSubmitting(true);
    const result = await gradeSubmission(activeSubmission.id, gradeData, courseId);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Submission graded!");
      setActiveSubmission(null);
      setGradeData({ grade: "", feedback: "" });
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error("Failed to save grade");
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
          <tr>
            <th className="p-5">Student</th>
            <th className="p-5">Assignment</th>
            <th className="p-5">Submitted</th>
            <th className="p-5">Status</th>
            <th className="p-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {initialSubmissions.map((sub) => (
            <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
              <td className="p-5">
                <div className="font-bold text-brand-dark">{sub.user.name}</div>
                <div className="text-xs text-slate-400">{sub.user.email}</div>
              </td>
              <td className="p-5 font-medium text-slate-600">{sub.assignment.title}</td>
              <td className="p-5 text-slate-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
              <td className="p-5">
                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                  sub.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {sub.status}
                </span>
              </td>
              <td className="p-5 text-right">
                <button 
                  onClick={() => setActiveSubmission(sub)}
                  className="bg-brand-teal text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-[#006066] transition-colors"
                >
                  {sub.status === 'GRADED' ? 'View/Edit' : 'Review'}
                </button>
              </td>
            </tr>
          ))}
          {initialSubmissions.length === 0 && (
            <tr>
              <td colSpan={5} className="p-20 text-center text-slate-400 italic">
                No submissions found for this course yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Grading Modal */}
      {activeSubmission && (
        <Modal 
          isOpen={!!activeSubmission} 
          onClose={() => setActiveSubmission(null)} 
          title="Review Submission"
        >
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Student Work</p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-line max-h-60 overflow-y-auto">
                {activeSubmission.content}
              </div>
            </div>

            <form onSubmit={handleGrade} className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. A, 90/100"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-brand-teal"
                    value={gradeData.grade}
                    onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Feedback</label>
                <textarea 
                  rows={4}
                  placeholder="Tell the student how they did..."
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-brand-teal resize-none text-sm"
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveSubmission(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#006066] shadow-md disabled:opacity-50"
                >
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
