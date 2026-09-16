import React, { useState, useEffect } from "react";
import {
  Activity,
  Shield,
  Bell,
  Clock,
  Building2,
  Stethoscope,
  Users,
  TestTube,
  Radio,
  Pill,
  ShieldAlert,
  LogOut,
  UserCheck,
} from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { AuthSessionUser } from "../../lib/authSession";

export type RolePortal =
  | "ADMIN"
  | "CONSULTANT"
  | "RECEPTIONIST"
  | "LABORATORY"
  | "ULTRASOUND"
  | "PHARMACY";

interface NavbarProps {
  currentUser: AuthSessionUser;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  const [time, setTime] = useState<string>("");
  const [notificationsCount, setNotificationsCount] = useState(3);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPortalDetails = (portal: AuthSessionUser["portal"]) => {
    switch (portal) {
      case "ADMIN":
        return {
          name: "Admin Control Center",
          icon: Shield,
          color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
        };
      case "RECEPTIONIST":
        return {
          name: "Receptionist Portal",
          icon: Users,
          color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
        };
      case "CONSULTANT":
        return {
          name: "Consultant Workspace",
          icon: Stethoscope,
          color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
        };
      case "LABORATORY":
        return {
          name: "Laboratory Portal",
          icon: TestTube,
          color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
        };
      case "ULTRASOUND":
        return {
          name: "Ultrasound Portal",
          icon: Radio,
          color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
        };
      case "PHARMACY":
        return {
          name: "Pharmacy Portal",
          icon: Pill,
          color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800",
        };
    }
  };

  const portalObj = getPortalDetails(currentUser.portal);
  const IconComp = portalObj.icon;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-40 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                BILAL HOSPITAL
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-500 dark:text-brand-300 border border-brand-500/30">
                PROD v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Internal Operations Management</span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Secure TLS 1.3
              </span>
            </p>
          </div>
        </div>

        {/* Center: Active Role Badge with Direct Portal Links Switcher */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border bg-slate-50 dark:bg-slate-800/80 shadow-inner">
          <div className={`p-1.5 rounded-lg border ${portalObj.color}`}>
            <IconComp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-none">
              Authenticated Workspace
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <span>{portalObj.name}</span>
            </div>
          </div>

          <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <a
              href="/admin"
              className="px-2 py-1 text-[10px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Admin Portal Link (/admin)"
            >
              Admin
            </a>
            <a
              href="/receptionist"
              className="px-2 py-1 text-[10px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Receptionist Portal Link (/receptionist)"
            >
              Recep
            </a>
            <a
              href="/consultant"
              className="px-2 py-1 text-[10px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Consultant Portal Link (/consultant)"
            >
              Doctor
            </a>
            <a
              href="/laboratory"
              className="px-2 py-1 text-[10px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Lab Portal Link (/laboratory)"
            >
              Lab
            </a>
            <a
              href="/ultrasound"
              className="px-2 py-1 text-[10px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Ultrasound Portal Link (/ultrasound)"
            >
              US
            </a>
            <a
              href="/pharmacy"
              className="px-2 py-1 text-[10px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Pharmacy Portal Link (/pharmacy)"
            >
              Pharma
            </a>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />

          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>{time}</span>
          </div>

          {/* Notifications Center */}
          <button className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {notificationsCount}
              </span>
            )}
          </button>

          {/* Logged-In User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white border border-brand-500 flex items-center justify-center font-bold text-xs shadow-sm">
              {currentUser.fullName
                ? currentUser.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "BH"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {currentUser.fullName || currentUser.username}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                <span className="font-semibold capitalize">{currentUser.role.toLowerCase()}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Log out of system"
              className="ml-1 p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
