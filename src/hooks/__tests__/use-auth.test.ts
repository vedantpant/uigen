import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../use-auth";

// --- mocks ---

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

const mockSignInAction = vi.mocked(signInAction);
const mockSignUpAction = vi.mocked(signUpAction);
const mockGetAnonWorkData = vi.mocked(getAnonWorkData);
const mockClearAnonWork = vi.mocked(clearAnonWork);
const mockGetProjects = vi.mocked(getProjects);
const mockCreateProject = vi.mocked(createProject);

// --- helpers ---

function renderAuth() {
  return renderHook(() => useAuth());
}

// --- setup ---

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAnonWorkData.mockReturnValue(null);
  mockGetProjects.mockResolvedValue([]);
  mockCreateProject.mockResolvedValue({ id: "new-project-id" } as any);
});

// ─────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────

describe("initial state", () => {
  test("isLoading starts as false", () => {
    const { result } = renderAuth();
    expect(result.current.isLoading).toBe(false);
  });

  test("exposes signIn, signUp, and isLoading", () => {
    const { result } = renderAuth();
    expect(typeof result.current.signIn).toBe("function");
    expect(typeof result.current.signUp).toBe("function");
    expect(typeof result.current.isLoading).toBe("boolean");
  });
});

// ─────────────────────────────────────────────
// signIn — happy paths
// ─────────────────────────────────────────────

