"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,

  CheckSquare,
  Award,
  BarChart2,
  RotateCcw,
  Bot,
  Newspaper,
  BookOpen,
  Settings,
  Search,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  Flame,
  Menu,
  X,
  Target,
  User,
} from "lucide-react";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { CoachPanel } from "@/components/coach/CoachPanel";

import { authApi, UserProfileResponse } from "@/lib/api";


export interface GlobalShellProps {
  children: React.ReactNode;
}

export const GlobalShell: React.FC<GlobalShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isCoachPanelOpen, setIsCoachPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState("IBPS RRB PO");
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Authenticate & Hydrate user state from GET /auth/me
  useEffect(() => {
    const initUser = async () => {
      try {
        let token = typeof window !== "undefined" ? localStorage.getItem("poforge_jwt_token") : null;
        if (!token) {
          const loginRes = await authApi.login({ email: "student@poforge.ai", password: "password123" });
          token = loginRes.access_token;
        }
        const profile = await authApi.getCurrentUser();
        setUserProfile(profile);
        setSelectedExam(profile.target_exam);
      } catch (e: any) {
        console.warn("Auth initialization error:", e);
        setAuthError(e.message || "Authentication error");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    initUser();

    const handleUnauthorized = () => {
      setAuthError("Session expired. Re-authenticating...");
      localStorage.removeItem("poforge_jwt_token");
      initUser();
    };
    window.addEventListener("poforge_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("poforge_unauthorized", handleUnauthorized);
  }, []);

  // Keyboard "/" shortcut to open AI Coach slide-over panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setIsCoachPanelOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [googleUser, setGoogleUser] = useState<any>(null);

  // Sync Theme & Google Account on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("poforge_theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }

    // Google User Sync
    const savedGoogle = localStorage.getItem("poforge_google_account");
    if (savedGoogle) {
      try {
        setGoogleUser(JSON.parse(savedGoogle));
      } catch (e) {}
    }

    const handleGoogleAuth = (e: any) => {
      setGoogleUser(e.detail);
    };

    window.addEventListener("poforge_google_auth_changed", handleGoogleAuth);
    return () => window.removeEventListener("poforge_google_auth_changed", handleGoogleAuth);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        localStorage.setItem("poforge_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        localStorage.setItem("poforge_theme", "light");
      }
      return next;
    });
  };

  const primaryNav = [
    { name: "Today", path: "/", icon: Home },
    { name: "Practice", path: "/practice", icon: CheckSquare },
    { name: "Mock", path: "/mock", icon: Award },
    { name: "Analysis", path: "/analysis", icon: BarChart2 },
    { name: "Revision", path: "/revision", icon: RotateCcw },
    { name: "Coach", path: "/coach", icon: Bot, isCoachAction: false },
  ];

  const secondaryNav = [
    { name: "Current Affairs", path: "/current-affairs", icon: Newspaper },
    { name: "Library", path: "/library", icon: BookOpen },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileNav = [
    { name: "Today", path: "/", icon: Home },
    { name: "Practice", path: "/practice", icon: CheckSquare },
    { name: "Mock", path: "/mock", icon: Award },
    { name: "Analysis", path: "/analysis", icon: BarChart2 },
    { name: "Coach", path: "/coach", icon: Bot, isCoachAction: false },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col selection:bg-accent/20">
      {/* Desktop Top Bar */}
      <header className="hidden md:flex h-14 border-b border-border bg-surface px-6 items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg tracking-tight text-text flex items-center gap-2">
            <span className="w-6 h-6 rounded border border-border bg-surface-2 flex items-center justify-center font-mono text-xs text-accent">
              P
            </span>
            <span>POForge</span>
          </Link>

          {/* Command Palette Trigger Input */}
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="flex items-center gap-3 bg-surface-2 border border-border px-3 py-1.5 rounded-btn text-xs text-text-muted hover:border-accent/40 transition-colors w-64 justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search anything...</span>
            </div>
            <kbd className="font-mono text-[10px] bg-surface border border-border px-1.5 py-0.5 rounded text-text-muted">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Exam Switcher, Notifications, Theme Toggle, Profile */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {/* Exam Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
              className="flex items-center gap-1.5 bg-surface-2 border border-border px-3 py-1.5 rounded-btn text-text hover:border-border/80 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span>{selectedExam}</span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {isExamDropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-card shadow-lg py-1 z-50">
                {["IBPS RRB PO", "IBPS PO", "SBI PO", "SBI Clerk"].map((exam) => (
                  <button
                    key={exam}
                    onClick={() => {
                      setSelectedExam(exam);
                      setIsExamDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-surface-2 cursor-pointer ${
                      selectedExam === exam ? "text-accent font-semibold" : "text-text"
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <Link
            href="/settings"
            className="p-2 text-text-muted hover:text-text hover:bg-surface-2 rounded-btn transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </Link>

          {/* Theme Toggle (◐) */}
          <button
            onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-text hover:bg-surface-2 rounded-btn transition-colors cursor-pointer"
            title="Toggle theme (◐)"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile / Google Avatar */}
          <Link
            href="/settings"
            className="w-7 h-7 rounded-full overflow-hidden bg-surface-2 border border-border flex items-center justify-center font-bold text-xs text-text hover:border-accent transition-colors"
            title={googleUser?.email || userProfile?.email || "Candidate Settings"}
          >
            {googleUser?.picture ? (
              <img src={googleUser.picture} alt={googleUser.name} className="w-full h-full object-cover" />
            ) : (
              <span>{googleUser?.name ? googleUser.name.charAt(0).toUpperCase() : userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : "J"}</span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Top Bar (Responsive for Android & Phones) */}
      <header className="md:hidden h-13 border-b border-border bg-surface px-3 sm:px-4 flex items-center justify-between sticky top-0 z-40 pt-safe">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-1 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors touch-manipulation cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="font-bold text-base tracking-tight text-text flex items-center gap-1.5">
            <span className="w-5 h-5 rounded border border-border bg-surface-2 flex items-center justify-center font-mono text-[10px] text-accent font-bold">
              P
            </span>
            <span>POForge</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-warning" />
            <span>{userProfile?.streak_days ?? 0}d</span>
          </div>


          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors touch-manipulation cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors touch-manipulation cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Full Slide-out Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-surface border-r border-border h-full flex flex-col justify-between p-4 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-border bg-surface-2 flex items-center justify-center font-mono text-xs text-accent font-bold">
                    P
                  </span>
                  <div>
                    <div className="font-bold text-sm text-text">POForge AI</div>
                    <div className="text-[10px] text-text-muted font-mono">{selectedExam}</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Links */}
              <nav className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1">
                  Daily Training
                </div>
                {primaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                        isActive
                          ? "bg-accent/15 text-accent border border-accent/30 font-bold"
                          : "text-text-muted hover:text-text hover:bg-surface-2"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-muted"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="pt-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1">
                    Knowledge & System
                  </div>
                  {secondaryNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                          isActive
                            ? "bg-accent/15 text-accent border border-accent/30 font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-2"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-muted"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Drawer Footer / User Profile */}
            <div className="pt-3 border-t border-border space-y-2">
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-2 border border-border text-xs"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center font-bold text-xs text-text shrink-0">
                  {googleUser?.picture ? (
                    <img src={googleUser.picture} alt={googleUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{googleUser?.name ? googleUser.name.charAt(0).toUpperCase() : userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : "C"}</span>
                  )}
                </div>
                <div className="truncate">
                  <div className="font-bold text-text truncate">
                    {googleUser?.name || userProfile?.full_name || "Candidate"}
                  </div>
                  <div className="text-[10px] text-text-muted truncate">
                    {googleUser?.email || userProfile?.email || "candidate@poforge.ai"}
                  </div>
                </div>

              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Body: Left Rail Navigation + Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Rail Nav */}
        <aside className="hidden md:flex w-52 border-r border-border bg-surface flex-col justify-between p-3 flex-shrink-0">
          <nav className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              if (item.isCoachAction) {
                return (
                  <button
                    key={item.name}
                    onClick={() => setIsCoachPanelOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 rounded-btn transition-colors cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                    <span>Coach</span>
                    <kbd className="ml-auto font-mono text-[10px] text-text-muted bg-surface-2 border border-border px-1 rounded">
                      /
                    </kbd>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "border-l-4 border-accent text-accent font-semibold bg-transparent -ml-3 pl-5"
                      : "text-text-muted hover:text-text hover:bg-surface-2 rounded-btn"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-muted"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="my-3 border-t border-border" />

            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "border-l-4 border-accent text-accent font-semibold bg-transparent -ml-3 pl-5"
                      : "text-text-muted hover:text-text hover:bg-surface-2 rounded-btn"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-muted"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex flex-col pl-safe pr-safe">
          {pathname === "/coach" ? (
            <div className="flex-1 flex flex-col h-full">{children}</div>
          ) : (
            <div className="max-w-[1120px] mx-auto p-3 sm:p-4 md:p-8 space-y-5 md:space-y-6 flex-1 w-full">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (5 Primary Tabs with Safe-Area padding) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around z-40 px-1 pb-safe shadow-lg">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors touch-manipulation min-w-[56px] ${
                isActive ? "text-accent font-bold" : "text-text-muted hover:text-text"
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-accent/15" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-accent" : "text-text-muted"}`} />
              </div>
              <span className="leading-none">{item.name}</span>
            </Link>
          );
        })}

        {/* More Button to trigger drawer */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium text-text-muted hover:text-text transition-colors touch-manipulation min-w-[56px] cursor-pointer"
        >
          <div className="p-1">
            <Menu className="w-5 h-5 text-text-muted" />
          </div>
          <span className="leading-none">More</span>
        </button>
      </nav>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
      />

      {/* AI Coach Slide-Over Panel (Key '/') */}
      <SlideOverPanel
        isOpen={isCoachPanelOpen}
        onClose={() => setIsCoachPanelOpen(false)}
        title="AI Banking Coach"
        subtitle="Your preparation • Your data • Your coach"
        widthClass="max-w-3xl"
      >
        <CoachPanel initialMode="TEACHING" />
      </SlideOverPanel>
    </div>
  );
};

