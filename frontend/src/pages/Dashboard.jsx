import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <p className="eyebrow">Overview</p>
      <h1 className="font-display text-3xl text-ledger-text mt-1">
        Welcome back, {user?.name?.split(" ")[0]}
      </h1>
      <div className="ledger-rule mt-6 mb-8" />

      {user?.role === "admin" ? <AdminHealthScore /> : <RoleSummary role={user?.role} />}
    </div>
  );
}

// This is the "unique feature" from the plan: a single cross-module health
// dashboard. Wire each card to its real endpoint once the remaining modules
// (exam hall, placement, faculty, timetable) are built.
function AdminHealthScore() {
  const cards = [
    { label: "Avg. Attendance", value: "82%", tone: "text-ledger-accent2" },
    { label: "Books Overdue", value: "GET /api/library/overdue", tone: "text-ledger-danger" },
    { label: "Pending Condonations", value: "GET /api/attendance/condonation/pending", tone: "text-ledger-accent" },
    { label: "Exam Hall Readiness", value: "Build in Module 3", tone: "text-ledger-muted" },
    { label: "Placement Success Rate", value: "Build in Module 4", tone: "text-ledger-muted" },
    { label: "Faculty Workload Balance", value: "Build in Module 5", tone: "text-ledger-muted" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-ledger-panel border border-ledger-line rounded p-5">
          <p className="eyebrow">{c.label}</p>
          <p className={`font-mono text-lg mt-2 ${c.tone}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function RoleSummary({ role }) {
  return (
    <p className="text-ledger-muted text-sm">
      Signed in as <span className="text-ledger-accent font-mono">{role}</span>. Use the sidebar to
      reach your available modules.
    </p>
  );
}
