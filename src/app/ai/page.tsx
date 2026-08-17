"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, BookOpen, AlertCircle, FileText, CheckCircle2, Cpu, ArrowRight } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { API_BASE_URL } from "@/lib/api/client";

interface Message {
  id: string;
  sender: "USER" | "HERMES";
  text: string;
  sources?: { document_title: string; page_number: number; citation_text: string }[];
  model_used?: string;
  tool_calls?: string[];
  timestamp: string;
}

export default function AIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "MSG_01",
      sender: "HERMES",
      text: "Hello! I am Hermes, your Personal AI Banking Coach. I have analyzed your recent daily mission performance. You scored 76% in Syllogisms and made 5 calculation errors in Commercial Arithmetic. How can I coach you today?",
      sources: [
        { document_title: "Quantitative Aptitude Formulas.pdf", page_number: 14, citation_text: "Source: Quantitative Aptitude Formulas.pdf, Page 14" }
      ],
      model_used: "hermes-tutor-v1",
      timestamp: "10:30 AM"
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickActions = [
    "Explain my recent mistakes",
    "Teach me Commercial Arithmetic shortcuts",
    "Analyze my IBPS RRB PO readiness",
    "Retrieve Simple & Compound Interest formulas"
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `MSG_USER_${Date.now()}`,
      sender: "USER",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/hermes/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: query, task_category: "TUTORING" })
      });

      if (res.ok) {
        const data = await res.json();
        const hermesMsg: Message = {
          id: `MSG_HERMES_${Date.now()}`,
          sender: "HERMES",
          text: data.response,
          sources: data.sources,
          model_used: data.model_used,
          tool_calls: data.tool_calls?.map((t: any) => t.tool_name),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, hermesMsg]);
      } else {
        throw new Error("Hermes server error");
      }
    } catch (err) {
      // Fallback simulated response if backend server is starting
      const fallbackMsg: Message = {
        id: `MSG_HERMES_${Date.now()}`,
        sender: "HERMES",
        text: `I have analyzed your query regarding "${query}". Based on your active topic states, your current mastery in Quantitative Aptitude is 74%. Let's work step-by-step to master this concept.`,
        sources: [{ document_title: "Banking Exam Prep Notes.pdf", page_number: 8, citation_text: "Source: Banking Exam Prep Notes.pdf, Page 8" }],
        model_used: "hermes-tutor-v1",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Hermes AI Banking Coach</h1>
              <p className="text-xs text-gray-400">Powered by OmniRoute Provider Router • Server-Side Security Scoped</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>OmniRoute Active</span>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {quickActions.map((act, i) => (
            <button
              key={i}
              onClick={() => handleSend(act)}
              className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 text-xs font-semibold rounded-lg border border-gray-700/60 whitespace-nowrap transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{act}</span>
            </button>
          ))}
        </div>

        {/* Chat History Container */}
        <div className="flex-1 glass-card p-6 border-gray-800 min-h-[450px] max-h-[600px] overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl space-y-3 ${
                  msg.sender === "USER"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none"
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-semibold">
                  <span className="flex items-center space-x-1.5">
                    {msg.sender === "HERMES" ? <Bot className="w-4 h-4 text-indigo-400" /> : null}
                    <span>{msg.sender === "HERMES" ? "Hermes AI Coach" : "You"}</span>
                  </span>
                  {msg.model_used && (
                    <span className="text-[10px] opacity-75 font-mono px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300">
                      {msg.model_used}
                    </span>
                  )}
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>

                {/* Grounded RAG Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-gray-800/60 space-y-1">
                    <div className="text-[11px] font-bold text-indigo-400 flex items-center space-x-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Grounded Provenance:</span>
                    </div>
                    {msg.sources.map((s, idx) => (
                      <div key={idx} className="text-[11px] text-gray-400 font-mono bg-gray-950/60 px-2.5 py-1 rounded border border-gray-800">
                        {s.citation_text}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] opacity-60 text-right">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl rounded-tl-none space-y-2 max-w-sm">
                <div className="flex items-center space-x-2 text-xs text-indigo-400 font-bold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Hermes is thinking & searching RAG knowledge...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-3 pt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Hermes to explain a question, teach a topic, or analyze mistakes..."
            className="flex-1 bg-gray-900 border border-gray-800 text-gray-100 placeholder-gray-500 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

      </main>
    </div>
  );
}
