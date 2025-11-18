"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sidebarRoutes, type SidebarRoute } from "@/dummy/constant.data";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, MenuIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
// import { LogoIcon } from "./icons/icons"
// import Image from "next/image"

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

interface SidebarItemProps {
  open: boolean;
  setOpen: Function;
  route: SidebarRoute;
  isCollapsed: boolean;
  isMobile?: boolean;
  level?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  open,
  setOpen,
  route,
  isCollapsed,
  isMobile = false,
  level = 0,
}) => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = route.children && route.children.length > 0;
  const isActive = pathname === route.path;
  const Icon = route.icon;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

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
      <Icon
        className={cn(
          "h-6 w-6 shrink-0  text-gray-400!",
          isCollapsed && !isMobile && "mx-auto group-hover:text-law-black"
        )}
      />
      <span>{route.title}</span>
    </div>
  );

  if (hasChildren) {
    const parentContent = (
      <div>
        <div onClick={handleClick} className="cursor-pointer">
          {itemContent}
        </div>
        {isExpanded && (!isCollapsed || isMobile) && (
          <div className="mt-1 space-y-1">
            {route.children?.map((child) => (
              <SidebarItem
                open={open}
                setOpen={setOpen}
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
    );

    return parentContent;
  }

  const linkContent = (
    <Link
      href={route?.path || ""}
      className="block"
      onClick={() => setOpen(false)}
    >
      {itemContent}
    </Link>
  );

  return linkContent;
};

export const SidebarContent: React.FC<{
  open: boolean;
  setOpen: Function;
  isCollapsed: boolean;
  isMobile?: boolean;
  onToggleCollapse: () => void;
}> = ({ open, setOpen, isCollapsed, isMobile = false, onToggleCollapse }) => {
  const { user } = useAuthStore();
  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === "admin";

  // Filter routes based on user role
  const filteredRoutes = sidebarRoutes.filter((route) => {
    if (route.id === "users" && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col  backdrop-blur-lg ">
      {/* Header */}
      {!isMobile && (
        <div
          className={`flex  h-16  border-b border-t-gray/30 gap-3 items-center  ${
            !isCollapsed ? "" : "justify-center"
          } px-4`}
        >
          <div
            onClick={onToggleCollapse}
            className="p-0  hidden md:flex cursor-pointer"
          >
            <MenuIcon className="w-full text-t-gray " />
          </div>
          {!isCollapsed && <p className="text-white/80 ">Welcome</p>}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-3 p-4 ">
        {filteredRoutes.map((route) => (
          <SidebarItem
            open={open}
            setOpen={setOpen}
            key={route.id}
            route={route}
            isCollapsed={isCollapsed}
            isMobile={isMobile}
          />
        ))}
      </nav>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobile = false,
  onToggleCollapse,
}) => {
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent
            open={false}
            setOpen={() => {}}
            isCollapsed={false}
            isMobile={true}
            onToggleCollapse={onToggleCollapse}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "hidden md:flex h-full  bg-t-black flex-col border-r border-t-gray/30 transition-all duration-300",
        isCollapsed ? "w-24" : "w-48"
      )}
    >
      <SidebarContent
        open={false}
        setOpen={() => undefined}
        isCollapsed={isCollapsed}
        isMobile={false}
        onToggleCollapse={onToggleCollapse}
      />
    </div>
  );
};
