import { apiRequest } from "./apiClient";

export async function updateProfile(data) {
    return apiRequest("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export async function getProfile(userId) {
    return apiRequest(`/users/profile/${userId}`, {
        method: "GET"
    });
}
