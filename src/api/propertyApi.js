import { apiRequest } from "./apiClient";


export function getProperties() {
    return apiRequest("/properties");
}


export function createProperty(data) {

    return apiRequest("/properties", {
        method: "POST",
        body: JSON.stringify(data)
    });
}


export function getProperty(id) {

    return apiRequest(`/properties/${id}`);
}


export function updateProperty(id, data) {

    return apiRequest(`/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}


export function deleteProperty(id) {

    return apiRequest(`/properties/${id}`, {
        method: "DELETE"
    });
}