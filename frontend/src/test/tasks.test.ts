import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTasks } from "../hooks/useTasks";
import { taskApi } from "../hooks/taskApi";
import type { Task } from "../types/task";

// Mock the API module
vi.mock("../hooks/taskApi");

const mockTask: Task = {
  id: 1,
  title: "Review case files",
  description: "Check documents before hearing",
  status: "todo",
  due_date: "2030-12-31T10:00:00Z",
  created_at: "2024-01-01T09:00:00Z",
  updated_at: null,
};

const mockTask2: Task = {
  id: 2,
  title: "File submissions",
  description: null,
  status: "in_progress",
  due_date: "2030-11-15T12:00:00Z",
  created_at: "2024-01-02T09:00:00Z",
  updated_at: null,
};

describe("useTasks hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches tasks on mount", async () => {
    vi.mocked(taskApi.getAll).mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe("Review case files");
  });

  it("handles fetch error gracefully", async () => {
    vi.mocked(taskApi.getAll).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTasks());
    await act(async () => {});

    expect(result.current.error).toBe("Network error");
    expect(result.current.tasks).toHaveLength(0);
  });

  it("creates a task and prepends it to the list", async () => {
    vi.mocked(taskApi.getAll).mockResolvedValue([mockTask]);
    vi.mocked(taskApi.create).mockResolvedValue(mockTask2);

    const { result } = renderHook(() => useTasks());
    await act(async () => {});

    await act(async () => {
      await result.current.createTask({
        title: "File submissions",
        status: "in_progress",
        due_date: "2030-11-15T12:00:00Z",
      });
    });

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks[0].id).toBe(2); // prepended
  });

  it("updates status of a task in the list", async () => {
    vi.mocked(taskApi.getAll).mockResolvedValue([mockTask]);
    vi.mocked(taskApi.updateStatus).mockResolvedValue({
      ...mockTask,
      status: "in_progress",
    });

    const { result } = renderHook(() => useTasks());
    await act(async () => {});

    await act(async () => {
      await result.current.updateStatus(1, "in_progress");
    });

    expect(result.current.tasks[0].status).toBe("in_progress");
  });

  it("deletes a task and removes it from the list", async () => {
    vi.mocked(taskApi.getAll).mockResolvedValue([mockTask, mockTask2]);
    vi.mocked(taskApi.delete).mockResolvedValue();

    const { result } = renderHook(() => useTasks());
    await act(async () => {});

    expect(result.current.tasks).toHaveLength(2);

    await act(async () => {
      await result.current.deleteTask(1);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe(2);
  });

  it("fetches multiple tasks correctly", async () => {
    vi.mocked(taskApi.getAll).mockResolvedValue([mockTask, mockTask2]);

    const { result } = renderHook(() => useTasks());
    await act(async () => {});

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks.map((t) => t.id)).toEqual([1, 2]);
  });
});

describe("taskApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getAll calls the correct endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([mockTask]), { status: 200 })
    );

    const { taskApi: realApi } = await vi.importActual<typeof import("../hooks/taskApi")>(
      "../hooks/taskApi"
    );
    await realApi.getAll();

    expect(fetchSpy).toHaveBeenCalledWith("/api/v1/tasks/");
  });

  it("create sends POST with JSON body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockTask), { status: 201 })
    );

    const { taskApi: realApi } = await vi.importActual<typeof import("../hooks/taskApi")>(
      "../hooks/taskApi"
    );
    await realApi.create({
      title: "Review case files",
      status: "todo",
      due_date: "2030-12-31T10:00:00Z",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/tasks/",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("delete sends DELETE request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 })
    );

    const { taskApi: realApi } = await vi.importActual<typeof import("../hooks/taskApi")>(
      "../hooks/taskApi"
    );
    await realApi.delete(1);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/tasks/1",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("throws on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "Not found" }), { status: 404 })
    );

    const { taskApi: realApi } = await vi.importActual<typeof import("../hooks/taskApi")>(
      "../hooks/taskApi"
    );
    await expect(realApi.getById(999)).rejects.toThrow("Not found");
  });
});
