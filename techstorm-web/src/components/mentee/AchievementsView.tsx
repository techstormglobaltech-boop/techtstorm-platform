"use client";

import { Achievement } from "@/app/actions/achievements";
import { motion } from "framer-motion";

interface AchievementsViewProps {
  achievements: Achievement[];
}

export default function AchievementsView({ achievements }: AchievementsViewProps) {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-brand-dark to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <i className="fas fa-medal text-9xl"></i>
        </div>
        <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">My Achievements</h2>
            <p className="text-slate-300 mb-6 max-w-lg">
                Earn badges by completing courses, taking quizzes, and staying consistent with your learning journey.
            </p>
            
            <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md bg-white/10 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className="h-full bg-brand-amber transition-all duration-1000 ease-out" 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <span className="font-bold text-brand-amber">{unlockedCount} / {totalCount} Unlocked</span>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {achievements.map((achievement, index) => (
            <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative group p-6 rounded-xl border-2 transition-all duration-300 ${
                    achievement.unlockedAt 
                    ? "bg-white border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1" 
                    : "bg-slate-50 border-slate-100 opacity-70 grayscale"
                }`}
            >
                {/* Badge Icon */}
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl shadow-inner ${
                    achievement.unlockedAt ? `${achievement.color} text-white` : "bg-slate-200 text-slate-400"
                }`}>
                    <i className={`fas ${achievement.icon}`}></i>
                </div>

                <div className="text-center">
                    <h3 className={`font-bold mb-1 ${achievement.unlockedAt ? 'text-brand-dark' : 'text-slate-500'}`}>
                        {achievement.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {achievement.description}
                    </p>
                </div>

                {/* Progress Bar (if locked) */}
                {!achievement.unlockedAt && (
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-auto">
                        <div 
                            className="h-full bg-slate-400 transition-all duration-500" 
                            style={{ width: `${achievement.progress}%` }}
                        ></div>
                    </div>
                )}
                
                {/* Unlocked Status */}
                {achievement.unlockedAt && (
                    <div className="absolute top-3 right-3 text-brand-teal text-lg">
                        <i className="fas fa-check-circle"></i>
                    </div>
                )}
            </motion.div>
        ))}
      </div>
    </div>
  );
}
