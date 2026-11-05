"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserRole } from "@/lib/types";

export interface UserRoleContextValue {
  user: {
    id: string;
    email: string;
    fullName?: string;
  } | null;
  role: UserRole;
  isAdmin: boolean;
  isViewer: boolean;
}

const UserRoleContext = createContext<UserRoleContextValue>({
  user: null,
  role: "viewer",
  isAdmin: false,
  isViewer: true,
});

export interface RoleProviderProps {
  children: ReactNode;
  user: {
    id: string;
    email: string;
    fullName?: string;
  } | null;
  role: UserRole;
}

export function RoleProvider({ children, user, role }: RoleProviderProps) {
  const isAdmin = role === "admin";
  const isViewer = !isAdmin;

  return (
    <UserRoleContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isViewer,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

/**
 * Custom hook returning `{ user, role, isAdmin, isViewer }`
 */
export function useUserRole(): UserRoleContextValue {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within a RoleProvider");
  }
  return context;
}
