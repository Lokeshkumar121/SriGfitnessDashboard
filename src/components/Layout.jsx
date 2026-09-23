import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
} from "lucide-react";

import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Members",
    path: "/members",
    icon: Users,
  },
  {
    name: "Memberships",
    path: "/memberships",
    icon: Dumbbell,
  },
  {
    name: "Payments",
    path: "/payments",
    icon: CreditCard,
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();

  const location = useLocation();

  const currentPage =
    navItems.find(
      (item) => item.path === location.pathname
    )?.name || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-screen w-72
          bg-slate-900 border-r border-white/10
          transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 px-6 flex items-center border-b border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Dumbbell size={22} />
            </div>

            <div className="ml-3">
              <h1 className="font-bold text-lg">
                Sri G Fitness
              </h1>

              <p className="text-xs text-slate-400">
                Club Management
              </p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-slate-400"
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 px-3 mb-3">
              Management
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3 px-4 py-3
                    rounded-xl transition-all
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                    `
                  }
                >
                  <Icon size={19} />

                  <span className="text-sm font-medium">
                    {item.name}
                  </span>

                  <ChevronRight
                    size={15}
                    className="ml-auto opacity-0 group-hover:opacity-60"
                  />
                </NavLink>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <CircleUserRound
                  size={20}
                  className="text-blue-400"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">
                  {user?.name}
                </p>

                <p className="text-xs text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut size={18} />

              <span className="text-sm">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-20 bg-slate-950/90 backdrop-blur-xl border-b border-white/10">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
              >
                <Menu size={21} />
              </button>

              <div>
                <h2 className="font-bold text-lg">
                  {currentPage}
                </h2>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                  <span>
                    Sri G Fitness Club
                  </span>

                  <span>/</span>

                  <span className="text-slate-400">
                    {currentPage}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NavLink
                to="/notifications"
                className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              >
                <Bell size={19} />
              </NavLink>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <span className="font-bold text-sm">
                    {user?.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;