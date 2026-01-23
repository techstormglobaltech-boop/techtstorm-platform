"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { submitQuizResult } from "@/app/actions/submissions";

interface LessonQuizProps {
  quiz: any;
}

export default function LessonQuiz({ quiz }: LessonQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionSelect = (optionText: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestion]: optionText
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = async () => {
    let correct = 0;
    quiz.questions.forEach((q: any, index: number) => {
      if (selectedOptions[index] === q.correctAnswer) {
        correct++;
      }
    });
    
    setScore(correct);
    setShowResult(true);
    
    setIsSubmitting(true);
    const result = await submitQuizResult(quiz.id, correct, quiz.questions.length);
    setIsSubmitting(false);

    if (result.success) {
        if (correct === quiz.questions.length) {
            toast.success("Perfect Score! Well done.");
        }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOptions({});
    setShowResult(false);
    setScore(0);
  };

  if (showResult) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl ${percentage >= 70 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
          <i className={`fas ${percentage >= 70 ? 'fa-trophy' : 'fa-redo'}`}></i>
        </div>
        <h3 className="text-2xl font-bold text-brand-dark mb-2">Quiz Completed!</h3>
        <p className="text-slate-500 mb-6">You scored {score} out of {quiz.questions.length} ({percentage}%)</p>
        
        <div className="flex gap-4 justify-center">
            <button 
                onClick={resetQuiz}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
                Try Again
            </button>
            <button className="px-6 py-2.5 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#006066] transition-colors">
                Continue Learning
            </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <span className="text-sm font-bold text-brand-teal uppercase tracking-wider">Question {currentQuestion + 1} of {quiz.questions.length}</span>
        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
                className="h-full bg-brand-teal transition-all duration-300" 
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
        </div>
      </div>
      
      <div className="p-6 md:p-10">
        <h3 className="text-xl font-bold text-brand-dark mb-8 leading-relaxed">
          {question.text}
        </h3>
        
        <div className="space-y-4">
          {question.options.map((option: any) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.text)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                selectedOptions[currentQuestion] === option.text
                ? 'border-brand-teal bg-brand-teal/5 text-brand-dark'
                : 'border-slate-100 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                selectedOptions[currentQuestion] === option.text
                ? 'border-brand-teal bg-brand-teal text-white'
                : 'border-slate-300 group-hover:border-slate-400'
              }`}>
                {selectedOptions[currentQuestion] === option.text && <i className="fas fa-check text-[10px]"></i>}
              </div>
              <span className="font-medium">{option.text}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-10 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedOptions[currentQuestion]}
            className="px-8 py-3 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-teal/10 flex items-center gap-2"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
