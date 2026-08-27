import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../env.js';

/**
 * Inquiry notifications.
 *
 * With no SMTP_HOST configured the transport is deliberately a console logger
 * rather than a crash or a silent no-op: a developer running the site locally
 * still gets to see exactly what would have been sent, and a misconfigured
 * production deploy is loud in the logs instead of quietly dropping leads.
 */
let transporter: Transporter | null = null;

function getTransport(): Transporter | null {
  if (!env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS ?? '' } } : {}),
  });
  return transporter;
}

export interface InquiryMail {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  productName?: string | null;
  fabricName?: string | null;
  customDimensions?: string | null;
}

function render(inquiry: InquiryMail): { subject: string; text: string } {
  const lines = [
    `New enquiry from ${inquiry.name}`,
    '',
    `Phone:      ${inquiry.phone}`,
    inquiry.email ? `Email:      ${inquiry.email}` : null,
    inquiry.productName ? `Piece:      ${inquiry.productName}` : null,
    inquiry.fabricName ? `Fabric:     ${inquiry.fabricName}` : null,
    inquiry.customDimensions ? `Dimensions: ${inquiry.customDimensions}` : null,
    '',
    'Message:',
    inquiry.message,
    '',
    `Reference: ${inquiry.id}`,
  ].filter((l): l is string => l !== null);

  const subject = inquiry.productName
    ? `Aura Interior — enquiry: ${inquiry.productName}`
    : 'Aura Interior — new enquiry';

  return { subject, text: lines.join('\n') };
}

/**
 * Never rejects. A mail outage must not lose the enquiry — it is already
 * committed to the database by the time this runs, and the admin inbox is the
 * source of truth. Failures are logged, not surfaced to the customer.
 */
export async function sendInquiryNotification(inquiry: InquiryMail): Promise<void> {
  const { subject, text } = render(inquiry);
  const transport = getTransport();

  if (!transport) {
    console.log(`\n[mail] SMTP_HOST not set — enquiry not emailed.\n[mail] ${subject}\n${text}\n`);
    return;
  }

  try {
    await transport.sendMail({ from: env.MAIL_FROM, to: env.MAIL_TO, subject, text });
  } catch (err) {
    console.error('[mail] failed to send inquiry notification:', err);
  }
}
