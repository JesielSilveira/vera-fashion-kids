"use client"

import Link from "next/link"
import { LayoutDashboard, Package, Tags, Image } from "lucide-react"

const menu = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Produtos",
    href: "/admin/produtos",
    icon: Package,
  },
  {
    label: "Categorias",
    href: "/admin/categorias",
    icon: Tags,
  },
  {
    label: "Banners",
    href: "/admin/banners",
    icon: Image,
  },
]

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-6 text-xl font-bold">
        Admin
      </div>

      <nav className="space-y-1 px-4">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
