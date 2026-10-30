import { apiRequest } from "./apiClient";

export async function login(loginWith, loginType, password) {
    return apiRequest("/auth/login", {
        method: "POST",

        body: JSON.stringify({
            loginWith,
            loginType,
            password
        })
    });
}

export async function signup(data) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function verifyOTP(data) {
    return apiRequest("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function resentOTP(data) {
    return apiRequest("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function getProfile(userId, accessToken) {
    return apiRequest(`/users/profile/${userId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}
