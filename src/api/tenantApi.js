import { apiRequest } from "./apiClient";


export function getTenants(page = 0, size = 5) {
    return apiRequest(`/tenants?page=${page}&size=${size}`);
}


export function createTenant(data) {

    return apiRequest("/tenants", {
        method: "POST",
        body: JSON.stringify(data)
    });
}


export function getTenant(id) {
    return apiRequest(`/tenants/${id}`);
}


export function updateTenant(id, data) {
    return apiRequest(`/tenants/${id}`, {
        method: "PUT",
        body: data instanceof FormData ? data : JSON.stringify(data)
    });
}


export function deleteTenant(id) {

    return apiRequest(`/tenants/${id}`, {
        method: "DELETE"
    });
}