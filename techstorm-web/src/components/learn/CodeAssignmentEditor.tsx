"use client";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { askAiTutor } from "@/app/actions/ai";

interface CodeAssignmentEditorProps {
  assignmentId: string;
  description: string;
  initialContent?: string;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function CodeAssignmentEditor({
  assignmentId,
  description,
  initialContent = "",
  onSubmit,
  isSubmitting,
}: CodeAssignmentEditorProps) {
  const [code, setCode] = useState(initialContent || "// Write your code here\n");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleAskAi = async () => {
    if (!code || code.trim() === "" || code.trim() === "// Write your code here") {
      toast.error("Please write some code before asking for help.");
      return;
    }

    setIsAiLoading(true);
    setAiFeedback(null);

    try {
      const result = await askAiTutor(code, description);

      if (!result.success) {
        throw new Error(result.error);
      }

      setAiFeedback(result.feedback || "The AI didn't return any feedback.");
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to AI Tutor.");
      setAiFeedback("Sorry, the AI Tutor is currently unavailable.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
      <div className="flex-1 flex flex-col border-r border-slate-200">
        <div className="bg-slate-800 text-white p-3 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 font-mono">
            <i className="fas fa-file-code text-brand-teal"></i> solution.js
          </div>
          <button
            onClick={handleAskAi}
            disabled={isAiLoading}
            className="bg-brand-teal/20 text-brand-teal hover:bg-brand-teal hover:text-white px-3 py-1 rounded text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isAiLoading ? (
              <><i className="fas fa-spinner fa-spin"></i> Analyzing...</>
            ) : (
              <><i className="fas fa-robot"></i> Stuck? Ask AI Tutor</>
            )}
          </button>
        </div>
        
        <div className="h-[400px] w-full">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              padding: { top: 16 },
            }}
          />
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={() => onSubmit(code)}
            disabled={isSubmitting || !code.trim()}
            className="bg-brand-teal text-white px-6 py-2 rounded-lg font-bold hover:bg-[#006066] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
            ) : (
              <>Submit Solution <i className="fas fa-paper-plane"></i></>
            )}
          </button>
        </div>
      </div>

      {/* AI Tutor Panel */}
      <AnimatePresence>
        {(isAiLoading || aiFeedback) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "300px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-brand-dark text-white flex flex-col w-full md:w-[300px] shrink-0 border-l border-slate-700"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h4 className="font-bold flex items-center gap-2 text-brand-teal">
                <i className="fas fa-robot"></i> AI Tutor
              </h4>
              <button 
                onClick={() => setAiFeedback(null)} 
                className="text-slate-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 prose prose-invert prose-sm">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-10">
                  <i className="fas fa-circle-notch fa-spin text-2xl text-brand-teal"></i>
                  <p className="text-center text-sm">Reviewing your code and assignment description...</p>
                </div>
              ) : (
                <div className="whitespace-pre-line leading-relaxed text-sm text-slate-300">
                  {aiFeedback}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
