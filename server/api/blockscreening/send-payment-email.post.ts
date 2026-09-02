import { createError, defineEventHandler, getHeader, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const adminPassword = process.env.BLOCKSCREENING_ADMIN_PASSWORD || 'luckytin02'
  if (getHeader(event, 'x-admin-password') !== adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please provide valid admin credentials.' })
  }

  const { email, nickname } = await readBody(event)
  if (!email || !nickname) {
    throw createError({ statusCode: 400, statusMessage: 'Recipient email and nickname are required.' })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const senderEmail = process.env.MAIL_FROM || 'Luckytin Fan Support <noreply@luckytinfs.com>'

  // HTML Email Template matching the website theme
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Block Screening Payment</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c1829; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #fdfbf7;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c1829; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #162b4d; border: 1px solid #2b4c7e; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #10223e 0%, #1a3865 100%); border-bottom: 2px solid #e29026; text-align: center;">
              <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #f3ad47; display: block; margin-bottom: 6px;">Luckytin Fan Support</span>
              <h1 style="margin: 0; font-size: 22px; color: #fdfbf7; letter-spacing: -0.5px;">Forgotten Island Block Screening</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 40px; line-height: 1.6; color: #e2ebf8; font-size: 15px;">
              <p style="font-size: 18px; font-weight: bold; color: #fdfbf7; margin-top: 0;">Hey ${nickname}!</p>
              
              <p style="margin-bottom: 24px;">Thank you so much for registering to our block screening event! To secure your offered slot, please complete your payment through the link below:</p>

              <!-- Payment Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://luckytinfs.com/blockscreening/payment" style="background-color: #e29026; background: linear-gradient(180deg, #f5ad43 0%, #e29026 100%); color: #0c1829; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 15px; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(226, 144, 38, 0.4);">
                  Complete Payment
                </a>
              </div>

              <!-- Deadline Notice -->
              <div style="background-color: rgba(226, 144, 38, 0.1); border-left: 4px solid #e29026; border-radius: 6px; padding: 14px 16px; margin: 24px 0; font-size: 13px; color: #fadb9e; line-height: 1.5;">
                <strong>⚠️ Please Note:</strong> Please make sure to pay on or before <strong>September 15, 8pm</strong>. Failure to complete payment by the deadline will automatically result to the forfeiture of your slot.
              </div>

              <p style="margin-top: 30px; margin-bottom: 0;">Thank you and see you there!<br>
              <strong style="color: #f3ad47;">— Luckytin Fan Support team</strong></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #0e1c33; border-top: 1px solid #233e66; text-align: center; font-size: 11px; color: #7e9bbd;">
              LuckyTin Fan Support © 2026 • Forgotten Island Movie Event
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [email],
          subject: 'Complete your Block Screening Payment - Forgotten Island',
          html: htmlContent,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Resend API Error:', err)
        throw createError({
          statusCode: res.status,
          statusMessage: err.message || 'Failed to dispatch email via Resend API.',
        })
      }
    }
    catch (error: any) {
      console.error('Email dispatch error:', error)
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Failed to send payment email.',
      })
    }
  }
  else {
    console.log(`[Email Dispatch - Key Not Configured] Sent payment link email to ${email} for registrant ${nickname}`)
  }

  return { success: true, email, nickname }
})
