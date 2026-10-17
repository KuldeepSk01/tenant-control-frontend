import { apiRequest } from "./apiClient";

export async  function getSubscriptionsPlans() {
    return apiRequest("/subscriptions/plans", {
        method: "GET"
    });
}

export async function getMySubscriptionPlan(){
    return apiRequest("/subscriptions/me", {
        method: "GET"
    });

}