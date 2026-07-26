import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "./SuperAdminSidebar";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SuperAdminSidebar />
        <main className="flex-1 p-6 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}