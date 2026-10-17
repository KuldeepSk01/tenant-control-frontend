import { ApiError } from "./ApiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export async function apiRequest(endpoint,options={}){

    const token = localStorage.getItem("accessToken");
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {})
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
    } catch {
        throw new ApiError(
            "Unable to reach the server. Please check your connection.",
            { status: 0 }
        );
    }

    /*
     * A 401 on an authenticated request means the session expired.
     * A 401 on a request with no token (e.g. login with bad credentials)
     * is just a normal API error and should be shown to the user.
     */
    if (response.status === 401 && token) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        // Response had no/invalid JSON body.
    }

    if (!response.ok) {
        throw new ApiError(
            data?.message || "Something went wrong",
            {
                status: response.status,
                errors: data?.errors || null
            }
        );
    }

    return data;
}
