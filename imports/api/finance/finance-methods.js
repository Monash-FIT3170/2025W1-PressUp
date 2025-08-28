import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

/**
 * Convert rows of data into a CSV string.
 * @param {Array<Record<string, any>>} rows
 * @returns {string}
 */
function convertRowsToCSV(rows) {
    if (!rows.length) return "";

    const columnHeaders = Object.keys(rows[0]);

    const escapeValue = (value) => {
        const stringValue = value == null ? "" : String(value);
        return /[",\n]/.test(stringValue)
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
    };

    const dataLines = rows.map((row) =>
        columnHeaders.map((key) => escapeValue(row[key])).join(",")
    );

    return [columnHeaders.join(","), ...dataLines].join("\n");
}

/**
 * Get the start/end Date objects for an Australian financial year (1 Jul → 30 Jun).
 * Note: This uses plain JS Dates. If you later need timezone-accurate boundaries
 * (e.g., for non-UTC storage), swap to a timezone-aware library (Luxon/Temporal).
 *
 * @param {number} startYear - e.g. 2024
 * @param {number} endYear   - must be startYear + 1 (e.g. 2025)
 * @returns {{ fromDate: Date, toDate: Date }}
 */
function computeFinancialYearRange(startYear, endYear) {
    // Start: 1 July 00:00:00.000 of startYear
    const fromDate = new Date(startYear, 6, 1, 0, 0, 0, 0);
    // End: 30 June 23:59:59.999 of endYear
    const toDate = new Date(endYear, 5, 30, 23, 59, 59, 999);
    return { fromDate, toDate };
}

Meteor.methods({
    /**
     * Export orders to a CSV file (by date range).
     * @param {Date} startDate
     * @param {Date} endDate
     * @returns {string}
     */
    async "finance.export.ordersCSV"(startDate, endDate) {
        check(startDate, Date);
        check(endDate, Date);

        const orders = await Meteor.callAsync("orders.getInRange", startDate, endDate);

        const transformedOrders = orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const grossIncludingTax = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            return {
                OrderId: order._id,
                CreatedAt: order.createdAt?.toISOString?.() || "",
                Status: order.status,
                Table: order.table,
                Staff: order.staffName,
                Discount: order.discount ?? 0,
                ReceivedPayment: order.recievedPayment ?? 0,
                ItemCount: items.length,
                GrossInclGST: Number(grossIncludingTax.toFixed(2)),
            };
        });

        return convertRowsToCSV(transformedOrders);
    },

    /**
     * Export orders to CSV for a given financial year.
     * Example: startYear=2024, endYear=2025 (must be consecutive).
     *
     * @param {number} startYear
     * @param {number} endYear
     * @returns {string}
     */
    async "finance.export.ordersCSVForFY"(startYear, endYear) {
        check(startYear, Number);
        check(endYear, Number);

        if (endYear !== startYear + 1) {
            throw new Meteor.Error("bad-fy", "endYear must be startYear + 1");
        }

        const { fromDate, toDate } = computeFinancialYearRange(startYear, endYear);

        const csvString = await Meteor.callAsync("finance.export.ordersCSV", fromDate, toDate);
        return csvString;
    },
});