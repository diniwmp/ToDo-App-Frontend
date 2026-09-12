import { getUserEmail } from "../util/AsyncStorage";

// Replace with your local backend base URL or environment variable before running locally
const BASE_URL = "https://YOUR_LOCAL_IP:8080/todos-app-back-end";

export const signUpUser = async (name: string, email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || "Sign up failed" };
    }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || "Sign in failed" };
    }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
};

export const fetchUserTodos = async () => {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return { success: false, error: "User session expired. Please sign in again." };
    }

    const response = await fetch(`${BASE_URL}/api/todos?email=${userEmail}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (response.ok) {
      const rawTodos = data.todos || data;
      const mappedTodos = rawTodos.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        completed: t.isCompleted,
        createdAt: t.createdAt,
      }));
      return { success: true, todos: mappedTodos };
    } else {
      return { success: false, error: data.message || "Failed to fetch todos" };
    }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
};

export const addTodo = async (title: string) => {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return { success: false, error: "User session expired. Please sign in again." };
    }

    const response = await fetch(`${BASE_URL}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, userEmail }),
    });
    const data = await response.json();

    if (response.ok) {
      return { success: true, todo: data.todo || data };
    } else {
      return { success: false, error: data.message || "Failed to add todo" };
    }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
};

export const updateTodoStatus = async (todoId: string, isCompleted: boolean) => {
  try {
    const response = await fetch(`${BASE_URL}/api/todos?id=${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted }),
    });
    const data = await response.json();
    if (response.ok) return { success: true, todo: data };
    return { success: false, error: data.message || "Failed to update todo" };
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
};

export const updateTodoTitle = async (todoId: string, title: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/todos?id=${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await response.json();
    if (response.ok) return { success: true, todo: data };
    return { success: false, error: data.message || "Failed to update todo" };
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
};

export const deleteTodo = async (todoId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/todos?id=${todoId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      if (response.status === 204) {
        return { success: true, data: null };
      }
      const data = await response.json();
      return { success: true, data };
    } else {
      let errorMessage = "Failed to delete todo";
      try {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch (e) {}
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
};