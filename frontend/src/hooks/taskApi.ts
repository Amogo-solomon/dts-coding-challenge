import type { Task, CreateTaskPayload, UpdateStatusPayload } from "../types/task";

const BASE_URL = "/api/v1/tasks";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const taskApi = {
  getAll: (): Promise<Task[]> =>
    fetch(BASE_URL + "/").then((r) => handleResponse<Task[]>(r)),

  getById: (id: number): Promise<Task> =>
    fetch(`${BASE_URL}/${id}`).then((r) => handleResponse<Task>(r)),

  create: (payload: CreateTaskPayload): Promise<Task> =>
    fetch(BASE_URL + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handleResponse<Task>(r)),

  updateStatus: (id: number, payload: UpdateStatusPayload): Promise<Task> =>
    fetch(`${BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handleResponse<Task>(r)),

  delete: (id: number): Promise<void> =>
    fetch(`${BASE_URL}/${id}`, { method: "DELETE" }).then((r) =>
      handleResponse<void>(r)
    ),
};
