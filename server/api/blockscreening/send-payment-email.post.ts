import { createError, defineEventHandler, getHeader, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const adminPassword = process.env.BLOCKSCREENING_ADMIN_PASSWORD || 'luckytin02'
  if (getHeader(event, 'x-admin-password') !== adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please provide valid admin credentials.' })
  }

  const { id, email, nickname } = await readBody(event)
  if (!email || !nickname) {
    throw createError({ statusCode: 400, statusMessage: 'Recipient email and nickname are required.' })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const senderEmail = process.env.MAIL_FROM || 'Luckytin Fan Support <noreply@luckytinfs.com>'

  const idBadge = id
    ? `<div style="margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #dfe8f6; border: 1px solid #bfd1ee; border-radius: 8px; padding: 6px 14px; font-family: 'Courier Prime', Courier, monospace; font-size: 13px; color: #1f4072; font-weight: 700;">
          Registration ID: <span style="color: #0f2038;">${id}</span>
        </span>
      </div>`
    : ''

  // HTML Email Template matching website theme (Fraunces, Courier Prime, Geist, Sand/Paper & Navy)
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Block Screening Payment Instructions</title>
  <!-- Google Fonts matching the website: Fraunces, Courier Prime & Geist -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,600&family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #0f2038; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f7f4ee; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f2038; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #162b4d; border: 1px solid #284777; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Gingham Decorative Ribbon matching website -->
          <tr>
            <td style="background-color: #ffe705; background: linear-gradient(90deg, #ffe705 0%, #ffeb57 25%, #7fa4dc 50%, #ffe705 75%, #3f76cb 100%); height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 32px 36px 24px 36px; background: linear-gradient(180deg, #12243f 0%, #162b4d 100%); text-align: center; border-bottom: 1px solid rgba(235, 220, 179, 0.15);">
              <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 3.5px; color: #ffe705; display: block; margin-bottom: 6px; font-weight: 700;">
                🏝️ Luckytin Fan Support
              </span>
              <h1 style="margin: 0; font-family: 'Fraunces', Georgia, serif; font-size: 26px; font-weight: 700; color: #f7f4ee; letter-spacing: -0.5px; line-height: 1.2;">
                Forgotten Island Block Screening
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 36px 36px 36px; line-height: 1.6; color: #dbe4f2; font-size: 15px;">
              <p style="font-family: 'Fraunces', Georgia, serif; font-size: 20px; font-weight: 700; color: #f7f4ee; margin-top: 0; margin-bottom: 12px;">
                Hey ${nickname}!
              </p>
              
              <!-- Registrant ID Badge -->
              ${idBadge}

              <p style="margin-bottom: 24px; color: #dbe4f2; line-height: 1.6;">
                Thank you so much for registering to our block screening event! To secure your offered slot, please complete your payment through the link below:
              </p>

              <!-- Complete Payment Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://luckytinfs.com/blockscreening/payment" style="background-color: #ffe705; background: linear-gradient(180deg, #ffe705 0%, #ffdf00 100%); color: #0f2038; padding: 15px 36px; border-radius: 9999px; font-weight: 800; font-size: 15px; font-family: 'Geist', sans-serif; text-decoration: none; display: inline-block; box-shadow: 0 6px 20px rgba(255, 231, 5, 0.35); letter-spacing: 0.3px; border: 1px solid #ffe705;">
                  Complete Payment →
                </a>
              </div>

              <!-- Deadline Notice -->
              <div style="background-color: rgba(255, 231, 5, 0.08); border-left: 4px solid #ffe705; border-radius: 8px; padding: 16px 18px; margin: 28px 0; font-size: 13.5px; color: #ffef57; line-height: 1.5;">
                <strong style="color: #ffe705;">⚠️ Please Note:</strong> Please make sure to pay on or before <strong>September 15, 8pm</strong>. Failure to complete payment by the deadline will automatically result to the forfeiture of your slot.
              </div>

              <p style="margin-top: 30px; margin-bottom: 0; font-size: 14px; color: #dbe4f2; line-height: 1.6;">
                Thank you and see you there!<br>
                <strong style="font-family: 'Fraunces', Georgia, serif; color: #ffe705; font-size: 15px;">— Luckytin Fan Support team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer matching website footer -->
          <tr>
            <td style="padding: 22px 36px; background-color: #0f2038; border-top: 1px solid rgba(235, 220, 179, 0.15); text-align: center;">
              <p style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; text-transform: uppercase; color: rgba(247, 244, 238, 0.7); margin: 0 0 6px 0; line-height: 1.5;">
                Crafted with 💛💙 by Lumities for Maloi, Jhoanna, BINI &amp; Blooms.
              </p>
              <p style="font-size: 10px; color: rgba(247, 244, 238, 0.4); margin: 0;">
                LuckyTin Fan Support © 2026 • Forgotten Island Movie Block Screening
              </p>
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
          subject: `Complete your Block Screening Payment ${id ? `[${id}] ` : ''}- Forgotten Island`,
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
    console.log(`[Email Dispatch - Key Not Configured] Sent payment link email with ID ${id} to ${email} for registrant ${nickname}`)
  }

  return { success: true, id, email, nickname }
})
