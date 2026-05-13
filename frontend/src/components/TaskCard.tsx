import type { Task, TaskStatus } from "../types/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_NEXT: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

interface Props {
  task: Task;
  onStatusChange: (id: number, status: TaskStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(due: string, status: TaskStatus) {
  return status !== "done" && new Date(due) < new Date();
}

export function TaskCard({ task, onStatusChange, onDelete }: Props) {
  const nextStatus = STATUS_NEXT[task.status];
  const overdue = isOverdue(task.due_date, task.status);

  const handleAdvance = async () => {
    if (nextStatus) await onStatusChange(task.id, nextStatus);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      await onDelete(task.id);
    }
  };

  return (
    <article className={`task-card status-${task.status}${overdue ? " overdue" : ""}`}>
      <header className="task-card-header">
        <span className={`status-badge status-${task.status}`}>
          {STATUS_LABELS[task.status]}
        </span>
        {overdue && <span className="overdue-badge">Overdue</span>}
      </header>

      <h3 className="task-title">{task.title}</h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span>
          <strong>Due:</strong> {formatDate(task.due_date)}
        </span>
        {task.created_at && (
          <span>
            <strong>Created:</strong> {formatDate(task.created_at)}
          </span>
        )}
      </div>

      <footer className="task-card-actions">
        {nextStatus && (
          <button
            className="btn-advance"
            onClick={handleAdvance}
            aria-label={`Mark as ${STATUS_LABELS[nextStatus]}`}
          >
            → {STATUS_LABELS[nextStatus]}
          </button>
        )}
        <button
          className="btn-delete"
          onClick={handleDelete}
          aria-label="Delete task"
        >
          Delete
        </button>
      </footer>
    </article>
  );
}
