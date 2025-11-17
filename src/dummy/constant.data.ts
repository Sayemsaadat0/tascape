import { 
  HomeIcon, 
  SettingsIcon,
  ChevronDownIcon,
  ChevronRightIcon
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
  // {
  //   id: "article",
  //   title: "Article",
  //   icon: FileTextIcon,
  //   children: [
  //     {
  //       id: "category",
  //       title: "Category",
  //       icon: FolderIcon,
  //       path: "/article/category"
  //     },
  //     {
  //       id: "article-list",
  //       title: "Article List",
  //       icon: FileTextIcon,
  //       path: "/article/list"
  //     }
  //   ]
  // },
  {
    id: "service",
    title: "Service",
    icon: SettingsIcon,
    path: "/service"
  }
]

export const sidebarIcons = {
  ChevronDown: ChevronDownIcon,
  ChevronRight: ChevronRightIcon
}
