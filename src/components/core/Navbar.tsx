"use client"

import React, { useState } from "react"
// import { cn } from "@/lib/utils"
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
    LogOutIcon,
} from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle
} from "@/components/ui/sheet"
// import { cn } from "@/lib/utils"
import { SidebarContent } from "./Sidebar"
import Link from "next/link"
import Image from "next/image"
// import { MobileSidebar } from "./mobile-sidebar"

interface MobileSidebarProps {
    open: boolean
    setOpen: Function
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ open, setOpen }) => {
    return (
        <Sheet open={open} onOpenChange={() => setOpen(!open)}>
            <SheetTrigger asChild>
                <MenuIcon className="h-5 w-5 cursor-pointer text-white" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 ">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Link href="/" className="cursor-pointer flex items-center gap-3 px-5  pt-5 pb-0">
                    <div>
                        <Image className="w-7 h-7" src="/logo/short-logo1.png" alt="logo" width={300} height={300} />
                        {/* <LogoIcon /> */}
                    </div>
                    <p className="text-white text-xl -mx-3 ">tascape</p>
                </Link>
                <div >
                    <SidebarContent open={open} setOpen={setOpen} isCollapsed={false} isMobile={true} onToggleCollapse={() => undefined} />
                </div>
            </SheetContent>
        </Sheet>
    )
}






//Default component props
interface NavbarProps {
    isCollapsed: boolean
    // onToggleCollapse: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
    // isCollapsed,
    // onToggleCollapse
}) => {
    const handleLogout = () => {
        // Add logout logic here
        console.log("Logout clicked")
    }

    const [open, setOpen] = useState(false)
    return (
        <header className="sticky  top-0 z-50 w-full shadow ">
            <div className=" flex h-14 items-center justify-between px-4">
                <div className="flex items-center  w-full gap-2">
                    <div className="md:hidden">
                        <MobileSidebar open={open} setOpen={setOpen} />
                    </div>
                    <Link href="/" className="cursor-pointer flex items-center gap-3">
                        <div>
                            <Image className="w-7 h-7" src="/logo/short-logo1.png" alt="logo" width={300} height={300} />
                            {/* <LogoIcon /> */}
                        </div>
                        <p className="text-white text-xl -mx-3 ">tascape</p>
                    </Link>

                </div>

                <div className="flex items-center gap-2 ">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <UserIcon className="h-6 cursor-pointer w-6 text-white" />
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
