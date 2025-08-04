// src/components/Navigation/Layout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    // On mobile (default), this is a standard block layout.
    // On medium screens and up (md:), it becomes a flex row.
    <div className="md:flex md:min-h-screen">
      
      {/* The Sidebar component internally handles its mobile vs desktop appearance */}
      <Sidebar />

      {/* The main content area takes up the remaining space */}
      <main className="flex-1">
        <div className="p-4 md:p-6">
          {/* The content of your pages (HomePage, Chat, etc.) will be rendered here */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}
