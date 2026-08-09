import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

export default function AttendancePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "student") {
      setLoading(false);
      return;
    }
    client
      .get(`/attendance/student/${user._id}/summary`)
      .then((res) => setSummary(res.data))
      .catch(() => setError("Could not load attendance records."))
      .finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== "student") {
    return (
      <div>
        <PageHeader />
        <p className="text-ledger-muted mt-6">
          Faculty attendance-marking UI goes here — build a class roster table that posts to{" "}
          <code className="font-mono text-ledger-accent">POST /api/attendance/mark</code> with a list of
          present/absent records for the selected subject and date.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader />
      {loading && <p className="text-ledger-muted mt-6">Loading records…</p>}
      {error && <p className="text-ledger-danger mt-6">{error}</p>}

      <div className="mt-8 space-y-4">
        {summary.map((s) => (
          <SubjectCard key={s.subjectCode} subject={s} />
        ))}
        {!loading && summary.length === 0 && (
          <p className="text-ledger-muted">No attendance records yet.</p>
        )}
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <p className="eyebrow">Module 01</p>
      <h1 className="font-display text-3xl text-ledger-text mt-1">Attendance & Exam Eligibility</h1>
      <p className="text-ledger-muted mt-2 text-sm">
        A minimum of 75% attendance per subject is required to sit for the semester exam.
      </p>
      <div className="ledger-rule mt-6" />
    </div>
  );
}

function SubjectCard({ subject }) {
  const isEligible = subject.isEligible;
  return (
    <div className="bg-ledger-panel border border-ledger-line rounded p-6 flex items-center justify-between">
      <div>
        <p className="eyebrow">{subject.subjectCode}</p>
        <h3 className="font-display text-lg mt-1">{subject.subjectName}</h3>
        <p className="text-sm text-ledger-muted mt-1">
          {subject.present} / {subject.total} classes attended
        </p>
      </div>
      <div className="text-right">
        <p
          className={`font-mono text-2xl ${
            isEligible ? "text-ledger-accent2" : "text-ledger-danger"
          }`}
        >
          {subject.percentage}%
        </p>
        <span
          className={`text-xs font-mono uppercase tracking-wide px-2 py-0.5 rounded mt-1 inline-block ${
            isEligible
              ? "bg-ledger-accent2/15 text-ledger-accent2"
              : "bg-ledger-danger/15 text-ledger-danger"
          }`}
        >
          {isEligible ? "Eligible for exam" : "Below threshold"}
        </span>
      </div>
    </div>
  );
}
