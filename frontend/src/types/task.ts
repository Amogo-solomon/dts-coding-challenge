export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  due_date: string;
}

export interface UpdateStatusPayload {
  status: TaskStatus;
}
