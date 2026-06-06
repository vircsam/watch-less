"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UploadCloud, 
  Settings, 
  CreditCard, 
  User, 
  MessageSquareCode, 
  Video, 
  Coins
} from "lucide-react";
import { useAppStore } from "@/store";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppStore();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Video", href: "/upload", icon: UploadCloud },
    { name: "Billing & Credits", href: "/billing", icon: CreditCard },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-zinc-950/40 p-4 hidden md:flex flex-col gap-6 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      {/* Sidebar Nav */}
      <div className="flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase px-3 mb-2">Navigation</span>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/15"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${
                isActive ? "text-white" : "text-zinc-400 group-hover:text-primary transition-colors duration-200"
              }`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Credit balance widget at the bottom */}
      {user && (
        <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Coins className="h-4.5 w-4.5 text-secondary animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300">Credits Remaining</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-white">{user.credits}</span>
            <span className="text-[10px] text-zinc-500 font-medium">Credits</span>
          </div>
          <Link
            href="/billing"
            className="w-full text-center rounded-lg bg-zinc-800 hover:bg-primary py-1.5 text-xs font-semibold text-white transition-all duration-200"
          >
            Buy More
          </Link>
        </div>
      )}
    </aside>
  );
}
