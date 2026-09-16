"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AuthSessionUser, roleToPortal } from "../../lib/authSession";
import { ThemeToggle } from "../ui/ThemeToggle";

interface LoginPageProps {
  onLoginSuccess: (user: AuthSessionUser) => void;
}

const PRESET_USERS = [
  {
    role: "ADMIN" as const,
    label: "Admin",
    username: "admin",
    icon: Shield,
    color: "from-purple-600 to-indigo-600",
    badge: "Full System Control",
  },
  {
    role: "RECEPTIONIST" as const,
    label: "Receptionist",
    username: "receptionist1",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
    badge: "Patient OPD & Billing",
  },
  {
    role: "CONSULTANT" as const,
    label: "Consultant",
    username: "dr_bilal",
    icon: Stethoscope,
    color: "from-emerald-600 to-teal-600",
    badge: "EMR & Prescriptions",
  },
  {
    role: "LAB_STAFF" as const,
    label: "Laboratory",
    username: "lab_tech1",
    icon: TestTube,
    color: "from-amber-600 to-orange-600",
    badge: "Pathology Tests",
  },
  {
    role: "ULTRASOUND_STAFF" as const,
    label: "Ultrasound",
    username: "ultrasound_tech1",
    icon: Radio,
    color: "from-rose-600 to-pink-600",
    badge: "Imaging & Scans",
  },
  {
    role: "PHARMACY_STAFF" as const,
    label: "Pharmacy",
    username: "pharmacist1",
    icon: Pill,
    color: "from-cyan-600 to-blue-600",
    badge: "Inventory & Meds",
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  const selectPreset = (preset: (typeof PRESET_USERS)[0]) => {
    setUsername(preset.username);
    setPassword("");
    setActiveTab(preset.username);
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid username or password.");
      }

      // Successful login from API
      const userSession: AuthSessionUser = {
        id: data.user.id,
        username: data.user.username,
        fullName: data.user.fullName,
        role: data.user.role,
        portal: data.user.portal || roleToPortal(data.user.role),
        token: data.token,
        consultantId: data.user.consultantId,
      };

      onLoginSuccess(userSession);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between z-10 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              BILAL HOSPITAL
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40">
                PORTAL v2.4
              </span>
            </h1>
            <p className="text-xs text-slate-400">Internal Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Portal</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Left Panel: Role Quick Selector & Branding */}
          <div className="lg:col-span-5 p-6 lg:p-8 bg-gradient-to-b from-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold border border-brand-500/20 mb-4">
                <Lock className="w-3 h-3" /> Staff Role Authentication
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-snug">
                Welcome to Hospital Portal
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Select your authorized department role or enter your assigned staff credentials to log in.
              </p>

              {/* Role Preset Quick Buttons */}
              <div className="mt-6 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Select Staff Role Quick Fill
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_USERS.map((preset) => {
                    const IconComp = preset.icon;
                    const isSelected = activeTab === preset.username;
                    return (
                      <button
                        key={preset.username}
                        type="button"
                        onClick={() => selectPreset(preset)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-slate-800 border-brand-500 shadow-md text-white"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${preset.color} flex items-center justify-center text-white shrink-0`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold truncate leading-none">
                            {preset.label}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate mt-0.5">
                            {preset.username}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>BHMS Security Protocol v2.4</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Active DB
              </span>
            </div>
          </div>

          {/* Right Panel: Login Credentials Form */}
          <div className="lg:col-span-7 p-6 lg:p-10 flex flex-col justify-center bg-slate-900/50">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Sign In to System
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your staff username and password to access your role workspace.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Username / ID
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white placeholder-slate-600 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500">Case sensitive</span>
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white placeholder-slate-600 text-sm outline-none transition-all"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Log In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="py-3 text-center text-xs text-slate-500 z-10 border-t border-slate-900 bg-slate-950/80">
        Internal Medical & Operational System &copy; {new Date().getFullYear()} Bilal Hospital. All rights reserved.
      </footer>
    </div>
  );
};
