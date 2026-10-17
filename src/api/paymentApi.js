import { apiRequest } from "./apiClient";

export async function createRazorpayOrder(plan) {
    return apiRequest("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ plan })
    });
}

export async function verifyPayment(paymentDetails) {
    return apiRequest("/payments/verify", {
        method: "POST",
        body: JSON.stringify(paymentDetails)
    });
}