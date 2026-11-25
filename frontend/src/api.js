const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// One helper keeps all API requests consistent and shows useful server errors.
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("healthcareToken");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Something went wrong.");
  return result;
}
