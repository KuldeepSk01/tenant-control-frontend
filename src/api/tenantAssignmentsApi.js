import { apiRequest } from "./apiClient";

/*
 * =========================================================
 * TENANT ROOM ASSIGNMENT APIs
 * =========================================================
 *
 * Backend Base URL:
 * /api/tenant-room-assignments
 */


/*
 * ---------------------------------------------------------
 * Assign tenant to room
 *
 * POST /api/tenant-room-assignments
 * ---------------------------------------------------------
 */
export function assignTenantToRoom(data) {

    return apiRequest(
        "/tenant-room-assignments",
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
}


/*
 * ---------------------------------------------------------
 * Get all room assignments like move in -  move out of tenant
 *
 * GET /api/tenant-room-assignments
 * ---------------------------------------------------------
 */
export function getAssignments() {
    return apiRequest(
        "/tenant-room-assignments",
        {
            method: "GET"
        }
    );
}


/*
 * ---------------------------------------------------------
 * Get assignment by public ID
 *
 * GET /api/tenant-room-assignments/{publicId}
 * ---------------------------------------------------------
 */
export function getAssignment(publicId) {

    return apiRequest(
        `/tenant-room-assignments/${publicId}`,
        {
            method: "GET"
        }
    );
}


/*
 * ---------------------------------------------------------
 * Move tenant out of room
 *
 * PATCH /api/tenant-room-assignments/{publicId}/move-out
 * ---------------------------------------------------------
 */
export function moveOut(publicId) {
    return apiRequest(
        `/tenant-room-assignments/${publicId}/move-out`,
        {
            method: "PATCH"
        }
    );
}

