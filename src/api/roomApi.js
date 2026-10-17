import { apiRequest } from "./apiClient";


export function getRoomsByProperty(propertyId) {
    return apiRequest(`/properties/${propertyId}/rooms`);
}


export function createRoom(propertyId, data) {

    return apiRequest(`/properties/${propertyId}/rooms`, {
        method: "POST",
        body: JSON.stringify(data)
    });
}


export function getRoom(id) {

    return apiRequest(`/rooms/${id}`);
}


export function updateRoom(id, data) {

    return apiRequest(`/rooms/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}


export function deleteRoom(id) {

    return apiRequest(`/rooms/${id}`, {
        method: "DELETE"
    });
}


export function assignRoom(data) {

    return apiRequest(
        "/tenant-room-assignments",
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
}