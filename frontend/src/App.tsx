import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useTasks } from "./hooks/useTasks";
import type { CreateTaskPayload, TaskStatus, Task } from "./types/task";
import "./App.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = {
  logo: () => <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2zm7 0h5v5H9zm-7 7h5v5H2zm7 0h5v5H9z"/></svg>,
  tasks: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg>,
  dash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  docs: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>,
  clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  inbox: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  all: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}
function isOverdue(due: string, status: TaskStatus) {
  return status !== "done" && new Date(due) < new Date();
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_NEXT: Partial<Record<TaskStatus, TaskStatus>> = {
  todo: "in_progress",
  in_progress: "done",
};

// ── Task Form ────────────────────────────────────────────────────────────────
function TaskForm({ onSubmit, onCancel }: { onSubmit: (p: CreateTaskPayload) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle]       = useState("");
  const [desc, setDesc]         = useState("");
  const [status, setStatus]     = useState<TaskStatus>("todo");
  const [due, setDue]           = useState("");
  const [busy, setBusy]         = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())             e.title = "Title is required";
    if (title.trim().length > 200) e.title = "Max 200 characters";
    if (!due)                      e.due   = "Due date is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    try {
      await onSubmit({ title: title.trim(), description: desc.trim() || undefined, status, due_date: new Date(due).toISOString() });
    } finally { setBusy(false); }
  };

  return (
    <div className="create-panel">
      <div className="create-panel-header">
        <span className="create-panel-title">New Task</span>
        <button className="btn btn-ghost" style={{padding:"5px 8px"}} onClick={onCancel}><Icon.x /></button>
      </div>
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="f-title">Title</label>
          <input id="f-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Review case bundle for hearing" maxLength={200} />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>
        <div className="field">
          <label htmlFor="f-desc">Description <span style={{color:"var(--text-3)",fontWeight:400}}>(optional)</span></label>
          <textarea id="f-desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Additional context or notes…" rows={2} />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-status">Status</label>
            <select id="f-status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-due">Due Date &amp; Time</label>
            <input id="f-due" type="datetime-local" value={due} onChange={e => setDue(e.target.value)} />
            {errors.due && <span className="field-error">{errors.due}</span>}
          </div>
        </div>
        <div className="form-footer">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Creating…" : <><Icon.plus /> Create Task</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, onStatus, onDelete }: { task: Task; onStatus: (id: number, s: TaskStatus) => Promise<void>; onDelete: (id: number) => Promise<void> }) {
  const overdue  = isOverdue(task.due_date, task.status);
  const next     = STATUS_NEXT[task.status];
  const { date, time } = fmtDate(task.due_date);

  const badgeClass = task.status === "done" ? "badge-done" : task.status === "in_progress" ? "badge-progress" : "badge-todo";

  return (
    <tr>
      <td>
        <div className="task-title-cell">
          <span className="task-title-text">{task.title}</span>
          {task.description && <span className="task-desc-text">{task.description}</span>}
        </div>
      </td>
      <td>
        <span className={`badge ${badgeClass}`}>
          <span className="badge-dot" />
          {STATUS_LABELS[task.status]}
        </span>
      </td>
      <td>
        <div className={`due-cell${overdue ? " overdue" : ""}`}>
          <span className="due-date">{date}</span>
          <span className="due-time">{time}{overdue && <> &middot; <span className="overdue-tag">Overdue</span></>}</span>
        </div>
      </td>
      <td>
        <div className="row-actions">
          {next && (
            <button className="action-btn advance" onClick={() => onStatus(task.id, next)}>
              → {STATUS_LABELS[next]}
            </button>
          )}
          <button className="action-btn delete" onClick={async () => {
            if (window.confirm(`Delete "${task.title}"?`)) await onDelete(task.id);
          }}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { tasks, loading, error, createTask, updateStatus, deleteTask } = useTasks();
  const [showForm, setShowForm]     = useState(false);
  const [filter, setFilter]         = useState<TaskStatus | "all">("all");

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const counts = {
    all:         tasks.length,
    todo:        tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    done:        tasks.filter(t => t.status === "done").length,
    overdue:     tasks.filter(t => isOverdue(t.due_date, t.status)).length,
  };

  const handleCreate = async (payload: CreateTaskPayload) => {
    try   { await createTask(payload); setShowForm(false); toast.success("Task created"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to create task"); }
  };

  const handleStatus = async (id: number, status: TaskStatus) => {
    try   { await updateStatus(id, status); toast.success("Status updated"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to update"); }
  };

  const handleDelete = async (id: number) => {
    try   { await deleteTask(id); toast.success("Task deleted"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to delete"); }
  };

  const today = new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background:"var(--navy-3)", color:"var(--text-1)", border:"1px solid var(--border-2)", fontFamily:"var(--font)", fontSize:"13.5px", borderRadius:"var(--radius)" }}} />

      <div className="app">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">H</div>
            <div className="brand-text">
              <span className="brand-name">HMCTS</span>
              <span className="brand-sub">Case Manager</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <span className="nav-section-label">Workspace</span>
            <button className="nav-item">
              <Icon.dash /> Overview
            </button>
            <button className="nav-item active">
              <Icon.tasks />
              My Tasks
              <span className="nav-count">{counts.all}</span>
            </button>
            <button className="nav-item">
              <Icon.docs /> Documents
            </button>

            <span className="nav-section-label">Filters</span>
            <button className="nav-item" onClick={() => setFilter("todo")}>
              <Icon.inbox />
              To Do
              <span className="nav-count">{counts.todo}</span>
            </button>
            <button className="nav-item" onClick={() => setFilter("in_progress")}>
              <Icon.clock />
              In Progress
              <span className="nav-count">{counts.in_progress}</span>
            </button>
            <button className="nav-item" onClick={() => setFilter("done")}>
              <Icon.check />
              Completed
              <span className="nav-count">{counts.done}</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="user-avatar">CW</div>
              <div className="user-info">
                <div className="user-name">Caseworker</div>
                <div className="user-role">HMCTS Staff</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Top bar ── */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="page-title">Task Management</span>
            <span className="page-subtitle">{today}</span>
          </div>
          <div className="topbar-right">
            {counts.overdue > 0 && (
              <span style={{ fontSize:"12px", color:"var(--red)", display:"flex", alignItems:"center", gap:5, background:"var(--red-bg)", padding:"5px 10px", borderRadius:"var(--radius-sm)" }}>
                <Icon.alert /> {counts.overdue} overdue
              </span>
            )}
            <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? <><Icon.x /> Cancel</> : <><Icon.plus /> New Task</>}
            </button>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="main">

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Tasks</span>
                <div className="stat-icon blue"><Icon.all /></div>
              </div>
              <div className="stat-value">{String(counts.all).padStart(2,"0")}</div>
              <div className="stat-change">All active tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">To Do</span>
                <div className="stat-icon amber"><Icon.inbox /></div>
              </div>
              <div className="stat-value">{String(counts.todo).padStart(2,"0")}</div>
              <div className="stat-change">Awaiting action</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">In Progress</span>
                <div className="stat-icon blue"><Icon.clock /></div>
              </div>
              <div className="stat-value">{String(counts.in_progress).padStart(2,"0")}</div>
              <div className="stat-change">Currently active</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Completed</span>
                <div className="stat-icon green"><Icon.check /></div>
              </div>
              <div className="stat-value">{String(counts.done).padStart(2,"0")}</div>
              <div className="stat-change">Closed out</div>
            </div>
          </div>

          {/* Create form */}
          {showForm && <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

          {/* Error */}
          {error && <div className="error-banner"><Icon.alert /> {error}</div>}

          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="filter-pills">
                {(["all","todo","in_progress","done"] as const).map(s => (
                  <button key={s} className={`pill${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
                    <span className="pill-dot" style={{ background: s === "done" ? "var(--green)" : s === "in_progress" ? "var(--amber)" : s === "todo" ? "var(--muted)" : "var(--text-3)" }} />
                    {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s === "todo" ? "To Do" : "Done"}
                    <span style={{ fontFamily:"var(--mono)", fontSize:"11px", color:"var(--text-3)", marginLeft:2 }}>
                      {counts[s]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="task-table-wrap">
            {loading ? (
              <div className="loading-msg">Loading tasks…</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Icon.tasks /></div>
                <div className="empty-title">No tasks found</div>
                <div className="empty-sub">
                  {filter === "all" ? "Create your first task to get started." : `No tasks with status "${STATUS_LABELS[filter as TaskStatus]}".`}
                </div>
                {filter === "all" && <button className="btn btn-primary" onClick={() => setShowForm(true)}><Icon.plus /> Create Task</button>}
              </div>
            ) : (
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(task => (
                    <TaskRow key={task.id} task={task} onStatus={handleStatus} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
