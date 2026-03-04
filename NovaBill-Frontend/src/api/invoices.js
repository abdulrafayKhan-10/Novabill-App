import { API_BASE_URL } from "./config";

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  // Return null for 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchInvoices({ invoiceItems = true }) {
  const res = await fetch(
    `${API_BASE_URL}/invoice?invoiceItems=${invoiceItems}`
  );
  return handleResponse(res);
}

export async function fetchInvoice(id) {
  const res = await fetch(`${API_BASE_URL}/invoice/${id}?invoiceItems=true`);
  return handleResponse(res);
}

export async function createInvoice(data) {
  const res = await fetch(`${API_BASE_URL}/invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateInvoice(id, data) {
  const res = await fetch(`${API_BASE_URL}/invoice/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteInvoice(id) {
  const res = await fetch(`${API_BASE_URL}/invoice/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function fetchItems() {
  const res = await fetch(`${API_BASE_URL}/item`);
  return handleResponse(res);
}

export async function createItem(data) {
  const res = await fetch(`${API_BASE_URL}/item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateItem(id, data) {
  const res = await fetch(`${API_BASE_URL}/item/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE_URL}/item/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}
