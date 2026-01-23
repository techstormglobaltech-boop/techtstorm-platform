"use client";
import { useState, useTransition } from "react";
import { createMeeting, deleteMeeting, approveSession, rejectSession } from "@/app/actions/meetings";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  link: string | null;
  status: string;
  course: { title: string };
  mentee?: { name: string; image: string | null; email: string };
}

interface MentorScheduleManagerProps {
  initialMeetings: any[];
  courses: any[];
}

export default function MentorScheduleManager({ initialMeetings, courses }: MentorScheduleManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Meeting | null>(null);
  const [approvalLink, setApprovalLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    link: "",
    courseId: courses[0]?.id || "",
    isRecurring: false,
    daysOfWeek: [] as string[],
    endDate: "",
  });

  const requests = initialMeetings.filter((m: Meeting) => m.status === 'REQUESTED');
  const scheduled = initialMeetings.filter((m: Meeting) => m.status === 'SCHEDULED' || m.status === 'APPROVED');

  const days = [
    { label: "S", value: "0" },
    { label: "M", value: "1" },
    { label: "T", value: "2" },
    { label: "W", value: "3" },
    { label: "T", value: "4" },
    { label: "F", value: "5" },
    { label: "S", value: "6" },
  ];

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !approvalLink) return;

    setIsSubmitting(true);
    const result = await approveSession(selectedRequest.id, approvalLink);
    setIsSubmitting(false);

    if (result.success) {
        toast.success("Session approved!");
        setIsApproveModalOpen(false);
        setApprovalLink("");
        setSelectedRequest(null);
        startTransition(() => {
            router.refresh();
        });
    } else {
        toast.error("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("Reject this session request?")) {
        const result = await rejectSession(id);
        if (result.success) {
            toast.success("Request rejected");
            startTransition(() => {
                router.refresh();
            });
        } else {
            toast.error("Failed to reject");
        }
    }
  };

  const toggleDay = (dayValue: string) => {
    setFormData(prev => ({
        ...prev,
        daysOfWeek: prev.daysOfWeek.includes(dayValue) 
            ? prev.daysOfWeek.filter(d => d !== dayValue)
            : [...prev.daysOfWeek, dayValue]
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) {
        toast.error("Please select a course first.");
        return;
    }

    if (formData.isRecurring && (formData.daysOfWeek.length === 0 || !formData.endDate)) {
        toast.error("Please select days and an end date for recurring sessions.");
        return;
    }
    
    setIsSubmitting(true);
    const result = await createMeeting(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(formData.isRecurring ? "All sessions scheduled!" : "Meeting scheduled!");
      setIsModalOpen(false);
      setFormData({ 
        title: "", 
        description: "", 
        startTime: "", 
        link: "", 
        courseId: courses[0]?.id || "",
        isRecurring: false,
        daysOfWeek: [],
        endDate: ""
      });
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Failed to schedule meeting");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to cancel this meeting?")) {
      const result = await deleteMeeting(id);
      if (result.success) {
        toast.success("Meeting cancelled");
        startTransition(() => {
          router.refresh();
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-teal text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#006066] transition-all shadow-md flex items-center gap-2"
        >
            <i className="fas fa-plus"></i> Schedule New Session
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {requests.length > 0 && (
            <div className="space-y-4">
                <h3 className="font-bold text-brand-dark flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Pending Requests
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((meeting: Meeting) => (
                        <div key={meeting.id} className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                    <i className="fas fa-user-friends"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-dark">{meeting.title}</h4>
                                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                        <span><i className="far fa-user mr-1"></i> {meeting.mentee?.name || "Student"}</span>
                                        <span><i className="far fa-clock mr-1"></i> {new Date(meeting.startTime).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{meeting.description}"</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleReject(meeting.id)}
                                    className="px-4 py-2 bg-white text-red-500 text-xs font-bold rounded-lg border border-slate-200 hover:bg-red-50 transition-colors"
                                >
                                    Reject
                                </button>
                                <button 
                                    onClick={() => { setSelectedRequest(meeting); setIsApproveModalOpen(true); }}
                                    className="px-4 py-2 bg-brand-dark text-white text-xs font-bold rounded-lg hover:bg-brand-teal transition-colors shadow-md"
                                >
                                    Approve & Link
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="space-y-4">
            <h3 className="font-bold text-brand-dark flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-teal"></span> Upcoming Sessions
            </h3>
            <AnimatePresence mode="popLayout">
                {scheduled.map((meeting: Meeting, index: number) => (
                    <motion.div 
                        key={meeting.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-brand-teal/30 transition-colors"
                    >
                        <div className="flex gap-5 items-center">
                            <div className="w-14 h-14 bg-brand-teal/10 rounded-xl flex flex-col items-center justify-center text-brand-teal shrink-0">
                                <span className="text-[10px] font-black uppercase">{new Date(meeting.startTime).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-xl font-black leading-none">{new Date(meeting.startTime).getDate()}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {meeting.mentee ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">1:1 Session</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-amber/10 text-brand-amber">Live Class</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-brand-dark group-hover:text-brand-teal transition-colors">{meeting.title}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><i className="far fa-clock"></i> {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="flex items-center gap-1.5"><i className="fas fa-book-open text-xs"></i> {meeting.course.title}</span>
                                    {meeting.mentee && (
                                        <span className="flex items-center gap-1.5 text-purple-600 font-medium"><i className="far fa-user text-xs"></i> {meeting.mentee.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <a 
                                href={meeting.link || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 md:flex-none px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-brand-teal hover:text-white transition-all text-center text-sm"
                            >
                                Start Session
                            </a>
                            <button 
                                onClick={() => handleDelete(meeting.id)}
                                className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {scheduled.length === 0 && (
                <div className="py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                        <i className="fas fa-video-slash"></i>
                    </div>
                    <p className="text-slate-500 font-medium">No sessions scheduled yet.</p>
                </div>
            )}
      </div>
      </div>

      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Session Request"
      >
        <form onSubmit={handleApprove} className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4">
                <p className="text-xs font-bold text-purple-800 uppercase mb-1">Request Details</p>
                <p className="text-sm font-bold text-brand-dark">{selectedRequest?.title}</p>
                <p className="text-xs text-slate-600 mt-1">{selectedRequest?.mentee?.name} • {selectedRequest?.course.title}</p>
                <p className="text-xs text-slate-500 mt-2 italic">"{selectedRequest?.description}"</p>
            </div>

            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Meeting Link</label>
                <input 
                    type="url" 
                    required
                    autoFocus 
                    placeholder="https://meet.google.com/..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                    value={approvalLink}
                    onChange={(e) => setApprovalLink(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">Paste your Zoom, Google Meet, or Teams link here.</p>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsApproveModalOpen(false)} className="flex-1 py-2.5 bg-slate-50 text-slate-500 font-bold rounded-lg hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#006066] shadow-md disabled:opacity-50">
                    {isSubmitting ? "Approving..." : "Confirm Approval"}
                </button>
            </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Schedule New Session"
      >
        <form onSubmit={handleCreate} className="space-y-4">
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Session Title</label>
                <input 
                    type="text" 
                    required 
                    placeholder="e.g. Weekly Q&A Session"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Select Course</label>
                <select 
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                >
                    <option value="">Select a course...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Start Date & Time</label>
                    <input 
                        type="datetime-local" 
                        required 
                        className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    />
                </div>
            </div>

            {/* Recurrence Toggle */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input 
                    type="checkbox" 
                    id="isRecurring"
                    className="w-4 h-4 accent-brand-teal"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                />
                <label htmlFor="isRecurring" className="text-sm font-bold text-slate-700 cursor-pointer">Repeat this session weekly</label>
            </div>

            <AnimatePresence>
                {formData.isRecurring && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4"
                    >
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Repeat On</label>
                            <div className="flex gap-2">
                                {days.map((day) => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        className={`w-9 h-9 rounded-full text-xs font-bold transition-all border ${
                                            formData.daysOfWeek.includes(day.value)
                                            ? 'bg-brand-teal border-brand-teal text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-brand-teal'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Repeat Until</label>
                            <input 
                                type="date" 
                                required={formData.isRecurring}
                                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Meeting Link (Meet, Zoom, etc.)</label>
                <input 
                    type="url" 
                    required 
                    placeholder="https://meet.google.com/..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Description (Optional)</label>
                <textarea 
                    rows={3} 
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-50 text-slate-500 font-bold rounded-lg hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#006066] shadow-md shadow-brand-teal/10 disabled:opacity-50">
                    {isSubmitting ? "Scheduling..." : "Schedule Session"}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
}
