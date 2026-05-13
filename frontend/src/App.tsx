import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useTasks } from "./hooks/useTasks";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import type { CreateTaskPayload, TaskStatus } from "./types/task";
import "./App.css";

export default function App() {
  const { tasks, loading, error, createTask, updateStatus, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");

  const handleCreate = async (payload: CreateTaskPayload) => {
    try {
      await createTask(payload);
      setShowForm(false);
      toast.success("Task created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create task");
    }
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    try {
      await updateStatus(id, status);
      toast.success("Status updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update task");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      toast.success("Task deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete task");
    }
  };

  const filtered =
    filterStatus === "all" ? tasks : tasks.filter((t) => t.status === filterStatus);

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="app">
        <header className="app-header">
          <div className="header-inner">
            <div className="header-brand">
              <div className="govuk-logo">
                <span className="crown">♛</span>
                <span>HMCTS</span>
              </div>
              <h1>Case Task Manager</h1>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "✕ Cancel" : "+ New Task"}
            </button>
          </div>
        </header>

        <main className="app-main">
          {showForm && (
            <section className="form-panel">
              <h2>Create New Task</h2>
              <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            </section>
          )}

          <div className="filter-bar">
            {(["all", "todo", "in_progress", "done"] as const).map((s) => (
              <button
                key={s}
                className={`filter-btn${filterStatus === s ? " active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s === "todo" ? "To Do" : "Done"}
                <span className="filter-count">{counts[s]}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state" aria-live="polite">Loading tasks…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found.</p>
              {filterStatus === "all" && (
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  Create your first task
                </button>
              )}
            </div>
          ) : (
            <div className="task-grid">
              {filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
