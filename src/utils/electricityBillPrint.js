
const escapeHtml = (value) =>
  String(value ?? "—").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })
    : escapeHtml(value);
};

const formatDate = (value) => {
  if (!value) return "—";

  // Supports YYYY-MM-DD without timezone shifting.
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN");
};

const safeLogoUrl = (value) => {
  if (!value) return "";

  try {
    const url = new URL(value, window.location.origin);

    if (
      url.protocol === "https:" ||
      url.protocol === "http:" ||
      url.protocol === "blob:"
    ) {
      return url.href;
    }
  } catch {
    return "";
  }

  return "";
};

export function handlePrint(bill, adminProfile = {}) {
  if (!bill) return false;

  const printWindow = window.open(
    "",
    "_blank",
    "width=900,height=750"
  );

  if (!printWindow) return false;

  // Business details come from AdminEntity.
  const businessName =
    adminProfile.businessName || "Tenant Control";

  const businessAddress =
    adminProfile.businessAddress || "";

  const businessCity = adminProfile.city || "";
  const businessState = adminProfile.state || "";
  const businessPincode = adminProfile.pincode || "";

  const businessEmail = adminProfile.businessEmail || "";
  const businessMobile = adminProfile.businessMobile || "";

  // Pass a publicly accessible URL or a blob URL.
  const businessLogo = safeLogoUrl(
    adminProfile.businessLogoUrl ||
    adminProfile.businessLogo
  );

  const businessLocation = [
    businessAddress,
    [businessCity, businessState, businessPincode]
      .filter((value) => value && value !== "Not provided")
      .join(", "),
  ]
    .filter((value) => value && value !== "Not provided")
    .join(", ");

  const billId =
    bill.billId ||
    bill.publicId ||
    bill.id ||
    "—";

  const status = String(bill.status || "PENDING").toUpperCase();

  const statusClass =
    status === "PAID"
      ? "paid"
      : status === "UNPAID" || status === "OVERDUE"
        ? "unpaid"
        : "pending";

  const totalAmount = Number(bill.totalAmount) || 0;
  const paidAmount = Number(bill.paidAmount) || 0;

  const remainingAmount =
    bill.remainingAmount !== null &&
    bill.remainingAmount !== undefined
      ? Number(bill.remainingAmount) || 0
      : Math.max(0, totalAmount - paidAmount);

  const readingRows = [
    ["Previous Meter Reading", formatNumber(bill.previousReading)],
    ["Current Meter Reading", formatNumber(bill.currentReading)],
    ["Units Consumed", formatNumber(bill.units)],
    ["Billing Month", formatDate(bill.readingMonth)],
    ["Payment Due Date", formatDate(bill.dueDate)],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td>${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join("");

  const logoHtml = businessLogo
    ? `<img
         class="business-logo"
         src="${escapeHtml(businessLogo)}"
         alt="Business Logo"
       />`
    : `<div class="logo-placeholder">
         ${escapeHtml(businessName.charAt(0).toUpperCase())}
       </div>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>Electricity Bill - ${escapeHtml(billId)}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;
            background: #e8edf5;
            color: #172033;
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice {
            max-width: 820px;
            margin: auto;
            background: #ffffff;
            box-shadow: 0 15px 45px rgba(20, 40, 80, 0.1);
            border-radius: 14px;
            overflow: hidden;
          }

          .top-border {
            height: 8px;
            background: #173a67;
          }

          .content {
            padding: 34px 38px;
          }

          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 25px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e2e8f0;
          }

          .business {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            min-width: 0;
          }

          .business-logo,
          .logo-placeholder {
            width: 76px;
            height: 76px;
            flex-shrink: 0;
            border-radius: 12px;
            object-fit: contain;
            background: #eef3f9;
          }

          .logo-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #173a67;
            font-size: 32px;
            font-weight: 800;
          }

          .business-name {
            margin: 0 0 7px;
            color: #173a67;
            font-size: 22px;
            font-weight: 800;
            line-height: 1.25;
          }

          .business-details {
            color: #64748b;
            font-size: 11px;
            line-height: 1.8;
            overflow-wrap: anywhere;
          }

          .invoice-title {
            text-align: right;
            flex-shrink: 0;
          }

          .invoice-title h1 {
            margin: 0 0 8px;
            color: #173a67;
            font-size: 24px;
            letter-spacing: 0.5px;
          }

          .invoice-subtitle {
            color: #64748b;
            font-size: 12px;
            line-height: 1.8;
          }

          .section-title {
            margin: 27px 0 13px;
            color: #173a67;
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.6px;
          }

          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .detail-card {
            padding: 17px 18px;
            background: #f7f9fc;
            border: 1px solid #e7edf5;
            border-radius: 10px;
          }

          .detail-label {
            display: block;
            margin-bottom: 6px;
            color: #64748b;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .detail-value {
            display: block;
            font-size: 14px;
            font-weight: 700;
            overflow-wrap: anywhere;
          }

          .detail-small {
            display: block;
            margin-top: 5px;
            color: #64748b;
            font-size: 11px;
          }

          .amount-banner {
            margin-top: 24px;
            padding: 23px 25px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            border-radius: 12px;
            background: #173a67;
            color: #ffffff;
          }

          .amount-label {
            font-size: 12px;
            color: #c9d9ef;
            text-transform: uppercase;
            letter-spacing: 0.7px;
          }

          .amount-value {
            margin-top: 8px;
            font-size: 31px;
            font-weight: 800;
          }

          .status {
            display: inline-block;
            padding: 8px 13px;
            border-radius: 30px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.4px;
          }

          .status.paid {
            background: #dcfce7;
            color: #166534;
          }

          .status.unpaid {
            background: #fee2e2;
            color: #991b1b;
          }

          .status.pending {
            background: #fef3c7;
            color: #92400e;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          thead {
            background: #edf3fa;
          }

          th {
            padding: 13px 15px;
            text-align: left;
            color: #173a67;
            font-weight: 800;
          }

          td {
            padding: 13px 15px;
            border-bottom: 1px solid #e7edf5;
          }

          td:last-child,
          th:last-child {
            text-align: right;
          }

          tbody tr:nth-child(even) {
            background: #fafcff;
          }

          .payment-summary {
            margin-top: 24px;
            margin-left: auto;
            max-width: 360px;
            border: 1px solid #dce6f1;
            border-radius: 10px;
            overflow: hidden;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 13px 16px;
            font-size: 12px;
          }

          .summary-row + .summary-row {
            border-top: 1px solid #e7edf5;
          }

          .summary-row span:first-child {
            color: #64748b;
          }

          .summary-row strong {
            font-weight: 800;
          }

          .summary-total {
            background: #eaf1fa;
            color: #173a67;
            font-size: 15px;
            font-weight: 800;
          }

          .summary-total span:first-child {
            color: #173a67;
          }

          .notice {
            margin-top: 28px;
            padding: 15px 18px;
            border-left: 4px solid #173a67;
            background: #f3f7fc;
            border-radius: 0 8px 8px 0;
            font-size: 11px;
            color: #475569;
            line-height: 1.8;
          }

          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 11px;
            line-height: 1.8;
          }

          .footer strong {
            color: #173a67;
          }

          .footer-bottom {
            margin-top: 15px;
            font-size: 10px;
            color: #94a3b8;
          }

          @media screen and (max-width: 600px) {
            body {
              padding: 10px;
            }

            .content {
              padding: 20px;
            }

            .header {
              flex-direction: column;
            }

            .invoice-title {
              text-align: left;
            }

            .details-grid {
              grid-template-columns: 1fr;
            }

            .amount-value {
              font-size: 24px;
            }

            .business-name {
              font-size: 18px;
            }
          }

          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }

            html,
            body {
              width: 100%;
              margin: 0;
              padding: 0;
              background: #ffffff;
            }

            .invoice {
              width: 100%;
              max-width: none;
              border-radius: 0;
              box-shadow: none;
            }

            .content {
              padding: 20px 24px;
            }

            .details-grid {
              grid-template-columns: 1fr 1fr;
            }

            .detail-card,
            .amount-banner,
            .payment-summary,
            .notice {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>

      <body>
        <main class="invoice">
          <div class="top-border"></div>

          <div class="content">
            <header class="header">
              <div class="business">
                ${logoHtml}

                <div>
                  <h2 class="business-name">
                    ${escapeHtml(businessName)}
                  </h2>

                  <div class="business-details">
                    ${
                      businessLocation
                        ? `<div>${escapeHtml(businessLocation)}</div>`
                        : ""
                    }

                    ${
                      businessMobile
                        ? `<div>Phone: ${escapeHtml(businessMobile)}</div>`
                        : ""
                    }

                    ${
                      businessEmail
                        ? `<div>Email: ${escapeHtml(businessEmail)}</div>`
                        : ""
                    }
                  </div>
                </div>
              </div>

              <div class="invoice-title">
                <h1>ELECTRICITY BILL</h1>

                <div class="invoice-subtitle">
                  <div>
                    Bill No:
                    <strong>${escapeHtml(billId)}</strong>
                  </div>

                  <div>
                    Billing Month:
                    ${escapeHtml(formatDate(bill.readingMonth))}
                  </div>

                  <div>
                    Due Date:
                    ${escapeHtml(formatDate(bill.dueDate))}
                  </div>
                </div>
              </div>
            </header>

            <h3 class="section-title">Consumer Information</h3>

            <div class="details-grid">
              <div class="detail-card">
                <span class="detail-label">Consumer Name</span>

                <span class="detail-value">
                  ${escapeHtml(bill.tenantName)}
                </span>

                <span class="detail-small">
                  Mobile: ${escapeHtml(bill.tenantMobile)}
                </span>
              </div>

              <div class="detail-card">
                <span class="detail-label">Property / Room</span>

                <span class="detail-value">
                  Room ${escapeHtml(bill.roomNumber)}
                </span>

                <span class="detail-small">
                  Meter No: ${escapeHtml(bill.meterNumber)}
                </span>
              </div>
            </div>

            <div class="amount-banner">
              <div>
                <div class="amount-label">
                  Total Outstanding Amount
                </div>

                <div class="amount-value">
                  ${escapeHtml(formatMoney(remainingAmount))}
                </div>
              </div>

              <span class="status ${statusClass}">
                ${escapeHtml(status.replaceAll("_", " "))}
              </span>
            </div>

            <h3 class="section-title">Electricity Consumption Details</h3>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Reading / Details</th>
                </tr>
              </thead>

              <tbody>
                ${readingRows}
              </tbody>
            </table>

            <h3 class="section-title">Payment Summary</h3>

            <div class="payment-summary">
              <div class="summary-row">
                <span>Total Bill Amount</span>
                <strong>
                  ${escapeHtml(formatMoney(totalAmount))}
                </strong>
              </div>

              <div class="summary-row">
                <span>Amount Paid</span>
                <strong>
                  ${escapeHtml(formatMoney(paidAmount))}
                </strong>
              </div>

              <div class="summary-row summary-total">
                <span>Balance Due</span>
                <strong>
                  ${escapeHtml(formatMoney(remainingAmount))}
                </strong>
              </div>
            </div>

            <div class="notice">
              <strong>Payment Information:</strong>
              Please clear any outstanding balance by
              <strong>${escapeHtml(formatDate(bill.dueDate))}</strong>.
              If payment has already been made, please retain
              this bill for your records.
            </div>

            <footer class="footer">
              <strong>${escapeHtml(businessName)}</strong>

              <div>
                This is a computer-generated electricity bill.
              </div>

              <div>
                For billing-related questions, please contact
                the business using the details above.
              </div>

              <div class="footer-bottom">
                Bill Reference: ${escapeHtml(billId)}
              </div>
            </footer>
          </div>
        </main>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  let printed = false;

  const printOnce = () => {
    if (printed || printWindow.closed) return;

    printed = true;
    printWindow.focus();
    printWindow.print();
  };

  // Wait for business logo to load before printing.
  const logo = printWindow.document.querySelector(".business-logo");

  if (logo && !logo.complete) {
    logo.addEventListener("load", printOnce, { once: true });
    logo.addEventListener("error", printOnce, { once: true });

    setTimeout(printOnce, 2500);
  } else {
    setTimeout(printOnce, 200);
  }

  return true;
}
