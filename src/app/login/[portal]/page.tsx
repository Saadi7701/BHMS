"use client";

import React from "react";
import { PortalLoginPage, PortalType } from "@/components/auth/PortalLoginPage";

interface PageProps {
  params: {
    portal: string;
  };
}

export default function IndividualPortalLoginPage({ params }: PageProps) {
  const portalParam = (params.portal || "admin").toLowerCase() as PortalType;
  const validPortals: PortalType[] = [
    "admin",
    "receptionist",
    "consultant",
    "laboratory",
    "ultrasound",
    "pharmacy",
  ];

  const portalType = validPortals.includes(portalParam) ? portalParam : "admin";

  return <PortalLoginPage portalType={portalType} />;
}
