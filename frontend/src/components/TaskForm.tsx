import { useState } from "react";
import type { CreateTaskPayload, TaskStatus } from "../types/task";

interface Props {
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (title.trim().length > 200) e.title = "Title must be 200 characters or fewer";
    if (!dueDate) e.dueDate = "Due date is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        due_date: new Date(dueDate).toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form" noValidate>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Review hearing documents"
          maxLength={200}
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional additional details"
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date *</label>
          <input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create Task"}
        </button>
      </div>
    </form>
  );
}
