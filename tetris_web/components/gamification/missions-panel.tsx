"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Trophy, CheckCircle } from "lucide-react";
import { MISSIONS, Mission } from "@/lib/game/gamification";

interface MissionsPanelProps {
  userStats: any;
  onMissionComplete?: (missionId: string) => void;
}

export function MissionsPanel({ userStats, onMissionComplete }: MissionsPanelProps) {
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);

  useEffect(() => {
    // Update mission progress based on user stats
    setMissions((prev) =>
      prev.map((mission) => {
        let progress = 0;
        switch (mission.type) {
          case "lines":
            progress = userStats?.totalLines || 0;
            break;
          case "score":
            progress = userStats?.totalScore || 0;
            break;
          case "level":
            progress = userStats?.highestLevel || 0;
            break;
          default:
            progress = 0;
        }
        return {
          ...mission,
          progress: Math.min(progress, mission.target),
          completed: progress >= mission.target,
        };
      })
    );
  }, [userStats]);

  return (
    <div className="bg-slate-900/80 border-2 border-blue-500/50 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-blue-400" />
        <h3 className="text-2xl font-bold text-white">Missions</h3>
      </div>

      <div className="space-y-4">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  const progress = (mission.progress / mission.target) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-2 ${
        mission.completed
          ? "bg-green-500/10 border-green-500/50"
          : "bg-slate-800/50 border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white">{mission.name}</h4>
            {mission.completed && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
          <p className="text-sm text-slate-400">{mission.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-blue-400">
            {mission.progress}/{mission.target}
          </div>
          <div className="text-xs text-slate-500">
            +{mission.reward.coins} coins, +{mission.reward.xp} XP
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-2 rounded-full ${
            mission.completed ? "bg-green-500" : "bg-blue-500"
          }`}
        />
      </div>
    </motion.div>
  );
}

