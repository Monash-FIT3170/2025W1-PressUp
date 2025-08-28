import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import PDFDocument from "pdfkit";

/**
 * Convert rows of data into a CSV string.
 * NOTE: header order follows Object.keys of the first row.
 * @param {Array<Record<string, any>>} rows
 * @returns {string}
 */
function convertRowsToCSV(rows) {
    if (!rows.length) return "";

    const header = Object.keys(rows[0]);

    const escapeValue = (value) => {
        const s = value == null ? "" : String(value);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const body = rows.map((row) => header.map((k) => escapeValue(row[k])).join(","));
    return [header.join(","), ...body].join("\n");
}

/**
 * Get the start/end Date objects for an Australian financial year (1 Jul → 30 Jun).
 * Plain JS Dates; if you store non-UTC dates, consider a TZ-aware library later.
 * @param {number} startYear - e.g. 2024
 * @param {number} endYear   - must be startYear + 1 (e.g. 2025)
 */
function computeFinancialYearRange(startYear, endYear) {
    const fromDate = new Date(startYear, 6, 1, 0, 0, 0, 0);        // 1 Jul startYear 00:00
    const toDate = new Date(endYear, 5, 30, 23, 59, 59, 999);  // 30 Jun endYear 23:59:59.999
    return { fromDate, toDate };
}

/**
 * Fetch orders and shape them into a consistent row structure used by CSV & PDF.
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Array<Record<string, any>>>}
 */
async function buildOrderRowsForRange(startDate, endDate) {
    const orders = await Meteor.callAsync("orders.getInRange", startDate, endDate);

    return orders.map((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        const grossIncludingTax = items.reduce(
            (runningTotal, item) => runningTotal + item.price * item.quantity,
            0
        );

        return {
            OrderId: order._id,
            CreatedAt: order.createdAt?.toISOString?.() || "",
            Status: order.status,
            Table: order.table,
            Staff: order.staffName,
            ItemCount: items.length,
            Discount: order.discount ?? 0,
            ReceivedPayment: order.recievedPayment ?? 0,
            GrossInclGST: Number(grossIncludingTax.toFixed(2)),
        };
    });
}

/* ------------------------------ PDF helpers ------------------------------ */

// Reusable formatters
const formatAUD = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
});
const formatDateAU = (v) =>
    v ? new Date(v).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }) : "";

/**
 * Declarative column model for the PDF table.
 * - key:      row property to render (or provide accessor)
 * - header:   column label
 * - width:    fixed width in points
 * - align:    text alignment
 * - format:   (optional) value formatter
 * - accessor: (optional) function(row) => value
 * - gutter:   (optional) extra spacing after column
 */
const PDF_COLUMNS = [
    { key: "OrderId", header: "Order ID", width: 100, align: "left" },
    { key: "CreatedAt", header: "Date", width: 90, align: "left", format: formatDateAU },
    { key: "Status", header: "Status", width: 55, align: "left" },
    { key: "Table", header: "Table", width: 40, align: "right", gutter: 6 },
    { key: "Staff", header: "Staff", width: 100, align: "left" },
    { key: "ItemCount", header: "Items", width: 45, align: "right" },
    { key: "Discount", header: "Discount", width: 70, align: "right", format: (v) => formatAUD.format(Number(v || 0)) },
    { key: "ReceivedPayment", header: "Paid", width: 70, align: "right", format: (v) => formatAUD.format(Number(v || 0)) },
    { key: "GrossInclGST", header: "Gross (inc)", width: 80, align: "right", format: (v) => formatAUD.format(Number(v || 0)) },
];

/**
 * Build a PDF export of orders.
 * @param {Array<object>} rows
 * @param {{ title?: string, columns?: typeof PDF_COLUMNS, margin?: number, bandedRows?: boolean }} opts
 * @returns {Promise<Buffer>}
 */
