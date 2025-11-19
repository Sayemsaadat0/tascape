"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MenuIcon, UserIcon, LogOutIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarContent } from "./Sidebar";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/auth.hook";

interface MobileSidebarProps {
  open: boolean;
  setOpen: Function;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  open,
  setOpen,
}) => {
  return (
    <Sheet open={open} onOpenChange={() => setOpen(!open)}>
      <SheetTrigger asChild>
        <MenuIcon className="h-5 w-5 cursor-pointer text-white" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 ">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <Link
          href="/"
          className="cursor-pointer flex items-center gap-3 px-5  pt-5 pb-0"
        >
          <div>
            <Image
              className="w-7 h-7"
              src="/logo/short-logo1.png"
              alt="logo"
              width={300}
              height={300}
            />
            {/* <LogoIcon /> */}
          </div>
          <p className="text-white text-xl -mx-3 ">tascape</p>
        </Link>
        <div>
          <SidebarContent
            open={open}
            setOpen={setOpen}
            isCollapsed={false}
            isMobile={true}
            onToggleCollapse={() => undefined}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

//Default component props
// interface NavbarProps {
//   isCollapsed: boolean;
//   // onToggleCollapse: () => void
// }

export const Navbar = () => {
  const router = useRouter();
  const { user, removeAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const { mutateAsync } = useLogout();

  const handleLogout = async () => {
    const result = await mutateAsync();
    if (result.success) {
      removeAuth();
      toast.success("Logged out successfully");
      router.push("/sign-in");
    } else {
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="sticky  border-b border-t-gray/30 top- z-50 w-full  ">
      <div className=" flex h-[63px] items-center justify-between px-4">
        <div className="flex items-center  w-full gap-2">
          <div className="md:hidden">
            <MobileSidebar open={open} setOpen={setOpen} />
          </div>
          <Link href="/" className="cursor-pointer flex items-center gap-3">
            <div>
              <Image
                className="w-7 h-7"
                src="/logo/short-logo1.png"
                alt="logo"
                width={300}
                height={300}
              />
              {/* <LogoIcon /> */}
            </div>
            <p className="text-white text-xl -mx-3 ">tascape</p>
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 bg-t-black/70 px-2 py-2 rounded-full border-2 border-white/20 shadow cursor-pointer hover:bg-t-black/80 transition-colors">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-t-black border-2 border-white rounded-md shadow-[1px_-1px_0px_5px_rgba(0,0,0,0.1)] p-2"
            align="end"
          >
            <DropdownMenuLabel className="px-2 py-1.5">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-white" />
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-white leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-white/60 leading-none">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20 my-2" />
            <DropdownMenuItem
              className="text-t-orange-light hover:text-t-orange hover:bg-white/10 cursor-pointer rounded-md px-2 py-1.5 focus:bg-white/10"
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
