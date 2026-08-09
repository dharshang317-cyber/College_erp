import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Overview", roles: ["student", "faculty", "librarian", "admin", "placement_officer"] },
  { to: "/attendance", label: "Attendance", roles: ["student", "faculty", "admin"] },
  { to: "/library", label: "Library", roles: ["student", "librarian", "admin"] },
  // Extend here as you build: exam-hall, placement, faculty, timetable
];

export default function Layout() {
  const { user, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-ledger-panel border-r border-ledger-line flex flex-col">
        <div className="px-6 py-7">
          <p className="eyebrow">Register No. 001</p>
          <h1 className="font-display text-2xl mt-1 text-ledger-accent">Campus Ledger</h1>
          <p className="text-xs text-ledger-muted mt-1">College Maintenance System</p>
        </div>
        <div className="ledger-rule mx-6" />
        <nav className="flex-1 px-4 py-6 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded font-body text-sm transition-colors ${
                  isActive
                    ? "bg-ledger-accent/15 text-ledger-accent border-l-2 border-ledger-accent"
                    : "text-ledger-muted hover:text-ledger-text hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ledger-rule mx-6" />
        <div className="px-6 py-5">
          <p className="text-sm text-ledger-text">{user?.name}</p>
          <p className="eyebrow mt-0.5">{user?.role?.replace("_", " ")}</p>
          <button
            onClick={logout}
            className="mt-3 text-xs text-ledger-danger hover:underline font-mono"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-ledger-bg overflow-y-auto">
        <div className="max-w-5xl mx-auto px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
