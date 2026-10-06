const API_URL = import.meta.env.VITE_API_URL;

export async function getOverview() {
  const response = await fetch(`${API_URL}/api/overview`);

  if (!response.ok) {
    throw new Error("Failed to fetch overview");
  }

  return response.json();
}
