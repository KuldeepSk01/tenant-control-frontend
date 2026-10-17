import { apiRequest } from "./apiClient";
export async function getDashboardStats() {
    const response = await apiRequest("/dashboard");
    return response.data;
}
