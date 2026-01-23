"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "teal";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger"
}: ConfirmModalProps) {
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-brand-teal/10 text-brand-teal'
                }`}
              >
                <i className={`fas ${variant === 'danger' ? 'fa-exclamation-triangle' : 'fa-info-circle'} text-2xl`}></i>
              </motion.div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm">{message}</p>
            </div>
            <div className="flex border-t border-slate-100">
              <button 
                onClick={onClose}
                className="flex-1 py-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100 outline-none focus:bg-slate-50"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                    onConfirm();
                    // onClose(); // Let parent handle close/loading state if needed, or keeping it open
                }}
                className={`flex-1 py-4 text-sm font-bold transition-colors outline-none ${
                    variant === 'danger' ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : 'text-brand-teal hover:bg-brand-teal/5 focus:bg-brand-teal/5'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
