"use client";

import { useState, useEffect } from "react";
import { WelcomePage } from "@/components/welcome/welcome-page";
import { HomePage } from "@/components/pages/home-page";
import { useAuth } from "@/lib/hooks/use-auth";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <WelcomePage onAuthSuccess={() => window.location.reload()} />;
  }

  return <HomePage user={user} />;
}

