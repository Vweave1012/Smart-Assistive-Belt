const BASE_URL = "http://127.0.0.1:5000";

// ---------- REGISTER ----------
export async function registerUser(name, email, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

// ---------- LOGIN ----------
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

// ---------- GET STATE ----------
export async function getState() {
  const res = await fetch(`${BASE_URL}/api/state`);
  return await res.json();
}

// ---------- UPDATE EVENT ----------
export async function updateEvent(final_state) {
  const res = await fetch(`${BASE_URL}/api/update_event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ final_state })
  });

  return await res.json();
}

// ---------- PREDICT ----------
export async function predictState(payload) {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return await res.json();
}