describe("signIn", () => {
  test("sets isLoading to true while in flight", async () => {
    let resolveSignIn!: (v: any) => void;
    mockSignInAction.mockReturnValue(new Promise((r) => (resolveSignIn = r)));

    const { result } = renderAuth();

    act(() => {
      result.current.signIn("user@example.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignIn({ success: false });
    });
  });

  test("resets isLoading to false after success", async () => {
    mockSignInAction.mockResolvedValue({ success: true });
    mockGetAnonWorkData.mockReturnValue(null);
    mockGetProjects.mockResolvedValue([{ id: "p1" }] as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets isLoading to false after failure", async () => {
    mockSignInAction.mockResolvedValue({ success: false });

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "bad-password");
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets isLoading to false when action throws", async () => {
    mockSignInAction.mockRejectedValue(new Error("network error"));

    const { result } = renderAuth();
    await act(async () => {
      try {
        await result.current.signIn("user@example.com", "password");
      } catch {
        // expected
      }
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("returns the result from the action", async () => {
    const actionResult = { success: false, error: "Invalid credentials" };
    mockSignInAction.mockResolvedValue(actionResult);

    const { result } = renderAuth();
    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signIn("user@example.com", "wrong");
    });

    expect(returnValue).toEqual(actionResult);
  });

  test("calls signInAction with provided email and password", async () => {
    mockSignInAction.mockResolvedValue({ success: false });

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("test@example.com", "s3cr3t");
    });

    expect(mockSignInAction).toHaveBeenCalledWith("test@example.com", "s3cr3t");
  });

  test("does not call handlePostSignIn when sign-in fails", async () => {
    mockSignInAction.mockResolvedValue({ success: false });

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "wrong");
    });

    expect(mockGetAnonWorkData).not.toHaveBeenCalled();
    expect(mockGetProjects).not.toHaveBeenCalled();
    expect(mockCreateProject).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// signUp — happy paths
// ─────────────────────────────────────────────

describe("signUp", () => {
  test("sets isLoading to true while in flight", async () => {
    let resolveSignUp!: (v: any) => void;
    mockSignUpAction.mockReturnValue(new Promise((r) => (resolveSignUp = r)));

    const { result } = renderAuth();

    act(() => {
      result.current.signUp("new@example.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignUp({ success: false });
    });
  });

  test("resets isLoading to false after completion", async () => {
    mockSignUpAction.mockResolvedValue({ success: false });

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signUp("new@example.com", "password");
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets isLoading to false when action throws", async () => {
    mockSignUpAction.mockRejectedValue(new Error("server error"));

    const { result } = renderAuth();
    await act(async () => {
      try {
        await result.current.signUp("new@example.com", "password");
      } catch {
        // expected
      }
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("returns the result from the action", async () => {
    const actionResult = { success: true };
    mockSignUpAction.mockResolvedValue(actionResult);
    mockGetProjects.mockResolvedValue([{ id: "p1" }] as any);

    const { result } = renderAuth();
    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signUp("new@example.com", "password");
    });

    expect(returnValue).toEqual(actionResult);
  });

  test("calls signUpAction with provided email and password", async () => {
    mockSignUpAction.mockResolvedValue({ success: false });

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signUp("new@example.com", "mypassword");
    });

    expect(mockSignUpAction).toHaveBeenCalledWith("new@example.com", "mypassword");
  });

  test("does not call handlePostSignIn when sign-up fails", async () => {
    mockSignUpAction.mockResolvedValue({ success: false });

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signUp("new@example.com", "password");
    });

    expect(mockGetAnonWorkData).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// handlePostSignIn — anonymous work present
// ─────────────────────────────────────────────

describe("handlePostSignIn — with anonymous work", () => {
  beforeEach(() => {
    mockSignInAction.mockResolvedValue({ success: true });
  });

  test("creates a project with the anon messages and data, then redirects", async () => {
    const anonWork = {
      messages: [{ role: "user", content: "make a button" }],
      fileSystemData: { "/": {}, "/Button.tsx": "export default () => <button/>" },
    };
    mockGetAnonWorkData.mockReturnValue(anonWork);
    mockCreateProject.mockResolvedValue({ id: "anon-project-id" } as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: anonWork.messages,
        data: anonWork.fileSystemData,
      })
    );
    expect(mockPush).toHaveBeenCalledWith("/anon-project-id");
  });

  test("clears anonymous work after creating the project", async () => {
    mockGetAnonWorkData.mockReturnValue({
      messages: [{ role: "user", content: "hi" }],
      fileSystemData: {},
    });
    mockCreateProject.mockResolvedValue({ id: "x" } as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockClearAnonWork).toHaveBeenCalled();
  });

  test("does not call getProjects when anon work exists", async () => {
    mockGetAnonWorkData.mockReturnValue({
      messages: [{ role: "user", content: "hi" }],
      fileSystemData: {},
    });
    mockCreateProject.mockResolvedValue({ id: "x" } as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockGetProjects).not.toHaveBeenCalled();
  });

  test("falls through to getProjects when anon work has no messages", async () => {
    mockGetAnonWorkData.mockReturnValue({ messages: [], fileSystemData: {} });
    mockGetProjects.mockResolvedValue([{ id: "existing-project" }] as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockGetProjects).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/existing-project");
  });

  test("project name includes a time string", async () => {
    mockGetAnonWorkData.mockReturnValue({
      messages: [{ role: "user", content: "hi" }],
      fileSystemData: {},
    });
    mockCreateProject.mockResolvedValue({ id: "x" } as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    const callArg = mockCreateProject.mock.calls[0][0];
    expect(callArg.name).toMatch(/^Design from /);
  });
});

// ─────────────────────────────────────────────
// handlePostSignIn — no anonymous work, has existing projects
// ─────────────────────────────────────────────

describe("handlePostSignIn — no anon work, existing projects", () => {
  beforeEach(() => {
    mockSignInAction.mockResolvedValue({ success: true });
    mockGetAnonWorkData.mockReturnValue(null);
  });

  test("redirects to the most recent (first) project", async () => {
    mockGetProjects.mockResolvedValue([
      { id: "recent-project" },
      { id: "older-project" },
    ] as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/recent-project");
  });

  test("does not create a new project when existing projects are found", async () => {
    mockGetProjects.mockResolvedValue([{ id: "p1" }] as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockCreateProject).not.toHaveBeenCalled();
  });

  test("works the same way via signUp", async () => {
    mockSignUpAction.mockResolvedValue({ success: true });
    mockGetProjects.mockResolvedValue([{ id: "p2" }] as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signUp("user@example.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/p2");
  });
});

// ─────────────────────────────────────────────
// handlePostSignIn — no anonymous work, no existing projects
// ─────────────────────────────────────────────

describe("handlePostSignIn — no anon work, no projects", () => {
  beforeEach(() => {
    mockSignInAction.mockResolvedValue({ success: true });
    mockGetAnonWorkData.mockReturnValue(null);
    mockGetProjects.mockResolvedValue([]);
  });

  test("creates a new project and redirects to it", async () => {
    mockCreateProject.mockResolvedValue({ id: "brand-new" } as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({ messages: [], data: {} })
    );
    expect(mockPush).toHaveBeenCalledWith("/brand-new");
  });

  test("new project name matches the 'New Design #...' pattern", async () => {
    mockCreateProject.mockResolvedValue({ id: "x" } as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    const callArg = mockCreateProject.mock.calls[0][0];
    expect(callArg.name).toMatch(/^New Design #\d+$/);
  });

  test("works the same way via signUp", async () => {
    mockSignUpAction.mockResolvedValue({ success: true });
    mockCreateProject.mockResolvedValue({ id: "fresh" } as any);

    const { result } = renderAuth();
    await act(async () => {
      await result.current.signUp("new@example.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/fresh");
  });
});
