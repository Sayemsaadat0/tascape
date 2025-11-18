import { 
  HomeIcon, 
  SettingsIcon,
  Users2Icon,
  BriefcaseIcon,
  UserIcon,
  ActivityIcon,
  CheckSquareIcon
} from "lucide-react"

export interface SidebarRoute {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  children?: SidebarRoute[]
}

export const sidebarRoutes: SidebarRoute[] = [
  {
    id: "home",
    title: "Home",
    icon: HomeIcon,
    path: "/"
  },

  {
    id: "teams",
    title: "Teams",
    icon: Users2Icon,
    path: "/teams"
  },
  {
    id: "projects",
    title: "Projects",
    icon: BriefcaseIcon,
    path: "/projects"
  },
  {
    id: "tasks",
    title: "Tasks",
    icon: CheckSquareIcon,
    path: "/tasks"
  },
    {
      id: "users",
      title: "Users",
      icon: UserIcon,
      path: "/users"
    },
    {
      id: "members",
      title: "Members",
      icon: UserIcon,
      path: "/members"
    },
  {
    id: "activity-logs",
    title: "Activity Logs",
    icon: ActivityIcon,
    path: "/activity-logs"
  }
]
