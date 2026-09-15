export interface AuthSessionUser {
  id: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "CONSULTANT" | "RECEPTIONIST" | "LAB_STAFF" | "PHARMACY_STAFF" | "ULTRASOUND_STAFF";
  portal: "ADMIN" | "CONSULTANT" | "RECEPTIONIST" | "LABORATORY" | "PHARMACY" | "ULTRASOUND";
  token?: string;
  consultantId?: string;
}

const SESSION_KEY = "bhms_user_session";

export function getAuthSession(): AuthSessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSessionUser;
  } catch {
    return null;
  }
}

export function setAuthSession(user: AuthSessionUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save auth session:", e);
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error("Failed to clear auth session:", e);
  }
}

export function roleToPortal(role: AuthSessionUser["role"]): AuthSessionUser["portal"] {
  switch (role) {
    case "ADMIN":
      return "ADMIN";
    case "CONSULTANT":
      return "CONSULTANT";
    case "RECEPTIONIST":
      return "RECEPTIONIST";
    case "LAB_STAFF":
      return "LABORATORY";
    case "ULTRASOUND_STAFF":
      return "ULTRASOUND";
    case "PHARMACY_STAFF":
      return "PHARMACY";
    default:
      return "RECEPTIONIST";
  }
}
