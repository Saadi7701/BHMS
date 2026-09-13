import React, { useState, useEffect } from "react";
import {
  Activity,
  Shield,
  Bell,
  Clock,
  ChevronDown,
  UserCheck,
  Building2,
  Stethoscope,
  Users,
  TestTube,
  Radio,
  Pill,
  ShieldAlert,
} from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

export type RolePortal =
  | "ADMIN"
  | "CONSULTANT"
  | "RECEPTIONIST"
  | "LABORATORY"
  | "ULTRASOUND"
  | "PHARMACY";

interface NavbarProps {
  activePortal: RolePortal;
  onSelectPortal: (portal: RolePortal) => void;
  activeConsultantId?: string;
  onSelectConsultant?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePortal,
  onSelectPortal,
  activeConsultantId = "doc-1",
  onSelectConsultant,
}) => {
  const [time, setTime] = useState<string>("");
  const [showPortalDropdown, setShowPortalDropdown] = useState(false);
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

  const portalList: {
    id: RolePortal;
    name: string;
    icon: any;
    desc: string;
    color: string;
  }[] = [
    {
      id: "ADMIN",
      name: "Admin Control Center",
      icon: Shield,
      desc: "Full Cash Ledger, Audits & System Health",
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
    },
    {
      id: "RECEPTIONIST",
      name: "Receptionist Portal",
      icon: Users,
      desc: "Patient Registration, Visits & Fee Collection",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      id: "CONSULTANT",
      name: "Consultant Workspace",
      icon: Stethoscope,
      desc: "Clinical EMR, Prescriptions & Report Reviews",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      id: "LABORATORY",
      name: "Laboratory Portal",
      icon: TestTube,
      desc: "Orders Queue, Result Entry & Versioning",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      id: "ULTRASOUND",
      name: "Ultrasound Portal",
      icon: Radio,
      desc: "Ultrasound Requests, Findings & Scan Attachments",
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40",
    },
    {
      id: "PHARMACY",
      name: "Pharmacy Portal",
      icon: Pill,
      desc: "Prescription Dispensing & FIFO Inventory",
      color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40",
    },
  ];

  const currentPortalObj = portalList.find((p) => p.id === activePortal);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-40 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                BILAL HOSPITAL
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                PROD v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Internal Operations Management System</span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Secure TLS 1.3
              </span>
            </p>
          </div>
        </div>

        {/* Middle Role Portal Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPortalDropdown(!showPortalDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left group shadow-inner"
          >
            {currentPortalObj && (
              <div className={`p-1.5 rounded-lg ${currentPortalObj.color}`}>
                <currentPortalObj.icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <span>Active Portal Workspace</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{currentPortalObj?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform" />
              </div>
            </div>
          </button>

          {showPortalDropdown && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 mb-1">
                Switch Hospital Staff Workspace
              </div>
              <div className="space-y-1">
                {portalList.map((portal) => {
                  const IconComp = portal.icon;
                  const isSelected = activePortal === portal.id;
                  return (
                    <button
                      key={portal.id}
                      onClick={() => {
                        onSelectPortal(portal.id);
                        setShowPortalDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        isSelected
                          ? "bg-brand-50 dark:bg-brand-600/20 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-white"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${portal.color} mt-0.5`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{portal.name}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {portal.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Info Section */}
        <div className="flex items-center gap-3 md:gap-5">
          <ThemeToggle />
          
          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono">
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

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs">
              {activePortal === "ADMIN"
                ? "SA"
                : activePortal === "CONSULTANT"
                ? "DB"
                : activePortal === "RECEPTIONIST"
                ? "AK"
                : activePortal === "LABORATORY"
                ? "MU"
                : activePortal === "ULTRASOUND"
                ? "KR"
                : "ZB"}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {activePortal === "ADMIN"
                  ? "Admin Supervisor"
                  : activePortal === "CONSULTANT"
                  ? "Dr. Bilal Ahmad"
                  : activePortal === "RECEPTIONIST"
                  ? "Ayesha Khan"
                  : activePortal === "LABORATORY"
                  ? "Muhammad Usman"
                  : activePortal === "ULTRASOUND"
                  ? "Dr. Kamran Raza"
                  : "Zainab Bibi"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-emerald-400" />
                <span>Authorized Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
