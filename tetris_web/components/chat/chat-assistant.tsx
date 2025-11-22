"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatAssistantProps {
  onClose: () => void;
}

const PRE_DEFINED_QUESTIONS = [
  "How do I play?",
  "What are the controls?",
  "What is Sprint mode?",
  "What is Ultra mode?",
  "How does scoring work?",
  "What is the hold feature?",
  "How do I rotate pieces?",
  "What is a hard drop?",
];

const RESPONSES: Record<string, string> = {
  "how do i play": "Tetris is a puzzle game where you arrange falling blocks called Tetrominoes. Your goal is to create complete horizontal lines, which will clear and give you points. The game gets faster as you level up!",
  
  "what are the controls": "Use Arrow Keys: ← → to move, ↓ for soft drop, ↑ or X to rotate clockwise, Z to rotate counter-clockwise. Space for hard drop, C to hold a piece, and ESC to pause.",
  
  "what is sprint mode": "Sprint mode challenges you to clear 40 lines as fast as possible. It's a race against time - perfect for speedrunners!",
  
  "what is ultra mode": "Ultra mode gives you 2 minutes to score as many points as possible. Strategy and speed are key to achieving high scores!",
  
  "how does scoring work": "You earn points by clearing lines: 1 line = 100×level, 2 lines = 300×level, 3 lines = 500×level, 4 lines (Tetris) = 800×level. Hard drops give bonus points too!",
  
  "what is the hold feature": "Press C to hold the current piece and swap it with a held piece. You can only hold once per piece placement. Use it strategically to save pieces for better placements!",
  
  "how do i rotate pieces": "Press ↑ or X to rotate clockwise, or Z to rotate counter-clockwise. The game will try wall kicks if rotation doesn't fit initially.",
  
  "what is a hard drop": "Press Space to instantly drop a piece to the bottom. You get 2 points per cell dropped. Use it for quick placements and bonus points!",
};

export function ChatAssistant({ onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hello! I'm your Tetris assistant. Ask me anything about the game, controls, or strategies!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Check for exact matches
    if (RESPONSES[lowerQuestion]) {
      return RESPONSES[lowerQuestion];
    }

    // Check for keywords
    if (lowerQuestion.includes("play") || lowerQuestion.includes("how")) {
      return RESPONSES["how do i play"];
    }
    if (lowerQuestion.includes("control") || lowerQuestion.includes("key")) {
      return RESPONSES["what are the controls"];
    }
    if (lowerQuestion.includes("sprint")) {
      return RESPONSES["what is sprint mode"];
    }
    if (lowerQuestion.includes("ultra")) {
      return RESPONSES["what is ultra mode"];
    }
    if (lowerQuestion.includes("score") || lowerQuestion.includes("point")) {
      return RESPONSES["how does scoring work"];
    }
    if (lowerQuestion.includes("hold")) {
      return RESPONSES["what is the hold feature"];
    }
    if (lowerQuestion.includes("rotate") || lowerQuestion.includes("turn")) {
      return RESPONSES["how do i rotate pieces"];
    }
    if (lowerQuestion.includes("hard drop") || lowerQuestion.includes("drop")) {
      return RESPONSES["what is a hard drop"];
    }

    return "I'm not sure about that. Try asking about controls, game modes, scoring, or strategies!";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length,
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 1,
        text: getResponse(input),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed bottom-24 right-6 w-96 h-[600px] bg-slate-900 border-2 border-blue-500/50 rounded-lg shadow-2xl flex flex-col glow-effect z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Game Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isBot
                    ? "bg-slate-800 text-slate-200"
                    : "bg-blue-600 text-white"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="px-4 py-2 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {PRE_DEFINED_QUESTIONS.slice(0, 4).map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

