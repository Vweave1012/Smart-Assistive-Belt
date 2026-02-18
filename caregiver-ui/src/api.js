const BACKEND_URL = "http://127.0.0.1:5000/api";

// ---------- REGISTER ----------
export async function registerUser(data) {
  const res = await fetch(`${BACKEND_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Registration failed");
  }

  return res.json();
}

// ---------- LOGIN ----------
export async function loginUser(data) {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // ❗ If user not found → backend sends 401
    if (res.status === 401) {
      throw new Error("You don't have an account. Please sign up first.");
    }

    // ❗ Any other failure
    if (!res.ok) {
      throw new Error("Server error. Try again.");
    }

    return await res.json();
  } catch (err) {
    // ❗ Only real network failure shows this
    if (err.message === "Failed to fetch") {
      throw new Error("Server not reachable");
    }

    throw err;
  }
}

