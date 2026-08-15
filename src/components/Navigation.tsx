"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Award, Bot, BarChart3, ShieldCheck, Flame, Zap } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "HOME", path: "/", icon: Home, description: "What should I do today?" },
    { name: "MOCK", path: "/mock", icon: Award, description: "Exam conditions" },
    { name: "AI", path: "/ai", icon: Bot, description: "Teach and coach me" },
    { name: "ANALYSIS", path: "/analysis", icon: BarChart3, description: "Progress & fixes" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-md border-b border-gray-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Target Exam Badge */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
                POForge
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                AI Coach
              </span>
            </div>
          </Link>

          {/* Active Target Exam Badge */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 border border-gray-700/50 px-3 py-1 rounded-full text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400">IBPS RRB PO</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">43 Days Left</span>
          </div>
        </div>

        {/* Primary 4 Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
                }`}
                title={item.description}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Streak & Admin Portal */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>12 Day Streak</span>
          </div>

          <Link
            href="/admin"
            className="flex items-center space-x-1.5 bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 border border-gray-700/60 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Admin Portal</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
