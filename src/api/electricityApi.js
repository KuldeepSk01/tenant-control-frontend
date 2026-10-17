// src/api/electricityApi.js

import { apiRequest } from "./apiClient";

/*
|--------------------------------------------------------------------------
| ELECTRICITY METER APIs
|--------------------------------------------------------------------------
*/


/*
 * Create Electricity Meter
 *
 * POST /api/electricity/meters
 *
 * Request body:
 * {
 *   roomId: 1,
 *   meterNumber: "MTR-1001",
 *   initialReading: 1200,
 *   ratePerUnit: 8.50
 * }
 */
export const createElectricityMeter = (data) => {
    return apiRequest("/electricity/meters", {
        method: "POST",
        body: JSON.stringify(data),
    });
};


/*
 * Get Electricity Meters
 *
 * GET /api/electricity/meters?page=0&size=10
 */
export const getElectricityMeters = (
    page = 0,
    size = 10
) => {

    const params = new URLSearchParams({
        page,
        size,
    });

    return apiRequest(
        `/electricity/meters?${params.toString()}`,
        {
            method: "GET",
        }
    );
};


/*
 * Get Electricity Meter By Public ID
 *
 * GET /api/electricity/meters/{publicId}
 */
export const getElectricityMeterById = (publicId) => {
    return apiRequest(
        `/electricity/meters/${publicId}`,
        {
            method: "GET",
        }
    );
};


/*
 * Update Electricity Meter
 *
 * PUT /api/electricity/meters/{publicId}
 */
export const updateElectricityMeter = (
    publicId,
    data
) => {

    return apiRequest(
        `/electricity/meters/${publicId}`,
        {
            method: "PUT",
            body: JSON.stringify(data),
        }
    );
};


/*
 * Deactivate Electricity Meter
 *
 * PATCH /api/electricity/meters/{publicId}/deactivate
 */
export const deactivateElectricityMeter = (publicId) => {

    return apiRequest(
        `/electricity/meters/${publicId}/deactivate`,
        {
            method: "PATCH",
        }
    );
};



/*
|--------------------------------------------------------------------------
| ELECTRICITY READING APIs
|--------------------------------------------------------------------------
*/


/*
 * Create Electricity Reading
 *
 * POST /api/electricity/readings
 *
 * Request body:
 * {
 *   meterId: 1,
 *   currentReading: 1350,
 *   readingMonth: "2026-09-01"
 * }
 */
export const createElectricityReading = (data) => {

    return apiRequest(
        "/electricity/readings",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
};


/*
 * Get Electricity Readings
 *
 * Supports:
 *
 * - pagination
 * - meter number
 * - room number
 * - reading month
 *
 * Example:
 *
 * GET /api/electricity/readings
 *
 * GET /api/electricity/readings?
 *     page=0&
 *     size=10&
 *     meterNumber=MTR-1001&
 *     roomNumber=101&
 *     readingMonth=2026-09-01
 */
export const getElectricityReadings = ({
    page = 0,
    size = 10,
    meterNumber = "",
    roomNumber = "",
    readingMonth = "",
} = {}) => {

    const params = new URLSearchParams({
        page,
        size,
    });

    if (meterNumber) {
        params.append("meterNumber", meterNumber);
    }

    if (roomNumber) {
        params.append("roomNumber", roomNumber);
    }

    if (readingMonth) {
        params.append("readingMonth", readingMonth);
    }

    return apiRequest(
        `/electricity/readings?${params.toString()}`,
        {
            method: "GET",
        }
    );
};


/*
 * Get Electricity Reading By Public ID
 *
 * GET /api/electricity/readings/{publicId}
 */
export const getElectricityReadingById = (publicId) => {

    return apiRequest(
        `/electricity/readings/${publicId}`,
        {
            method: "GET",
        }
    );
};


/*
 * Delete Electricity Reading
 *
 * DELETE /api/electricity/readings/{publicId}
 */
export const deleteElectricityReading = (publicId) => {

    return apiRequest(
        `/electricity/readings/${publicId}`,
        {
            method: "DELETE",
        }
    );
};



/*
|--------------------------------------------------------------------------
| ELECTRICITY BILL APIs
|--------------------------------------------------------------------------
*/


/*
 * Generate Electricity Bill
 *
 * POST /api/electricity/bills/generate
 *
 * Request body:
 * {
 *   readingId: 10,
 *   assignmentId: 5,
 *   dueDate: "2026-09-15"
 * }
 *
 * Backend calculates:
 *
 * units
 * ratePerUnit
 * totalAmount
 * status
 * paidAmount
 */
export const generateElectricityBill = (data) => {

    return apiRequest(
        "/electricity/bills/generate",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
};


/*
 * Get Electricity Bill By Public ID
 *
 * GET /api/electricity/bills/{publicId}
 */
export const getElectricityBillById = (publicId) => {

    return apiRequest(
        `/electricity/bills/${publicId}`,
        {
            method: "GET",
        }
    );
};


/*
 * Get Electricity Bills
 *
 * Supports:
 *
 * - pagination
 * - meter number
 * - room number
 * - reading month
 * - bill status
 *
 * Example:
 *
 * getElectricityBills({
 *     page: 0,
 *     size: 10,
 *     status: "UNPAID"
 * });
 */
export const getElectricityBills = ({
    page = 0,
    size = 10,
    meterNumber = "",
    roomNumber = "",
    readingMonth = "",
    status = "",
} = {}) => {

    const params = new URLSearchParams({
        page,
        size,
    });

    if (meterNumber) {
        params.append("meterNumber", meterNumber);
    }

    if (roomNumber) {
        params.append("roomNumber", roomNumber);
    }

    if (readingMonth) {
        params.append("readingMonth", readingMonth);
    }

    if (status) {
        params.append("status", status);
    }

    return apiRequest(
        `/electricity/bills?${params.toString()}`,
        {
            method: "GET",
        }
    );
};



/*
|--------------------------------------------------------------------------
| ELECTRICITY BILL PAYMENT APIs
|--------------------------------------------------------------------------
*/


/*
 * Record Electricity Bill Payment
 *
 * POST /api/electricity/bill-payments
 *
 * Request body:
 * {
 *   billPublicId: "8b4d...",
 *   amount: 500,
 *   transactionReference: "TXN-10001"
 * }
 */
export const makeElectricityBillPayment = (data) => {

    return apiRequest(
        "/electricity/bill-payments",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
};


/*
 * Get Payment History
 *
 * GET /api/electricity/bill-payments/bill/{billPublicId}
 */
export const getElectricityBillPaymentHistory = (
    billPublicId
) => {

    return apiRequest(
        `/electricity/bill-payments/bill/${billPublicId}`,
        {
            method: "GET",
        }
    );
};

