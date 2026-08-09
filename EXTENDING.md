# Extending Campus Ledger — Adding the Remaining 4 Modules

The Attendance and Library modules are fully built and follow one consistent
pattern:

```
model(s) → controller → routes → wire into server.js → frontend page
```

Copy this pattern exactly for each remaining module. Below is the concrete
plan — model fields, key endpoints, and the one "unique logic" piece — for
each.

---

## 3. Exam Hall Maintenance

**Models:** `backend/models/ExamHall.js`, `ExamSeatingAllocation.js`

```js
// ExamHall.js
{ name, block, capacity, rows, columns }

// ExamSeatingAllocation.js
{ examId, hallId, studentId, seatNumber, invigilatorId }
```

**Unique logic — seating algorithm (put in `examController.js`):**
Sort registered students by `{ class, rollNumber }`, then place them into
seats such that no two adjacent seats (same row, or same column across
front/back) hold students from the same class. A simple round-robin
interleave across classes into the seat grid achieves this — write it as a
pure function so you can unit test it and show it off in your report.

**Key endpoints:**
- `POST /api/examhall/generate-seating` (body: `{ examId, hallIds[] }`) — runs the algorithm, admin only
- `GET /api/examhall/:examId/seating/:studentId` — student checks their seat
- `POST /api/examhall/:examId/mark-hall-attendance` — invigilator marks presence

---

## 4. Placement Maintenance

**Models:** `PlacementDrive.js`, `Application.js`

```js
// PlacementDrive.js
{ companyName, role, package, eligibility: { minCgpa, minAttendance, branches[] }, driveDate }

// Application.js
{ driveId, studentId, status: "applied"|"shortlisted"|"selected"|"rejected", resumeUrl }
```

**Unique logic — combined eligibility filter:** when a student applies,
check their CGPA (from `User.cgpa`) **and** call your existing attendance
summary logic (reuse `getStudentSummary` internally) to confirm they meet
`minAttendance` across all subjects — this is the "real system integration"
that sets your project apart from isolated-module clones.

**Key endpoints:**
- `GET /api/placement/drives` — list with eligibility badge per student
- `POST /api/placement/drives/:id/apply`
- `GET /api/placement/analytics` — branch-wise placement %, aggregate with MongoDB `$group` (same pattern as `getStudentSummary`)

---

## 5. Faculty Attendance & Workload

**Models:** `FacultyAttendance.js`, `LeaveRequest.js`

```js
// FacultyAttendance.js
{ facultyId, date, checkInTime, checkOutTime }

// LeaveRequest.js
{ facultyId, fromDate, toDate, reason, status: "pending"|"approved"|"rejected" }
```

**Unique logic — workload variance:** compare `Subject.totalClassesPlanned`
against actual classes conducted (count of distinct `date` values in
`Attendance` where `markedBy = facultyId` and `subjectId` matches) to
surface faculty who are behind schedule.

**Key endpoints:**
- `POST /api/faculty/checkin`, `POST /api/faculty/checkout`
- `POST /api/faculty/leave-request`, `PUT /api/faculty/leave-request/:id/review`
- `GET /api/faculty/:id/workload`

---

## 6. Timetable Maintenance

**Model:** `TimetableSlot.js`

```js
{ department, year, dayOfWeek, periodNumber, subjectId, facultyId, room }
```

**Unique logic — conflict detection (this is your "smart system" claim):**
before saving a new slot, query for any existing slot with the same
`dayOfWeek` + `periodNumber` where **either** `facultyId` or `room` already
matches. Reject the save with a clear message naming the conflicting slot.
This same collection should also **gate attendance marking** — in
`attendanceController.markAttendance`, optionally verify a `TimetableSlot`
exists for that subject/day/period before accepting the records, so the
whole system stays internally consistent (a nice point to raise in your
viva about module integration).

**Key endpoints:**
- `POST /api/timetable/slot` (runs conflict check)
- `GET /api/timetable/:department/:year`
- `GET /api/timetable/faculty/:facultyId`

---

## Frontend pattern for each new module

For each module, add one file under `src/pages/`, following
`LibraryPage.jsx` as the template: fetch on mount with `client.get(...)`,
render a list/table, add a form for the create/update action. Then:

1. Add the route in `src/App.jsx`
2. Add the nav entry (with correct `roles[]`) in `src/components/Layout.jsx`

## Real-time additions (Socket.io)

`server.js` already creates the `io` instance and exposes it via
`req.app.get("io")`. In any controller, after a state change worth
broadcasting (e.g., exam hall seating published, leave approved), call:

```js
const io = req.app.get("io");
io.emit("event:name", { ...payload });
```

On the frontend, connect once in `Layout.jsx` or a dedicated hook using
`socket.io-client`, and listen for the events you need per page.
