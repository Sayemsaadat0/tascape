"use client"

import React from "react"
// import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    MenuIcon,
    UserIcon,
    SettingsIcon,
    LogOutIcon,
} from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SidebarContent } from "./Sidebar"
// import { MobileSidebar } from "./mobile-sidebar"

interface MobileSidebarProps {
    className?: string
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ className }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("hover:bg-amber-50", className)}
                >
                    <MenuIcon className="h-5 w-5 text-amber-600" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarContent isCollapsed={false} isMobile={true} />
            </SheetContent>
        </Sheet>
    )
}






//Default component props
interface NavbarProps {
    isCollapsed: boolean
    onToggleCollapse: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
    // isCollapsed,
    onToggleCollapse
}) => {
    const handleLogout = () => {
        // Add logout logic here
        console.log("Logout clicked")
    }

    const handleSettings = () => {
        // Add settings navigation logic here
        console.log("Settings clicked")
    }

    return (
        <header className="sticky  top-0 z-50 w-full shadow ">
            <div className=" flex h-14 items-center justify-between px-4">
                {/* Left side - Mobile sidebar and Collapse button */}
                <div className="flex items-center gap-2">
                    {/* Mobile sidebar - visible only on small devices */}
                    <div className="md:hidden">
                        <MobileSidebar />
                    </div>

                    {/* Collapse button - hidden on small devices */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleCollapse}
                            className="hidden md:flex"
                        >
                            <MenuIcon className="h-5 w-5 text-t-gray" />
                        </Button>
                        <p className="text-white/80 ">Welcome, <span className="text-2xl">John Doe</span></p>
                    </div>

                </div>

                {/* Right side - Notifications and Profile dropdown */}
                <div className="flex items-center gap-2 ">
                    {/* Profile dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="relative h-8 w-8 rounded-full">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <span className="sr-only">Open user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">John Doe</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        john.doe@example.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSettings}>
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOutIcon className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
