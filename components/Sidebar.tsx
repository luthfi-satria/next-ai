// components/Sidebar.tsx
import Link from "next/link"

export default function Sidebar() {
  const sidebarMenu = [
    { link: "/dashboard", label: "dashboard" },
    { link: "/dashboard/users", label: "users" },
    { link: "/dashboard/categories", label: "categories" },
    { link: "/dashboard/stores", label: "stores" },
    { link: "/dashboard/products", label: "products" },
    { link: "/dashboard/plagiarism-tools", label: "plagiarism tools" },
    { link: "/dashboard/simple_ai", label: "simple ai" },
    { link: "/dashboard/settings", label: "settings" },
  ]
  return (
    <aside className="w-1/6 bg-slate-800 text-white p-5 shadow-md">
      <h2 className="mb-7 text-center">Admin Panel</h2>
      <nav>
        <ul className="list-none p-0">
          {sidebarMenu.map((items, key) => (
            <li className="mb-4" key={`sidebarmenu-${key}`}>
              <Link
                href={items.link}
                className="text-white no-underline text-md capitalize"
              >
                {items.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