function buildOrdersPdf(rows, opts = {}) {
    const {
        title = "Orders",
        columns = PDF_COLUMNS,
        margin = 24,
        bandedRows = true,
    } = opts;

    const doc = new PDFDocument({ layout: "landscape", margin });
    const buffers = [];
    doc.on("data", (c) => buffers.push(c));
    const endPromise = new Promise((resolve) => doc.on("end", () => resolve(Buffer.concat(buffers))));

    // Title
    doc.font("Helvetica-Bold").fontSize(16).text(title, { align: "center" });
    doc.moveDown(0.8);

    // Layout
    const lineHeight = 18;
    const startX = doc.page.margins.left;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const maxY = doc.page.height - doc.page.margins.bottom;
    const rule = (yy) =>
        doc.moveTo(startX, yy).lineTo(startX + pageWidth, yy).strokeColor("#f5e1a4").lineWidth(0.5).stroke();

    let y = doc.y;

    const drawHeader = () => {
        let x = startX;
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#000");
        columns.forEach((col) => {
            doc.text(col.header, x, y, { width: col.width, align: col.align || "left" });
            x += col.width + (col.gutter || 0);
        });
        y += lineHeight - 4;
        rule(y);
        y += 6;
    };

    const drawRow = (row, index) => {
        if (y > maxY - 40) {
            doc.addPage({ layout: "landscape", margin });
            y = doc.y;
            drawHeader();
        }

        if (bandedRows && index % 2 === 1) {
            doc.save().rect(startX, y - 2, pageWidth, lineHeight).fill("#f5e1a4").restore();
        }

        let x = startX;
        columns.forEach((col) => {
            const raw =
                typeof col.accessor === "function" ? col.accessor(row) :
                    col.key in row ? row[col.key] : "";

            const value = typeof col.format === "function" ? col.format(raw) : (raw ?? "");
            doc.font("Helvetica").fontSize(9).fillColor("#000");
            doc.text(String(value), x, y, { width: col.width, align: col.align || "left" });
            x += col.width + (col.gutter || 0);
        });

        y += lineHeight;
    };

    drawHeader();
    rows.forEach((r, i) => drawRow(r, i));

    rule(maxY - 16);
    doc.font("Helvetica").fontSize(8).fillColor("#555");
    doc.text(`Generated: ${new Date().toLocaleString("en-AU")}`, startX, maxY - 12);

    doc.end();
    return endPromise;
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

        const rows = await buildOrderRowsForRange(startDate, endDate);
        return convertRowsToCSV(rows);
    },

    /**
     * Export orders to CSV for a given financial year.
     * Example: startYear=2024, endYear=2025 (must be consecutive).
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
        return Meteor.callAsync("finance.export.ordersCSV", fromDate, toDate);
    },

    /**
     * Export orders to a LANDSCAPE PDF with a table (by date range).
     * Returns a Base64 string so the client can download it as a file.
     * @param {Date} startDate
     * @param {Date} endDate
     * @returns {string} base64 PDF
     */
    async "finance.export.ordersPDF"(startDate, endDate) {
        check(startDate, Date);
        check(endDate, Date);

        const rows = await buildOrderRowsForRange(startDate, endDate);
        const pdfBuffer = await buildOrdersPdf(rows, { title: "Orders Report" });
        return pdfBuffer.toString("base64");
    },

    /**
     * Export orders to a landscape PDF with a table for a financial year.
     * @param {number} startYear
     * @param {number} endYear
     * @returns {string}
     */
    async "finance.export.ordersPDFForFY"(startYear, endYear) {
        check(startYear, Number);
        check(endYear, Number);
        if (endYear !== startYear + 1) {
            throw new Meteor.Error("bad-fy", "endYear must be startYear + 1");
        }

        const { fromDate, toDate } = computeFinancialYearRange(startYear, endYear);
        return Meteor.callAsync("finance.export.ordersPDF", fromDate, toDate);
    },
});