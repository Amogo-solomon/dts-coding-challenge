import { useState, useEffect, useCallback } from "react";
import { taskApi } from "./taskApi";
import type { Task, CreateTaskPayload, TaskStatus } from "../types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
    const task = await taskApi.create(payload);
    setTasks((prev) => [task, ...prev]);
    return task;
  };

  const updateStatus = async (id: number, status: TaskStatus): Promise<void> => {
    const updated = await taskApi.updateStatus(id, { status });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTask = async (id: number): Promise<void> => {
    await taskApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, error, fetchTasks, createTask, updateStatus, deleteTask };
}
