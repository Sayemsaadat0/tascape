"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { sidebarRoutes,  type SidebarRoute } from "@/dummy/constant.data"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { LogoIcon } from "./icons/icons"

interface SidebarProps {
    isCollapsed: boolean
    onToggleCollapse: () => void
    isMobile?: boolean
}

interface SidebarItemProps {
    route: SidebarRoute
    isCollapsed: boolean
    isMobile?: boolean
    level?: number
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    route,
    isCollapsed,
    isMobile = false,
    level = 0
}) => {
    const pathname = usePathname()
    const [isExpanded, setIsExpanded] = useState(false)
    const hasChildren = route.children && route.children.length > 0
    const isActive = pathname === route.path
    const Icon = route.icon

    const handleClick = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded)
        }
    }

    const itemContent = (
        <div
            className={cn(
                "flex gap-1 pt-3 items-center  px-2 py-2 text-white rounded-md",
                isActive && "bg-white/20 ",
                !isActive && "",
                level > 0 && "",
                isCollapsed && !isMobile && "justify-center flex-col text-xs"
            )}
        >
            <Icon className={cn(
                "h-6 w-6 shrink-0  text-gray-400!",
                isCollapsed && !isMobile && "mx-auto group-hover:text-law-black",
            )} />
            <span>
                {route.title}
            </span>
        </div>
    )

    if (hasChildren) {
        const parentContent = (
            <div>
                <div
                    onClick={handleClick}
                    className="cursor-pointer"
                >
                    {itemContent}
                </div>
                {isExpanded && (!isCollapsed || isMobile) && (
                    <div className="mt-1 space-y-1">
                        {route.children?.map((child) => (
                            <SidebarItem
                                key={child.id}
                                route={child}
                                isCollapsed={isCollapsed}
                                isMobile={isMobile}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        )

        return parentContent
    }

    const linkContent = (
        <Link href={route?.path || ""} className="block">
            {itemContent}
        </Link>
    )

    return linkContent
}

export const SidebarContent: React.FC<{ isCollapsed: boolean; isMobile?: boolean }> = ({
    isCollapsed,
    isMobile = false
}) => {
    return (
        <div className="flex h-full flex-col  backdrop-blur-lg ">
            {/* Header */}
            <div className={`flex py-3.5 items-center  ${!isCollapsed ? "" : "justify-center"} px-4`}>
                {(!isCollapsed || isMobile) ? (
                    <Link href="/" className=" flex items-center gap-3">
                        <div>
                            <LogoIcon />
                        </div>
                        <p className="text-white text-xl -mx-3 ">tascape</p>
                    </Link>
                ) : (
                    <div>
                        <LogoIcon />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-3 p-4 ">
                {sidebarRoutes.map((route) => (
                    <SidebarItem
                        key={route.id}
                        route={route}
                        isCollapsed={isCollapsed}
                        isMobile={isMobile}
                    />
                ))}
            </nav>

            {/* Footer */}
            {/* <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && !isMobile && "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-600 truncate">admin@lawfirm.com</p>
            </div>
          )}
        </div>
      </div> */}
        </div>
    )
}

export const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    isMobile = false
}) => {
    if (isMobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent isCollapsed={false} isMobile={true} />
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <div
            className={cn(
                "hidden md:flex h-full bg-t-black flex-col transition-all duration-300",
                isCollapsed ? "w-24" : "w-48"
            )}
        >
            <SidebarContent isCollapsed={isCollapsed} isMobile={false} />
        </div>
    )
}
