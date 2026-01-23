"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { requestSession } from "@/app/actions/meetings";
import toast from "react-hot-toast";

interface MenteeScheduleViewProps {
  initialMeetings: any[];
  courses: any[];
}

export default function MenteeScheduleView({ initialMeetings, courses }: MenteeScheduleViewProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    title: "",
    description: "",
    courseId: "",
    date: "",
    time: ""
  });

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.courseId || !bookingForm.date || !bookingForm.time) {
        toast.error("Please fill in all required fields");
        return;
    }

    setIsSubmitting(true);
    const startTime = `${bookingForm.date}T${bookingForm.time}:00`;
    
    const result = await requestSession({
        title: bookingForm.title || "1:1 Session Request",
        description: bookingForm.description,
        startTime,
        courseId: bookingForm.courseId
    });
    
    setIsSubmitting(false);

    if (result.success) {
        toast.success("Session requested! Your mentor will confirm shortly.");
        setIsBookingOpen(false);
        setBookingForm({ title: "", description: "", courseId: "", date: "", time: "" });
        // Ideally trigger refresh, but server action revalidates path
    } else {
        toast.error(result.error || "Failed to request session");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
            onClick={() => setIsBookingOpen(true)}
            className="bg-brand-teal text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#006066] transition-colors shadow-lg shadow-brand-teal/20 flex items-center gap-2"
        >
            <i className="fas fa-plus"></i> Book Session
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {initialMeetings.map((meeting, index) => (
            <motion.div 
              key={meeting.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all group"
            >
              <div className="flex gap-5 items-center">
                <div className="w-16 h-16 bg-brand-teal/5 rounded-2xl flex flex-col items-center justify-center text-brand-teal shrink-0 border border-brand-teal/10">
                  <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(meeting.startTime).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-2xl font-black leading-none">{new Date(meeting.startTime).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                      {meeting.menteeId ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">1:1 Session</span>
                      ) : (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-amber/10 text-brand-amber border border-brand-amber/10">Live Class</span>
                      )}
                      
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-500">{meeting.course.title}</span>
                  </div>
                  <h3 className="font-bold text-brand-dark text-lg group-hover:text-brand-teal transition-colors">{meeting.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><i className="far fa-clock text-brand-teal"></i> {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1.5"><i className="fas fa-user-tie text-slate-400"></i> {meeting.mentor.name}</span>
                  </div>
                </div>
              </div>

              {meeting.link ? (
                  <a 
                    href={meeting.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto px-8 py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-brand-teal transition-all text-center shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    Join Now <i className="fas fa-external-link-alt text-[10px]"></i>
                  </a>
              ) : (
                  <button disabled className="w-full md:w-auto px-8 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                    {meeting.status === 'REQUESTED' ? 'Pending Approval' : 'No Link Yet'}
                  </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {initialMeetings.length === 0 && (
          <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-3xl">
              <i className="fas fa-calendar-day"></i>
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">No Upcoming Sessions</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">You're all caught up! Book a session or wait for your mentor to schedule a class.</p>
            <button 
                onClick={() => setIsBookingOpen(true)}
                className="text-brand-teal font-bold hover:underline"
            >
                Book a Session Now
            </button>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      <Modal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        title="Book 1:1 Session"
      >
        <form onSubmit={handleBookSession} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Course (Mentor)</label>
                <select 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                    value={bookingForm.courseId}
                    onChange={(e) => setBookingForm({...bookingForm, courseId: e.target.value})}
                >
                    <option value="">-- Select Course --</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input 
                        type="date" 
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                    <input 
                        type="time" 
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Question</label>
                <input 
                    type="text" 
                    placeholder="e.g. Help with React State"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                    value={bookingForm.title}
                    onChange={(e) => setBookingForm({...bookingForm, title: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                    rows={3}
                    placeholder="Describe what you need help with..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal resize-none"
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm({...bookingForm, description: e.target.value})}
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button 
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Requesting..." : "Request Session"}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
}
