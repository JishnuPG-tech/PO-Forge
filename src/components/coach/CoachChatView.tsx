"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ToolCallCard } from "@/components/coach/ToolCallCard";
import { missionsApi, hermesApi } from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MessageSquare,
  ArrowUp,
  Paperclip,
  Mic,
  AudioLines,
  ChevronDown,
  Pencil,
  GraduationCap,
  Code2,
  Coffee,
  Lightbulb,
  Sparkles,
  Search,
  User,
  SlidersHorizontal,
  Trash2
} from "lucide-react";

export interface MessageTurn {
  id: string;
  sender: "USER" | "HERMES";
  text: string;
  timestamp: string;
  toolCall?: {
    toolName: string;
    description: string;
    diff: {
      label: string;
      before: string | number;
      after: string | number;
    };
    subjectCode: string;
    newTargetCount: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  createdAt: number;
}

export const CoachChatView: React.FC<{ isSlideOver?: boolean }> = ({ isSlideOver = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [quantTarget, setQuantTarget] = useState<number>(25);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversation history list (Left Rail) with localStorage persistence
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  // Messages Thread for current active session
  const [messages, setMessages] = useState<MessageTurn[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const stored = localStorage.getItem("poforge_quant_target");
    if (stored) setQuantTarget(parseInt(stored, 10));

    // Load persisted chat sessions
    try {
      const savedSessions = localStorage.getItem("poforge_chat_sessions");
      let sessionList: ChatSession[] = [];
      if (savedSessions) {
        sessionList = JSON.parse(savedSessions);
      }

      if (!sessionList || sessionList.length === 0) {
        const defaultSession: ChatSession = {
          id: `SESS_${Date.now()}`,
          title: "Speed Math & Mission Planning",
          date: "Today",
          createdAt: Date.now(),
        };
        sessionList = [defaultSession];
        localStorage.setItem("poforge_chat_sessions", JSON.stringify(sessionList));
      }

      setSessions(sessionList);

      const savedActiveId = localStorage.getItem("poforge_active_session_id") || sessionList[0].id;
      setActiveSessionId(savedActiveId);

      const savedMsgs = localStorage.getItem(`poforge_session_messages_${savedActiveId}`);
      if (savedMsgs) {
        setMessages(JSON.parse(savedMsgs));
      }
    } catch (e) {
      console.warn("Failed to load chat sessions from localStorage:", e);
    }
  }, []);

  // Save active session messages to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(`poforge_session_messages_${activeSessionId}`, JSON.stringify(messages));
    }
  }, [messages, activeSessionId]);

  // Create a New Chat Session
  const handleNewChat = () => {
    const newId = `SESS_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      date: "Just now",
      createdAt: Date.now(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newId);
    setMessages([]);

    localStorage.setItem("poforge_chat_sessions", JSON.stringify(updated));
    localStorage.setItem("poforge_active_session_id", newId);
  };

  // Switch Active Session
  const handleSwitchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    localStorage.setItem("poforge_active_session_id", sessionId);

    const savedMsgs = localStorage.getItem(`poforge_session_messages_${sessionId}`);
    if (savedMsgs) {
      try {
        setMessages(JSON.parse(savedMsgs));
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  // Delete Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem("poforge_chat_sessions", JSON.stringify(updated));
    localStorage.removeItem(`poforge_session_messages_${sessionId}`);
    setSessions(updated);

    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        handleSwitchSession(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Helper to generate chat title from 1st user message
  const generateChatTitle = (userText: string): string => {
    const cleanText = userText.trim();
    if (!cleanText) return "New Chat";

    const lower = cleanText.toLowerCase();
    if (lower.includes("quant") || lower.includes("target")) {
      return "Quant Mission Target";
    }
    if (lower.includes("profit") || lower.includes("loss")) {
      return "Profit & Loss Strategy";
    }
    if (lower.includes("syllogism")) {
      return "Syllogism Diagram Tricks";
    }
    if (lower.includes("readiness") || lower.includes("score")) {
      return "IBPS RRB PO Readiness";
    }
    if (/^[0-9\s\+\-\*\/\=\.\(\)]+$/.test(cleanText)) {
      return `Speed Math: ${cleanText.slice(0, 16)}`;
    }

    const words = cleanText.split(/\s+/).slice(0, 4);
    const title = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return title.length > 25 ? title.slice(0, 25) + "..." : title;
  };

  const handleSendMessage = async (userMsgText?: string) => {
    const textToSend = userMsgText || inputText;
    if (!textToSend.trim() || isSending) return;

    // Automatic Session Title Generation on First Message
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (currentSession && (currentSession.title === "New Chat" || messages.length === 0)) {
      const autoTitle = generateChatTitle(textToSend);
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, title: autoTitle } : s
      );
      setSessions(updatedSessions);
      localStorage.setItem("poforge_chat_sessions", JSON.stringify(updatedSessions));
    }

    const userMsgId = `MSG_${Date.now()}`;
    const userTurn: MessageTurn = {
      id: userMsgId,
      sender: "USER",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userTurn]);
    if (!userMsgText) setInputText("");
    setIsSending(true);

    try {
      const response = await hermesApi.chat({ user_message: textToSend });

      let toolCallObj: MessageTurn["toolCall"] = undefined;
      if (response.tool_calls && response.tool_calls.length > 0) {
        const tc = response.tool_calls.find(
          (t: any) => t.tool_name === "update_mission_config" || t.args?.subject_code || t.result?.subject_code
        );
        if (tc) {
          const newTarget = tc.args?.target_count || tc.result?.target_count || 40;
          toolCallObj = {
            toolName: "update_mission_config",
            description: "Update daily Quantitative Aptitude question target count",
            diff: {
              label: "Quant Target",
              before: quantTarget,
              after: newTarget,
            },
            subjectCode: tc.args?.subject_code || tc.result?.subject_code || "QUANT",
            newTargetCount: newTarget,
          };
        }
      }

      const aiTurn: MessageTurn = {
        id: `MSG_${Date.now() + 1}`,
        sender: "HERMES",
        text: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        toolCall: toolCallObj,
      };
      setMessages((prev) => [...prev, aiTurn]);
    } catch (e: any) {
      const fallbackTurn: MessageTurn = {
        id: `MSG_${Date.now() + 1}`,
        sender: "HERMES",
        text: "I am tracking your preparation metrics. You can ask me to adjust your daily mission target, analyze mistake patterns, or generate verified practice questions.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackTurn]);
    } finally {
      setIsSending(false);
    }
  };

  const handleToolConfirm = async (subjectCode: string, newTargetCount: number) => {
    await missionsApi.updateMissionConfig({
      subject_code: subjectCode,
      target_count: newTargetCount,
    });

    setQuantTarget(newTargetCount);
    if (typeof window !== "undefined") {
      localStorage.setItem("poforge_quant_target", newTargetCount.toString());
      window.dispatchEvent(new Event("storage"));
    }
  };

  const promptChips = [
    { label: "Practice Quant", icon: Pencil, prompt: "Change my quant target to 40 questions today" },
    { label: "Learn", icon: GraduationCap, prompt: "Why am I weak in Profit & Loss?" },
    { label: "Shortcuts", icon: Code2, prompt: "Show shortcuts for Profit & Loss discount calculations" },
    { label: "Strategy", icon: Coffee, prompt: "Show my IBPS RRB PO readiness score" },
    { label: "Hermes's choice", icon: Lightbulb, prompt: "Generate 2 verified Profit & Loss practice questions" },
  ];

  return (
    <div
      className={`flex ${
        isSlideOver
          ? "h-[calc(100vh-140px)] rounded-btn border border-border"
          : "h-[calc(100vh-56px)] w-full"
      } bg-[#141312] text-text font-sans selection:bg-accent/20 overflow-hidden`}
    >
      {/* ZONE 1: Claude.ai Left Navigation Rail */}
      {!isSlideOver && (

        <div
          className={`transition-all duration-200 border-r border-[#262422] bg-[#1A1917] flex-col justify-between hidden md:flex ${
            sidebarOpen ? "w-64" : "w-12"
          }`}
        >
          {/* Header */}
          <div className="p-3 border-b border-[#262422] flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg text-[#E58038] font-bold">Hermes</span>
              </div>
            ) : (
              <span className="font-serif text-lg text-[#E58038] font-bold mx-auto">H</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 text-text-muted hover:text-text cursor-pointer rounded hover:bg-[#2A2825] transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>


          {/* New Chat & History Items */}
          {sidebarOpen && (
            <div className="p-3 space-y-3 overflow-y-auto flex-1 text-xs">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#262422] hover:bg-[#302D2A] border border-[#36332F] text-text font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#E58038]" />
                <span>New chat</span>
              </button>

              <div className="pt-2 text-[11px] font-medium text-text-muted px-1">Recent Chats</div>

              <div className="space-y-1">
                {sessions.map((s) => {
                  const isActive = activeSessionId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSwitchSession(s.id)}
                      className={`group w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer text-xs ${
                        isActive
                          ? "bg-[#2D2A26] border border-[#52331F] text-text font-medium"
                          : "text-[#A39E98] hover:text-text hover:bg-[#23211F]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E58038] shrink-0" />}
                        <span className="truncate">{s.title}</span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-400 transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Profile Badge */}
          {sidebarOpen && (
            <div className="p-3 border-t border-[#262422] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#2E2B27] border border-[#403C37] flex items-center justify-center font-bold text-xs text-[#E58038]">
                  JG
                </div>
                <div>
                  <div className="font-semibold text-xs text-text">Jishnu P G</div>
                  <div className="text-[10px] text-text-muted">Free plan • IBPS RRB PO</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ZONE 2 & 3: Main Chat Content & Center Claude Composer */}
      <div className="flex-1 flex flex-col bg-[#141312] justify-between overflow-hidden">
        {/* Mobile Header Bar for Coach */}
        {!isSlideOver && (
          <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-[#262422] bg-[#171614]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E58038]" />
              <span className="font-serif text-sm text-[#E58038] font-bold">Hermes AI Coach</span>
            </div>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#262422] border border-[#36332F] text-xs text-text hover:text-[#E58038] transition-colors touch-manipulation cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>
        )}

        {/* CENTER THREAD AREA */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">

          {/* Welcome Screen when thread is empty */}
          {messages.length === 0 ? (
            <div className="max-w-[740px] mx-auto pt-12 md:pt-20 space-y-8 text-center flex flex-col items-center">
              {/* Star Emblem + Hero Heading */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#382417] border border-[#52331F] flex items-center justify-center text-[#E58038] text-2xl font-serif">
                  ✵
                </div>
                <h1 className="font-serif text-3xl md:text-4xl text-text font-normal tracking-tight">
                  Back at it, Jishnu
                </h1>
              </div>

              {/* CLAUDE.AI CENTER COMPOSER CARD */}
              <div className="w-full max-w-[700px] bg-[#1E1C1A] border border-[#33302B] rounded-2xl p-4 space-y-4 shadow-2xl text-left">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type / for skills or ask Hermes anything..."
                  rows={3}
                  className="w-full bg-transparent text-sm text-text placeholder:text-[#807B73] focus:outline-none resize-none"
                />

                <div className="flex items-center justify-between pt-2 border-t border-[#2A2825]">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full bg-[#292724] hover:bg-[#36332F] text-[#A39E98] hover:text-text border border-[#383530] transition-colors cursor-pointer">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#A39E98]">
                    <div className="flex items-center gap-1 bg-[#282623] border border-[#383530] px-2.5 py-1 rounded-full text-[11px]">
                      <span className="text-text font-medium">Hermes</span>
                    </div>
                    <Mic className="w-4 h-4 hover:text-text cursor-pointer" />
                    <AudioLines className="w-4 h-4 hover:text-text cursor-pointer" />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isSending}
                      className="p-2 rounded-full bg-[#E58038] text-white disabled:opacity-30 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* Sub-banner: Question Budget */}
                <div className="flex items-center justify-between bg-[#181715] border border-[#2B2925] rounded-xl px-3 py-2 text-xs">
                  <span className="text-[#A39E98]">
                    You've allocated <strong className="text-text font-semibold">{quantTarget} Quant questions</strong> in today's daily mission target
                  </span>
                  <button
                    onClick={() => handleSendMessage("Change my quant target to 40 questions today")}
                    className="bg-text text-[#141312] font-semibold px-3 py-1 rounded-full text-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Customize
                  </button>
                </div>
              </div>

              {/* CLAUDE PROMPT SUGGESTION CHIPS */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-[700px] pt-2">
                {promptChips.map((chip, i) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(chip.prompt)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E1C1A] hover:bg-[#282623] border border-[#33302B] text-xs text-[#C2BCB4] hover:text-text transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#E58038]" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CONVERSATION THREAD TURNS (NO CHAT BUBBLES) */
            <div className="max-w-[740px] mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`pt-5 first:pt-0 ${
                    index > 0 ? "border-t border-[#262422]" : ""
                  } space-y-2`}
                >
                  {/* Speaker Header */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      {msg.sender === "HERMES" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#382417] text-[#E58038] flex items-center justify-center text-xs font-serif">
                            ✵
                          </div>
                          <span className="text-[#E58038] font-semibold">HERMES AI COACH</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#292724] text-text-muted flex items-center justify-center text-xs">
                            <User className="w-3 h-3" />
                          </div>
                          <span className="text-text font-semibold">YOU</span>
                        </div>
                      )}
                    </div>
                    <span className="text-text-muted text-[11px]">{msg.timestamp}</span>
                  </div>

                  {/* Rich Formatted Markdown Message Content */}
                  <div className="pl-7">
                    <FormattedMessageText content={msg.text} />
                  </div>

                  {/* Embedded ToolCallCard */}
                  {msg.toolCall && (
                    <div className="pl-7 pt-1">
                      <ToolCallCard
                        toolName={msg.toolCall.toolName}
                        description={msg.toolCall.description}
                        diff={msg.toolCall.diff}
                        onConfirm={async () => {
                          await handleToolConfirm(
                            msg.toolCall!.subjectCode,
                            msg.toolCall!.newTargetCount
                          );
                        }}
                        viewLink="/"
                        viewLinkLabel="View Today Page"
                      />
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="pt-4 border-t border-[#262422] flex items-center gap-2 text-xs font-mono text-[#E58038] pl-7">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Hermes is generating response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* BOTTOM STICKY COMPOSER (Active during conversation) */}
        {messages.length > 0 && (
          <div className="border-t border-[#262422] bg-[#171614] p-4">
            <div className="max-w-[740px] mx-auto space-y-3">
              {/* Rounded Composer Card */}
              <div className="bg-[#1E1C1A] border border-[#33302B] rounded-2xl p-3 space-y-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Reply to Hermes..."
                  rows={2}
                  className="w-full bg-transparent text-sm text-text placeholder:text-[#807B73] focus:outline-none resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-full bg-[#292724] hover:bg-[#36332F] text-[#A39E98] hover:text-text border border-[#383530] transition-colors cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isSending}
                      className="p-1.5 rounded-full bg-[#E58038] text-white disabled:opacity-30 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FormattedMessageText: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  let cleaned = content
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\textbf\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1");

  const lines = cleaned.split("\n");

  return (
    <div className="space-y-2 text-sm text-[#D6D0C7] leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={idx} className="my-3 border-[#2A2825]" />;
        }

        if (trimmed.startsWith("#")) {
          const headingText = trimmed.replace(/^#+\s*/, "");
          return (
            <h3 key={idx} className="text-base font-bold text-text tracking-tight pt-2 pb-1 border-b border-[#2A2825] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E58038]"></span>
              {renderInlineStyles(headingText)}
            </h3>
          );
        }

        if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4) {
          const formula = trimmed.slice(2, -2).trim();
          return (
            <div key={idx} className="my-2 p-3 bg-[#1A1816] border border-[#382E25] rounded-xl text-center font-mono text-sm text-[#F5A062] shadow-inner">
              {formula}
            </div>
          );
        }

        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const itemText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 py-0.5">
              <span className="text-[#E58038] font-bold text-xs pt-1">•</span>
              <div className="flex-1">{renderInlineStyles(itemText)}</div>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 py-0.5">
              <span className="font-mono text-xs text-[#E58038] font-bold pt-0.5">{numMatch[1]}.</span>
              <div className="flex-1">{renderInlineStyles(numMatch[2])}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineStyles(text: string) {
  if (!text) return null;

  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-bold text-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={index} className="px-1.5 py-0.5 bg-[#262421] border border-[#383530] text-[#E58038] rounded font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const mathExpr = part.slice(1, -1).replace(/\\mathbf\{([^}]+)\}/g, "$1");
      return (
        <span key={index} className="inline-block px-1.5 py-0.5 bg-[#251D17] border border-[#422D1E] text-[#F5A062] rounded font-mono text-xs mx-0.5">
          {mathExpr}
        </span>
      );
    }
    return part;
  });
}
