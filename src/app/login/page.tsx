"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Shield,
  Stethoscope,
  Users,
  TestTube,
  Radio,
  Pill,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const PORTAL_LINKS = [
  {
    key: "admin",
    name: "System Admin Portal",
    url: "/login/admin",
    directPortalUrl: "/admin",
    icon: Shield,
    color: "from-purple-600 to-indigo-600",
    badge: "Full System Control",
    description: "Manage users, change portal passwords, financial cash ledger, audit logs.",
  },
  {
    key: "receptionist",
    name: "Receptionist Portal",
    url: "/login/receptionist",
    directPortalUrl: "/receptionist",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
    badge: "Patient OPD & Billing",
    description: "Register new patients, issue OPD tokens, collects fees & admit patients.",
  },
  {
    key: "consultant",
    name: "Consultant Doctor Portal",
    url: "/login/consultant",
    directPortalUrl: "/consultant",
    icon: Stethoscope,
    color: "from-emerald-600 to-teal-600",
    badge: "EMR & Prescriptions",
    description: "View queue, diagnose, issue e-prescriptions, order lab & ultrasound tests.",
  },
  {
    key: "laboratory",
    name: "Pathology Laboratory Portal",
    url: "/login/laboratory",
    directPortalUrl: "/laboratory",
    icon: TestTube,
    color: "from-amber-600 to-orange-600",
    badge: "Pathology Tests",
    description: "Process diagnostic orders, upload PDF lab reports & update sample status.",
  },
  {
    key: "ultrasound",
    name: "Ultrasound Radiology Portal",
    url: "/login/ultrasound",
    directPortalUrl: "/ultrasound",
    icon: Radio,
    color: "from-rose-600 to-pink-600",
    badge: "Imaging & Scans",
    description: "Ultrasound imaging queue, record sonology findings & attach scan files.",
  },
  {
    key: "pharmacy",
    name: "Hospital Pharmacy Portal",
    url: "/login/pharmacy",
    directPortalUrl: "/pharmacy",
    icon: Pill,
    color: "from-cyan-600 to-blue-600",
    badge: "Inventory & Meds",
    description: "Fulfill doctor prescriptions, dispense medicines & manage stock batches.",
  },
];

export default function LoginHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Glows */}
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
                PORTAL DIRECTORY
              </span>
            </h1>
            <p className="text-xs text-slate-400">Select Department Portal Access</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Portals</span>
          </div>
        </div>
      </header>

      {/* Main Directory Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold border border-brand-500/20 mb-3">
            <Lock className="w-3.5 h-3.5" /> Individual Portal Links & Dedicated Logins
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Hospital Portals Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Click on any individual portal to navigate directly to its dedicated login screen or portal workspace.
          </p>
        </div>

        {/* 6 Individual Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PORTAL_LINKS.map((portal) => {
            const IconComponent = portal.icon;
            return (
              <div
                key={portal.key}
                className="bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 rounded-2xl p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:shadow-brand-500/10 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${portal.color} flex items-center justify-center text-white shadow-lg`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {portal.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                    {portal.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <Link
                    href={portal.url}
                    className={`flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r ${portal.color} text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-opacity`}
                  >
                    <span>Login Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={portal.directPortalUrl}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
                    title="Direct Portal Link"
                  >
                    Portal Link
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-500 z-10 border-t border-slate-900 bg-slate-950/80">
        Internal Medical & Operational System &copy; {new Date().getFullYear()} Bilal Hospital. All rights reserved.
      </footer>
    </div>
  );
}
