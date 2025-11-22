"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Users, Trophy, Zap, Target, Sparkles } from "lucide-react";

interface WelcomePageProps {
  onAuthSuccess: () => void;
}

export function WelcomePage({ onAuthSuccess }: WelcomePageProps) {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen animated-bg grid-pattern relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[calc(100vh-6rem)]">
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block mb-6"
            >
              <h1 className="text-7xl md:text-9xl font-bold neon-text text-blue-400 mb-4">
                TETRIS
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-2xl text-slate-300">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <span>Pro Community</span>
              </div>
            </motion.div>

            <p className="text-xl text-slate-400 mb-8 max-w-2xl">
              Join thousands of players in the ultimate Tetris experience. Compete,
              collaborate, and master the art of block stacking.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <FeatureCard
                icon={Users}
                title="Multiplayer"
                description="Play with friends in real-time rooms"
                color="blue"
              />
              <FeatureCard
                icon={Trophy}
                title="Rankings"
                description="Climb the leaderboards and earn rewards"
                color="yellow"
              />
              <FeatureCard
                icon={Target}
                title="Missions"
                description="Complete challenges and unlock achievements"
                color="purple"
              />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-center lg:text-left">
              <StatItem value="10K+" label="Active Players" />
              <StatItem value="50K+" label="Games Played" />
              <StatItem value="1M+" label="Lines Cleared" />
            </div>
          </motion.div>

          {/* Right side - Auth */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            {showSignup ? (
              <SignupForm
                onSuccess={() => {
                  onAuthSuccess();
                  window.location.reload();
                }}
                onSwitchToLogin={() => setShowSignup(false)}
              />
            ) : (
              <LoginForm
                onSuccess={() => {
                  onAuthSuccess();
                  window.location.reload();
                }}
                onSwitchToSignup={() => setShowSignup(true)}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`p-4 bg-slate-900/50 border border-${color}-500/30 rounded-lg`}
    >
      <Icon className={`w-8 h-8 text-${color}-400 mb-2`} />
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </motion.div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-blue-400 neon-text">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

