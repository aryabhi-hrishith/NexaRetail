/**
 * NexaRetail API Client
 * ----------------------
 * Thin fetch wrapper for the Flask backend.
 * In development, Vite proxies /api/* to http://localhost:5000.
 * In production, set VITE_API_BASE_URL to the deployed backend origin.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function fetchJSON(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} -- ${url}`);
  }
  return res.json();
}
export async function uploadDataFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/api/data/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload file");
  }

  return data;
}
// export async function uploadDataFile(file) {
//   const formData = new FormData();
//   formData.append("file", file);

//   const response = await fetch(`${API_BASE_URL}/api/data/upload`, {
//     method: "POST",
//     body: formData,
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.message || "Failed to upload file");
//   }

//   return data;
// }

export const api = {
  getOverview: () => fetchJSON('/api/overview'),
  getProducts: () => fetchJSON('/api/products'),
  getForecast: () => fetchJSON('/api/forecast'),
  getCustomerSegments: () => fetchJSON('/api/customers/segments'),
  getCustomerPreferences: () => fetchJSON('/api/customers/preferences'),
  getPromotions: (segment = null) =>
    fetchJSON(
      segment !== null ? `/api/promotions?segment=${segment}` : '/api/promotions'
    ),
  getSalesDaily: () => fetchJSON('/api/sales/daily'),
  healthCheck: () => fetchJSON('/health'),
};