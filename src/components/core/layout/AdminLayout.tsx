"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
// import { AdminSidebar } from "./admin-sidebar"
// import { AdminNavbar } from "./admin-navbar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "../Sidebar"
import { Navbar } from "../Navbar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen ">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="">
            <Sidebar
              isCollapsed={isCollapsed}
              onToggleCollapse={handleToggleCollapse}
              isMobile={false}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Navbar */}
            <Navbar isCollapsed={false} />

            {/* Page Content */}
            <main className={cn(
              "flex-1 overflow-auto min-h-screen border border-gray-400 bg-t-gray! rounded-lg transition-all duration-300",

            )}>
              <div className="mx-auto p-5   ">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
