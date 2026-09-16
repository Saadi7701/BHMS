"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Shield,
  Stethoscope,
  Users,
  TestTube,
  Radio,
  Pill,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { AuthSessionUser, setAuthSession, roleToPortal } from "../../lib/authSession";
import { ThemeToggle } from "../ui/ThemeToggle";
import Link from "next/link";

export type PortalType =
  | "admin"
  | "receptionist"
  | "consultant"
  | "laboratory"
  | "ultrasound"
  | "pharmacy";

interface PortalConfig {
  portalKey: PortalType;
  title: string;
  subtitle: string;
  role: "ADMIN" | "RECEPTIONIST" | "CONSULTANT" | "LAB_STAFF" | "ULTRASOUND_STAFF" | "PHARMACY_STAFF";
  icon: any;
  color: string;
  gradientBg: string;
  badge: string;
  destinationUrl: string;
}

export const PORTAL_CONFIGS: Record<PortalType, PortalConfig> = {
  admin: {
    portalKey: "admin",
    title: "System Administrator Portal Login",
    subtitle: "Full System Control, Master Cash Ledger & Password Access",
    role: "ADMIN",
    icon: Shield,
    color: "from-purple-600 to-indigo-600",
    gradientBg: "from-purple-950/40 via-slate-950 to-slate-950",
    badge: "Admin Privilege Access",
    destinationUrl: "/admin",
  },
  receptionist: {
    portalKey: "receptionist",
    title: "Front Desk & Receptionist Portal Login",
    subtitle: "Patient Registration, OPD Ticketing & Cash Collection",
    role: "RECEPTIONIST",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
    gradientBg: "from-blue-950/40 via-slate-950 to-slate-950",
    badge: "Front Desk Workspace",
    destinationUrl: "/receptionist",
  },
  consultant: {
    portalKey: "consultant",
    title: "Consultant Doctor EMR Portal Login",
    subtitle: "Digital Prescriptions, EMR Records & Lab/Ultrasound Requests",
    role: "CONSULTANT",
    icon: Stethoscope,
    color: "from-emerald-600 to-teal-600",
    gradientBg: "from-emerald-950/40 via-slate-950 to-slate-950",
    badge: "Clinical EMR Portal",
    destinationUrl: "/consultant",
  },
  laboratory: {
    portalKey: "laboratory",
    title: "Pathology & Laboratory Portal Login",
    subtitle: "Pathology Orders, Result Processing & Report Publishing",
    role: "LAB_STAFF",
    icon: TestTube,
    color: "from-amber-600 to-orange-600",
    gradientBg: "from-amber-950/40 via-slate-950 to-slate-950",
    badge: "Pathology Workspace",
    destinationUrl: "/laboratory",
  },
  ultrasound: {
    portalKey: "ultrasound",
    title: "Diagnostic Imaging & Ultrasound Portal Login",
    subtitle: "Sonology Scans, Imaging Records & Report Generation",
    role: "ULTRASOUND_STAFF",
    icon: Radio,
    color: "from-rose-600 to-pink-600",
    gradientBg: "from-rose-950/40 via-slate-950 to-slate-950",
    badge: "Ultrasound Radiology",
    destinationUrl: "/ultrasound",
  },
  pharmacy: {
    portalKey: "pharmacy",
    title: "Hospital Pharmacy & Medicine Portal Login",
    subtitle: "Prescription Dispensing & Stock Inventory Transactions",
    role: "PHARMACY_STAFF",
    icon: Pill,
    color: "from-cyan-600 to-blue-600",
    gradientBg: "from-cyan-950/40 via-slate-950 to-slate-950",
    badge: "Pharmacy Inventory",
    destinationUrl: "/pharmacy",
  },
};

interface PortalLoginPageProps {
  portalType: PortalType;
}

export const PortalLoginPage: React.FC<PortalLoginPageProps> = ({ portalType }) => {
  const router = useRouter();
  const config = PORTAL_CONFIGS[portalType] || PORTAL_CONFIGS.admin;
  const PortalIcon = config.icon;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Authenticate against MongoDB database
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials.");
      }

      const userSession: AuthSessionUser = {
        id: data.user.id,
        username: data.user.username,
        fullName: data.user.fullName,
        role: data.user.role,
        portal: data.user.portal || roleToPortal(data.user.role),
        token: data.token,
        consultantId: data.user.consultantId,
      };

      setAuthSession(userSession);
      router.push(config.destinationUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials for this portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none bg-gradient-to-b ${config.gradientBg}`}>
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between z-10 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Portals Hub</span>
          </Link>
          <div className="h-5 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${config.color} flex items-center justify-center text-white shadow-lg`}>
              <PortalIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white">
                BILAL HOSPITAL
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{config.badge}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          
          <div className="text-center mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${config.color} flex items-center justify-center text-white shadow-xl mx-auto mb-3`}>
              <PortalIcon className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {config.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {config.subtitle}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Staff Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter staff username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white placeholder-slate-600 text-sm outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500">Encrypted</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white placeholder-slate-600 text-sm outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${config.color} text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to {config.badge}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
            Need password reset? Contact System Admin via Admin Portal.
          </div>
        </div>
      </main>

      <footer className="py-3 text-center text-xs text-slate-500 z-10 border-t border-slate-900 bg-slate-950/80">
        Bilal Hospital Management System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};
