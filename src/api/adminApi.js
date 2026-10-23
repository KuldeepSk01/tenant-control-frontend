import { apiRequest } from "./apiClient";

export function getMyAdminProfile() {
  return apiRequest("/admin/profile/me", {
    method: "GET",  });
}

export function updateMyAdminProfile(data) {
  return apiRequest("/admin/profile/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function enableAutogeneratebillApi(enableAutoGenerateBill,userId) {
    return apiRequest("/admin/profile/setting/auto-bill/", {
        method: "PATCH",
        body: JSON.stringify({ enableAutoGenerateBill: enableAutoGenerateBill, userId:userId })
    });
}