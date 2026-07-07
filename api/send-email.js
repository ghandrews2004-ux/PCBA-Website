const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

module.exports = async (req, res) => {
  // Allow POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formType, fields } = req.body;

  if (!formType || !fields) {
    return res.status(400).json({ error: 'Missing form data' });
  }

  // Build email subject and body based on form type
  let subject = '';
  let html = '';

  const row = (label, value) => `
    <tr>
      <td style="padding:8px 12px; font-weight:600; color:#1B2A4A; background:#F7F5F0; width:180px; border-bottom:1px solid #E5E3DE;">${label}</td>
      <td style="padding:8px 12px; color:#1F2937; border-bottom:1px solid #E5E3DE;">${value || '—'}</td>
    </tr>`;

  const section = (title, rows) => `
    <tr><td colspan="2" style="padding:16px 12px 6px; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#A8845A; border-bottom:2px solid #C8A97E;">${title}</td></tr>
    ${rows}`;

  if (formType === 'dinner') {
    subject = `PCBA Annual Dinner Registration — ${fields.firstName} ${fields.lastName}`;
    html = buildEmail('Annual Dinner & Awards Registration', 'September 11, 2026 · Pueblo Riverwalk Boathouse', [
      section('Registrant Information', [
        row('Name', `${fields.firstName} ${fields.lastName}`),
        row('Email', fields.email),
        row('Phone', fields.phone || 'Not provided'),
        row('Association / Firm', fields.association),
      ].join('')),
      section('Ticket Selection', [
        row('Ticket Type', fields.ticketType === 'table' ? 'Table of 8 — $375 flat rate' : `${fields.guests} Individual Ticket${fields.guests > 1 ? 's' : ''} — $${fields.guests * 50}`),
        row('Total Seats', fields.ticketType === 'table' ? '8 (reserved table)' : fields.guests),
        row('Total Due', `$${fields.total}`),
      ].join('')),
      section('Dietary & Accessibility', [
        row('Food Allergies / Dietary Restrictions', fields.allergies || 'None'),
        row('Accessibility / Accommodations', fields.accommodations || 'None'),
        row('Additional Notes', fields.other || 'None'),
      ].join('')),
      section('Payment', [
        row('Payment Method', fields.payMethod === 'paypal' ? 'Online via PayPal' : 'By Check (mailed)'),
        row('Payment Status', `<span style="color:#b45309; font-weight:600;">⚠️ PENDING — Please confirm $${fields.total} payment has been completed</span>`),
      ].join('')),
    ].join(''));
  }

  else if (formType === 'join') {
    subject = `PCBA New Member Application — ${fields.firstName} ${fields.lastName}`;
    html = buildEmail('New Member Application', 'Pueblo County Bar Association', [
      section('Personal Information', [
        row('Name', `${fields.firstName} ${fields.lastName}`),
        row('Email', fields.email),
        row('Phone', fields.phone || 'Not provided'),
        row('Mailing Address', `${fields.address}, ${fields.city}, CO ${fields.zip}`),
      ].join('')),
      section('Membership Type', [
        row('Type Selected', fields.memberType === 'active' ? 'Active Member — $100' : 'Public Servant Member — $50*'),
        row('Dues Amount', `$${fields.memberType === 'active' ? '100' : '50'}`),
      ].join('')),
      section('Professional Information', [
        row('Firm / Organization', fields.firm || 'Not provided'),
        row('Colorado Bar Number', fields.barNumber),
        row('Year Admitted', fields.yearAdmitted),
        row('Primary Practice Area', fields.practiceArea || 'Not provided'),
        row('Directory Listing', fields.directoryOpt === 'yes' ? 'Yes — include in Find a Lawyer directory' : 'No — members only'),
      ].join('')),
      section('Payment', [
        row('Payment Method', fields.payMethod === 'paypal' ? 'Online via PayPal' : 'By Check (mailed)'),
        row('Payment Status', `<span style="color:#b45309; font-weight:600;">⚠️ PENDING — Please confirm dues payment has been completed</span>`),
      ].join('')),
    ].join(''));
  }

  else if (formType === 'renew') {
    subject = `PCBA Membership Renewal — ${fields.firstName} ${fields.lastName}`;
    html = buildEmail('Membership Renewal', 'Pueblo County Bar Association · 2026–2027', [
      section('Member Information', [
        row('Name', `${fields.firstName} ${fields.lastName}`),
        row('Email', fields.email),
        row('Colorado Bar Number', fields.barNumber),
        row('Membership Type', fields.memberType),
        row('Amount Due', `$${fields.amount}`),
      ].join('')),
      section('Payment', [
        row('Payment Method', fields.payMethod === 'paypal' ? 'Online via PayPal' : 'By Check (mailed)'),
        row('Payment Status', `<span style="color:#b45309; font-weight:600;">⚠️ PENDING — Please confirm dues payment has been completed</span>`),
      ].join('')),
    ].join(''));
  }

  else {
    return res.status(400).json({ error: 'Unknown form type' });
  }

  try {
    await transporter.sendMail({
      from: `"PCBA Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: fields.email || process.env.GMAIL_USER,
      subject,
      html,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};

function buildEmail(title, subtitle, sections) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0; padding:0; background:#F7F5F0; font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0; padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0D1B2E,#1B2A4A); padding:32px 32px 24px;">
          <div style="font-family:Georgia,serif; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#C8A97E; margin-bottom:8px;">Pueblo County Bar Association</div>
          <div style="font-family:Georgia,serif; font-size:26px; font-weight:600; color:#ffffff; line-height:1.2; margin-bottom:4px;">${title}</div>
          <div style="font-size:13px; color:rgba(255,255,255,0.5);">${subtitle}</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:8px 0 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${sections}
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0D1B2E; padding:20px 32px;">
          <div style="font-size:11px; color:rgba(255,255,255,0.35); text-align:center;">
            This form was submitted via the PCBA website · pueblobar.org
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
