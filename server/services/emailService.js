const nodemailer = require('nodemailer');
const { STATUS_LABELS } = require('../constants/orderStatus');
const { EMAIL_USER, EMAIL_PASS } = require('../config/env');
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
const buildOrderConfirmationHtml = (order) => {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#e0e0e0;font-size:14px;">${item.name}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#e0e0e0;text-align:center;font-size:14px;">${item.quantity}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#ff2d8a;text-align:left;font-size:14px;font-weight:700;">₪${item.price * item.quantity}</td>
      </tr>`
    )
    .join('');
  const deliveryLine =
    order.delivery.type === 'pickup'
      ? '🏪 איסוף עצמי מהמאפייה'
      : `🚚 משלוח — ${order.delivery.address}`;
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#121212;font-family:'Segoe UI','Heebo',Arial,sans-serif;color:#e0e0e0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#121212;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#1e1e1e;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
          <!-- Header with Logo -->
          <tr>
            <td style="background:#1a1a1a;padding:24px 32px;text-align:right;border-bottom:1px solid #ff2d8a;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <img src="${SITE_URL}/branding/logo.png" alt="Brooklyn Bake Shop" style="height:44px;border-radius:50%;vertical-align:middle;" />
              </a>
              <span style="color:#ff2d8a;font-size:1.2rem;font-weight:700;margin-right:12px;vertical-align:middle;">Brooklyn Bake Shop</span>
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 16px;text-align:right;">
              <h2 style="margin:0 0 8px;font-size:1.3rem;color:#ffffff;">היי ${order.customer.name} 👋</h2>
              <p style="margin:0;color:#aaa;line-height:1.7;font-size:14px;">
                ההזמנה שלך התקבלה בהצלחה! אנחנו כבר מתחילים לעבוד עליה.
              </p>
            </td>
          </tr>
          <!-- Order Info -->
          <tr>
            <td style="padding:0 32px 20px;text-align:right;">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#252525;border-radius:10px;padding:16px;border:1px solid #2a2a2a;">
                <tr>
                  <td style="padding:8px 16px;">
                    <span style="font-size:12px;color:#888;">מספר הזמנה</span><br/>
                    <span style="font-weight:700;font-size:16px;color:#ffffff;">#${String(order._id).slice(-8).toUpperCase()}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;">
                    <span style="font-size:12px;color:#888;">סטטוס</span><br/>
                    <span style="background:#ff2d8a;color:#fff;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">
                      ${STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;">
                    <span style="font-size:12px;color:#888;">משלוח</span><br/>
                    <span style="font-size:14px;color:#e0e0e0;">${deliveryLine}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Items Table -->
          <tr>
            <td style="padding:0 32px 20px;text-align:right;">
              <h3 style="margin:0 0 12px;font-size:14px;color:#ff2d8a;border-bottom:1px solid #2a2a2a;padding-bottom:8px;">
                פירוט הזמנה
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="padding:8px 16px;text-align:right;font-size:12px;color:#888;border-bottom:1px solid #2a2a2a;">מוצר</th>
                    <th style="padding:8px 16px;text-align:center;font-size:12px;color:#888;border-bottom:1px solid #2a2a2a;">כמות</th>
                    <th style="padding:8px 16px;text-align:left;font-size:12px;color:#888;border-bottom:1px solid #2a2a2a;">מחיר</th>
                  </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:14px 16px;font-weight:700;font-size:16px;color:#ffffff;border-top:1px solid #ff2d8a;">
                      סה״כ לתשלום
                    </td>
                    <td style="padding:14px 16px;font-weight:700;font-size:16px;color:#ff2d8a;border-top:1px solid #ff2d8a;text-align:left;">
                      ₪${order.total}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;padding:20px 32px;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="margin:0;font-size:12px;color:#666;line-height:1.7;">
                תודה שקנית ב-Brooklyn Bake Shop 🧁<br/>
                לשאלות ניתן לפנות אלינו בתשובה למייל זה.
              </p>
              <a href="${SITE_URL}" style="display:inline-block;margin-top:12px;color:#ff2d8a;font-size:13px;text-decoration:none;font-weight:600;">
                ← חזרה לחנות
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
const sendOrderConfirmation = async (order) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('[emailService] EMAIL_USER or EMAIL_PASS not set — skipping email');
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"Brooklyn Bake Shop 🥐" <${EMAIL_USER}>`,
      to:      order.customer.email,
      subject: `✅ אישור הזמנה #${String(order._id).slice(-8).toUpperCase()} — Brooklyn Bake Shop`,
      html:    buildOrderConfirmationHtml(order),
    });
    console.log(`[emailService] Confirmation sent to ${order.customer.email}`);
  } catch (err) {
    console.error('[emailService] Failed to send email:', err.message);
  }
};
module.exports = { sendOrderConfirmation };