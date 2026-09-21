import test from "node:test";
import assert from "node:assert/strict";

const originalBrevo = process.env.BREVO_API_KEY;
const originalSender = process.env.EMAIL_FROM;
const originalAdmin = process.env.ADMIN_EMAIL;

test("sendAdminEnquiryNotification posts to Brevo for the admin inbox", async () => {
  process.env.BREVO_API_KEY = "test-key";
  process.env.EMAIL_FROM = "noreply@dabi.com";
  process.env.ADMIN_EMAIL = "admin@dabi.com";

  const calls: any[] = [];
  const mockFetch: typeof fetch = async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ input, init });
    return new Response(JSON.stringify({ messageId: "abc" }), { status: 202, headers: { "Content-Type": "application/json" } });
  };
  global.fetch = mockFetch;

  const { sendAdminEnquiryNotification } = await import("./emailService");
  const result = await sendAdminEnquiryNotification({
    name: "Ama Boateng",
    phone: "+233200000000",
    email: "ama@example.com",
    school: "University of Ghana",
    hostelName: "Campus Lodge",
    roomType: "Double",
    moveInDate: "2026-10-01",
    message: "I would like to book a room.",
  });

  assert.equal(result.sent, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, "POST");
  const body = JSON.parse(String(calls[0].init.body));
  assert.equal(body.to[0].email, "admin@dabi.com");
  assert.match(body.subject, /new enquiry/i);

  process.env.BREVO_API_KEY = originalBrevo;
  process.env.EMAIL_FROM = originalSender;
  process.env.ADMIN_EMAIL = originalAdmin;
});
