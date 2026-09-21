import { env } from "../config";

const emailPattern = /^\S+@\S+\.\S+$/;

type AdminEnquiryNotificationPayload = {
  name: string;
  phone: string;
  email?: string | null;
  school?: string | null;
  hostelName?: string | null;
  roomType?: string | null;
  moveInDate?: string | null;
  message?: string | null;
};

export async function sendAdminEnquiryNotification(payload: AdminEnquiryNotificationPayload): Promise<{ sent: boolean }> {
  const adminEmail = (process.env.ADMIN_EMAIL ?? env.ADMIN_EMAIL ?? "admin@dabi.com").trim().toLowerCase();

  if (!env.BREVO_API_KEY || !env.EMAIL_FROM) {
    console.info(`[email] Email provider not configured; skipped enquiry notification to admin (${adminEmail})`);
    return { sent: false };
  }

  if (!emailPattern.test(adminEmail)) {
    throw new Error(`Admin email is invalid: ${adminEmail}`);
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME ?? "Dabi" },
      to: [{ email: adminEmail, name: "Dabi Admin" }],
      replyTo: payload.email ? { email: payload.email, name: payload.name } : undefined,
      subject: `New enquiry from ${payload.name}`,
      htmlContent: `
        <html><body>
        <p><strong>New enquiry received</strong></p>
        <p><strong>Name:</strong> ${payload.name}<br>
        <strong>Phone:</strong> ${payload.phone}<br>
        <strong>Email:</strong> ${payload.email ?? "Not provided"}<br>
        <strong>School:</strong> ${payload.school ?? "Not provided"}<br>
        <strong>Hostel:</strong> ${payload.hostelName ?? "Not provided"}<br>
        <strong>Room:</strong> ${payload.roomType ?? "Not provided"}<br>
        <strong>Move-in date:</strong> ${payload.moveInDate ?? "Not provided"}</p>
        <p><strong>Message:</strong><br>${payload.message ?? "No message"}</p>
        </body></html>
      `,
      textContent: [
        `Name: ${payload.name}`,
        `Phone: ${payload.phone}`,
        `Email: ${payload.email ?? "Not provided"}`,
        `School: ${payload.school ?? "Not provided"}`,
        `Hostel: ${payload.hostelName ?? "Not provided"}`,
        `Room: ${payload.roomType ?? "Not provided"}`,
        `Move-in date: ${payload.moveInDate ?? "Not provided"}`,
        `Message: ${payload.message ?? "No message"}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    console.error(`[email] Failed to send enquiry notification to admin ${adminEmail}: ${response.status} ${bodyText}`);
    return { sent: false };
  }

  return { sent: true };
}
