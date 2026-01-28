"use client";
import { useState, useTransition } from "react";
import { 
    createModule, deleteModule, 
    createLesson, updateLesson, deleteLesson,
    saveQuiz, addQuestion, deleteQuestion,
    saveAssignment, generateQuizFromAI,
    addLessonAttachment, deleteLessonAttachment
} from "@/app/actions/course-edit";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import FileUploader from "@/components/ui/FileUploader";
import toast from "react-hot-toast";

interface CurriculumEditorProps {
  course: any;
}

export default function CurriculumEditor({ course }: CurriculumEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<any>({});
  const [activeLessonTab, setActiveLessonTab] = useState<"content" | "quiz" | "assignment">("content");
  
  // Modal states
  const [moduleModal, setModuleModal] = useState({ isOpen: false, title: "" });
  const [lessonModal, setLessonModal] = useState({ isOpen: false, title: "", moduleId: "" });
  const [quizModal, setQuizModal] = useState({ isOpen: false, title: "", lessonId: "", quizId: "" });
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, title: "", description: "", lessonId: "", assignmentId: "" });
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void; 
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quiz State
  const [newQuestion, setNewQuestion] = useState({ text: "", options: ["", "", "", ""], correctAnswer: "" });

  const handleAiGenerateQuiz = async (lesson: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading("AI is crafting your quiz...");
    
    try {
        const result = await generateQuizFromAI(lesson.id, lesson.title, course.id);
        if (result.success) {
            toast.success("AI Quiz generated!", { id: toastId });
            router.refresh();
        } else {
            toast.error(result.error || "Failed to generate AI quiz", { id: toastId });
        }
    } catch (error) {
        toast.error("An error occurred", { id: toastId });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleOpenQuizModal = (lessonId: string, currentQuiz: any) => {
    setQuizModal({
        isOpen: true,
        lessonId,
        quizId: currentQuiz?.id || "",
        title: currentQuiz?.title || "Lesson Quiz"
    });
  };

  const submitQuizTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizModal.title) return;
    
    setIsSubmitting(true);
    await saveQuiz(quizModal.lessonId, { title: quizModal.title, id: quizModal.quizId }, course.id);
    setIsSubmitting(false);
    
    setQuizModal({ isOpen: false, title: "", lessonId: "", quizId: "" });
    router.refresh();
  };

  const handleAddQuestion = async (quizId: string) => {
    if (!newQuestion.text || !newQuestion.correctAnswer) {
        toast.error("Please fill in question and correct answer");
        return;
    }
    const result = await addQuestion(quizId, newQuestion, course.id);
    if (result.success) {
        toast.success("Question added!");
        setNewQuestion({ text: "", options: ["", "", "", ""], correctAnswer: "" });
        router.refresh();
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setConfirmModal({
        isOpen: true,
        title: "Delete Question?",
        message: "Are you sure you want to delete this question?",
        onConfirm: async () => {
            await deleteQuestion(id, course.id);
            router.refresh();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentModal.title || !assignmentModal.description) return;
    
    setIsSubmitting(true);
    await saveAssignment(assignmentModal.lessonId, { 
        title: assignmentModal.title, 
        description: assignmentModal.description, 
        id: assignmentModal.assignmentId 
    }, course.id);
    setIsSubmitting(false);
    
    toast.success("Assignment saved!");
    setAssignmentModal({ ...assignmentModal, isOpen: false });
    router.refresh();
  };

  const openAssignmentModal = (lessonId: string, assignment: any) => {
    setAssignmentModal({
        isOpen: true,
        lessonId,
        assignmentId: assignment?.id || "",
        title: assignment?.title || "Practical Task",
        description: assignment?.description || ""
    });
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleModal.title) return;
    
    setIsSubmitting(true);
    const result = await createModule(course.id, moduleModal.title);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Module added!");
      setModuleModal({ isOpen: false, title: "" });
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error("Failed to add module");
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonModal.title) return;
    
    setIsSubmitting(true);
    const result = await createLesson(lessonModal.moduleId, lessonModal.title, course.id);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Lesson added!");
      setLessonModal({ isOpen: false, title: "", moduleId: "" });
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error("Failed to add lesson");
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    setConfirmModal({
        isOpen: true,
        title: "Delete Module?",
        message: "This will delete the module and all lessons within it. This action cannot be undone.",
        onConfirm: async () => {
            await deleteModule(moduleId, course.id);
            router.refresh();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    setConfirmModal({
        isOpen: true,
        title: "Delete Lesson?",
        message: "Are you sure you want to delete this lesson? All associated quizzes and assignments will also be removed.",
        onConfirm: async () => {
            await deleteLesson(lessonId, course.id);
            router.refresh();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const startEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
        title: lesson.title,
        description: lesson.description || "",
        videoType: lesson.videoType || "YOUTUBE",
        videoUrl: lesson.videoUrl || "",
        duration: lesson.duration || "",
        isFree: lesson.isFree || false
    });
  };

  const saveLesson = async () => {
    if (!editingLessonId) return;
    await updateLesson(editingLessonId, lessonForm, course.id);
    setEditingLessonId(null);
    router.refresh();
  };

  const handleAttachmentUpload = async (url: string, fileData: any) => {
    if (!editingLessonId) return;
    await addLessonAttachment(editingLessonId, { url, ...fileData }, course.id);
    router.refresh();
  };

  const handleVideoUpload = (url: string) => {
    setLessonForm((prev: any) => ({ ...prev, videoUrl: url }));
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-brand-dark">Course Curriculum</h3>
            <button 
                onClick={() => setModuleModal({ isOpen: true, title: "" })}
                className="bg-white text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
            >
                <i className="fas fa-plus mr-2"></i> Add Module
            </button>
        </div>

        <div className={`space-y-4 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
            {course.modules.map((module: any) => (
                <div key={module.id} className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                    {/* Module Header */}
                    <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-grip-vertical text-slate-400 cursor-move"></i>
                            <span className="font-bold text-brand-dark">{module.title}</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLessonModal({ isOpen: true, title: "", moduleId: module.id })}
                                className="text-xs bg-brand-teal text-white px-3 py-1.5 rounded hover:bg-[#006066] transition-colors shadow-sm"
                            >
                                <i className="fas fa-plus mr-1"></i> Add Lesson
                            </button>
                            <button 
                                onClick={() => handleDeleteModule(module.id)}
                                className="text-slate-400 hover:text-red-500 px-2 transition-colors"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    {/* Lessons List */}
                    <div className="divide-y divide-slate-100">
                        {module.lessons.map((lesson: any) => (
                            <div key={lesson.id}>
                                {editingLessonId === lesson.id ? (
                                    <div className="p-4 bg-slate-50 space-y-4">
                                        <div className="flex gap-4 border-b border-slate-200 mb-4">
                                            {["content", "quiz", "assignment"].map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveLessonTab(tab as any)}
                                                    className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                                                        activeLessonTab === tab 
                                                        ? "border-brand-teal text-brand-teal" 
                                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                                    }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>

                                        {activeLessonTab === "content" && (
                                            <div className="space-y-4">
                                                <input 
                                                    type="text" 
                                                    className="w-full p-2 bg-white border border-slate-200 rounded text-brand-dark text-sm focus:ring-1 focus:ring-brand-teal outline-none"
                                                    placeholder="Lesson Title"
                                                    value={lessonForm.title}
                                                    onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                                                />
                                                <textarea 
                                                    className="w-full p-2 bg-white border border-slate-200 rounded text-brand-dark text-sm focus:ring-1 focus:ring-brand-teal outline-none"
                                                    placeholder="Description"
                                                    rows={2}
                                                    value={lessonForm.description}
                                                    onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                                                />
                                                
                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Video Content</p>
                                                    <div className="flex gap-4 mb-3">
                                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name="videoType" 
                                                                value="YOUTUBE"
                                                                checked={lessonForm.videoType === "YOUTUBE"}
                                                                onChange={() => setLessonForm({...lessonForm, videoType: "YOUTUBE", videoUrl: ""})}
                                                            />
                                                            YouTube Link
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name="videoType" 
                                                                value="UPLOAD"
                                                                checked={lessonForm.videoType === "UPLOAD"}
                                                                onChange={() => setLessonForm({...lessonForm, videoType: "UPLOAD", videoUrl: ""})}
                                                            />
                                                            Upload Video
                                                        </label>
                                                    </div>

                                                    {lessonForm.videoType === "YOUTUBE" ? (
                                                        <input 
                                                            type="text" 
                                                            className="w-full p-2 bg-white border border-slate-200 rounded text-brand-dark text-sm focus:ring-1 focus:ring-brand-teal outline-none"
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            value={lessonForm.videoUrl}
                                                            onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                                                        />
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <FileUploader 
                                                                label=""
                                                                bucket="course-content"
                                                                accept="video/*"
                                                                defaultValue={lessonForm.videoUrl}
                                                                onUploadComplete={handleVideoUpload}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Attachments & Resources</p>
                                                    
                                                    {lesson.attachments && lesson.attachments.length > 0 && (
                                                        <div className="space-y-2 mb-4">
                                                            {lesson.attachments.map((file: any) => (
                                                                <div key={file.id} className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
                                                                    <div className="flex items-center gap-2 truncate">
                                                                        <i className="fas fa-file-alt text-slate-400"></i>
                                                                        <a href={file.url} target="_blank" className="text-brand-teal hover:underline truncate max-w-[200px]">{file.name}</a>
                                                                    </div>
                                                                    <button 
                                                                        onClick={async () => {
                                                                            if (confirm("Delete this attachment?")) {
                                                                                await deleteLessonAttachment(file.id, course.id);
                                                                                router.refresh();
                                                                            }
                                                                        }}
                                                                        className="text-red-400 hover:text-red-600 px-2"
                                                                    >
                                                                        <i className="fas fa-times"></i>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <FileUploader 
                                                        label="Add Attachment (PDF, Doc, Zip)"
                                                        bucket="course-content"
                                                        accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx"
                                                        onUploadComplete={handleAttachmentUpload}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-2 bg-white border border-slate-200 rounded text-brand-dark text-sm focus:ring-1 focus:ring-brand-teal outline-none"
                                                        placeholder="Duration (sec)"
                                                        value={lessonForm.duration}
                                                        onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                                                    />
                                                    <label className="flex items-center gap-2 p-2 border border-slate-200 rounded bg-white text-sm">
                                                        <input 
                                                            type="checkbox"
                                                            checked={lessonForm.isFree}
                                                            onChange={(e) => setLessonForm({...lessonForm, isFree: e.target.checked})}
                                                        />
                                                        Free Preview
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {activeLessonTab === "quiz" && (
                                            <div className="space-y-6">
                                                {!lesson.quizzes?.[0] ? (
                                                    <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-xl space-y-4">
                                                        <p className="text-slate-500">No quiz for this lesson yet.</p>
                                                        <div className="flex justify-center gap-3">
                                                            <button 
                                                                onClick={() => handleOpenQuizModal(lesson.id, null)}
                                                                className="bg-white text-slate-700 px-4 py-2 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                                                            >
                                                                Create Manually
                                                            </button>
                                                            <button 
                                                                disabled={isSubmitting}
                                                                onClick={() => handleAiGenerateQuiz(lesson)}
                                                                className="bg-brand-amber text-brand-dark px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#e6a200] transition-colors flex items-center gap-2 shadow-sm"
                                                            >
                                                                <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
                                                                Generate with AI
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-bold text-brand-dark">{lesson.quizzes[0].title}</h4>
                                                            <button 
                                                                onClick={() => handleOpenQuizModal(lesson.id, lesson.quizzes[0])}
                                                                className="text-xs text-brand-teal hover:underline"
                                                            >
                                                                Rename
                                                            </button>
                                                        </div>

                                                        {/* Question List */}
                                                        <div className="space-y-4">
                                                            {lesson.quizzes[0].questions.map((q: any, i: number) => (
                                                                <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl relative group">
                                                                    <button 
                                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                                    </button>
                                                                    <p className="font-bold text-sm text-brand-dark mb-3">{i+1}. {q.text}</p>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {q.options.map((opt: any, oi: number) => (
                                                                            <div key={oi} className={`px-3 py-1.5 rounded-lg text-[11px] border ${opt.text === q.correctAnswer ? 'bg-green-50 text-green-700 border-green-100 font-bold' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                                                {opt.text}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Add New Question Form */}
                                                        <div className="p-5 bg-brand-teal/5 border border-brand-teal/10 rounded-xl space-y-4">
                                                            <p className="text-xs font-bold text-brand-teal uppercase tracking-wider">Add New Question</p>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Question text..."
                                                                className="w-full p-2 bg-white border border-slate-200 rounded text-sm outline-none focus:border-brand-teal"
                                                                value={newQuestion.text}
                                                                onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                                                            />
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {newQuestion.options.map((opt, i) => (
                                                                    <input 
                                                                        key={i}
                                                                        type="text"
                                                                        placeholder={`Option ${i+1}`}
                                                                        className="p-2 bg-white border border-slate-200 rounded text-xs outline-none focus:border-brand-teal"
                                                                        value={opt}
                                                                        onChange={(e) => {
                                                                            const opts = [...newQuestion.options];
                                                                            opts[i] = e.target.value;
                                                                            setNewQuestion({...newQuestion, options: opts});
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <select 
                                                                className="w-full p-2 bg-white border border-slate-200 rounded text-xs outline-none focus:border-brand-teal"
                                                                value={newQuestion.correctAnswer}
                                                                onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                                                            >
                                                                <option value="">Select Correct Answer</option>
                                                                {newQuestion.options.filter(o => o).map((opt, i) => (
                                                                    <option key={i} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                            <button 
                                                                onClick={() => handleAddQuestion(lesson.quizzes[0].id)}
                                                                className="w-full py-2 bg-brand-teal text-white rounded-lg text-xs font-bold shadow-sm"
                                                            >
                                                                Add Question
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeLessonTab === "assignment" && (
                                            <div className="space-y-4">
                                                {lesson.assignments?.[0] ? (
                                                    <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-bold text-brand-dark text-sm">{lesson.assignments[0].title}</h4>
                                                            <button 
                                                                onClick={() => openAssignmentModal(lesson.id, lesson.assignments[0])}
                                                                className="text-xs text-brand-teal hover:underline"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                        <p className="text-slate-500 text-xs leading-relaxed">{lesson.assignments[0].description}</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-xl">
                                                        <p className="text-slate-500 mb-4">No assignment for this lesson yet.</p>
                                                        <button 
                                                            onClick={() => openAssignmentModal(lesson.id, null)}
                                                            className="bg-brand-teal text-white px-4 py-2 rounded-lg text-xs font-bold"
                                                        >
                                                            Create Assignment
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 mt-4">
                                            <button 
                                                onClick={() => setEditingLessonId(null)}
                                                className="text-xs text-slate-500 hover:text-brand-dark px-3"
                                            >
                                                Close
                                            </button>
                                            <button 
                                                onClick={saveLesson}
                                                className="text-xs bg-brand-teal text-white px-3 py-1.5 rounded hover:bg-[#006066]"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <i className="fas fa-play-circle text-slate-400 text-xs"></i>
                                            <span className="text-slate-600 text-sm group-hover:text-brand-dark">{lesson.title}</span>
                                            {lesson.isFree && <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Free</span>}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditLesson(lesson)}
                                                className="text-slate-400 hover:text-brand-teal px-2"
                                            >
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                className="text-slate-400 hover:text-red-500 px-2"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {module.lessons.length === 0 && (
                            <div className="p-4 text-center text-xs text-slate-400 italic">
                                No lessons in this module.
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            {course.modules.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                    Start by adding a module to your course.
                </div>
            )}
        </div>

        {/* Add Module Modal */}
        <Modal 
            isOpen={moduleModal.isOpen} 
            onClose={() => setModuleModal({ ...moduleModal, isOpen: false })}
            title="Add New Module"
        >
            <form onSubmit={handleAddModule} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Module Title</label>
                    <input 
                        type="text" 
                        required
                        autoFocus
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                        placeholder="e.g. Introduction to React"
                        value={moduleModal.title}
                        onChange={(e) => setModuleModal({...moduleModal, title: e.target.value})}
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => setModuleModal({ ...moduleModal, isOpen: false })}
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Adding..." : "Add Module"}
                    </button>
                </div>
            </form>
        </Modal>

        {/* Add Lesson Modal */}
        <Modal 
            isOpen={lessonModal.isOpen} 
            onClose={() => setLessonModal({ ...lessonModal, isOpen: false })}
            title="Add New Lesson"
        >
            <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lesson Title</label>
                    <input 
                        type="text" 
                        required
                        autoFocus
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                        placeholder="e.g. Setting up the Project"
                        value={lessonModal.title}
                        onChange={(e) => setLessonModal({...lessonModal, title: e.target.value})}
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => setLessonModal({ ...lessonModal, isOpen: false })}
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Adding..." : "Add Lesson"}
                    </button>
                </div>
            </form>
        </Modal>

        {/* Assignment Modal */}
        <Modal 
            isOpen={assignmentModal.isOpen} 
            onClose={() => setAssignmentModal({ ...assignmentModal, isOpen: false })}
            title={assignmentModal.assignmentId ? "Edit Assignment" : "Add Assignment"}
        >
            <form onSubmit={handleSaveAssignment} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Title</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                        placeholder="e.g. Build a Landing Page"
                        value={assignmentModal.title}
                        onChange={(e) => setAssignmentModal({...assignmentModal, title: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description / Instructions</label>
                    <textarea 
                        required
                        rows={5}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal resize-none"
                        placeholder="Explain what the student needs to do..."
                        value={assignmentModal.description}
                        onChange={(e) => setAssignmentModal({...assignmentModal, description: e.target.value})}
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => setAssignmentModal({ ...assignmentModal, isOpen: false })}
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Save Assignment"}
                    </button>
                </div>
            </form>
        </Modal>

        {/* Quiz Title Modal */}
        <Modal 
            isOpen={quizModal.isOpen} 
            onClose={() => setQuizModal({ ...quizModal, isOpen: false })}
            title={quizModal.quizId ? "Rename Quiz" : "Create New Quiz"}
        >
            <form onSubmit={submitQuizTitle} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Title</label>
                    <input 
                        type="text" 
                        required
                        autoFocus
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                        placeholder="e.g. Assessment: React Hooks"
                        value={quizModal.title}
                        onChange={(e) => setQuizModal({...quizModal, title: e.target.value})}
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => setQuizModal({ ...quizModal, isOpen: false })}
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Save Quiz"}
                    </button>
                </div>
            </form>
        </Modal>

        {/* Confirmation Modal */}
        <ConfirmModal 
            isOpen={confirmModal.isOpen}
            title={confirmModal.title}
            message={confirmModal.message}
            onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            onConfirm={confirmModal.onConfirm}
        />
    </div>
  );
}