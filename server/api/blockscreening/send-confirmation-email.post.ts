import { createError, defineEventHandler, getHeader, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const adminPassword = process.env.BLOCKSCREENING_ADMIN_PASSWORD || 'luckytin02'
  if (getHeader(event, 'x-admin-password') !== adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please provide valid admin credentials.' })
  }

  const { id, email, fullName, nickname, childRegistration, minorName, relationship } = await readBody(event)
  if (!email || !fullName) {
    throw createError({ statusCode: 400, statusMessage: 'Recipient email and full name are required.' })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const senderEmail = process.env.MAIL_FROM || 'Luckytin Fan Support <noreply@luckytinfs.com>'

  let seatOptionLabel = 'Sponsor a child (Bahay Tuluyan) 🐥'
  if (childRegistration === 'sponsor_two' || childRegistration === 'sponsor_2') {
    seatOptionLabel = 'Sponsor two children (Bahay Tuluyan) 🐥🐥'
  }
  else if (childRegistration === 'bring') {
    seatOptionLabel = `Bring own child (${minorName || 'Child'}${relationship ? ` - ${relationship}` : ''}) 🎒`
  }

  const greetingName = nickname || fullName

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verified • Forgotten Island Movie Pass</title>
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
              <div style="margin-top: 10px; display: inline-block; background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); padding: 4px 14px; border-radius: 9999px;">
                <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #4ade80;">
                  ✓ Payment Verified &amp; Confirmed
                </span>
              </div>
            </td>
          </tr>

          <!-- Intro Message -->
          <tr>
            <td style="padding: 28px 36px 16px 36px; line-height: 1.6; color: #dbe4f2; font-size: 15px;">
              <p style="font-family: 'Fraunces', Georgia, serif; font-size: 20px; font-weight: 700; color: #f7f4ee; margin-top: 0; margin-bottom: 12px;">
                Hey, ${greetingName}!
              </p>
              <p style="margin: 0; line-height: 1.6; color: #dbe4f2;">
                We’re happy to confirm that your registration and payment for Luckytin Fan Support's <strong>‘Forgotten Island’ Block Screening</strong> have been successfully verified. Check out the final event details below:
              </p>
            </td>
          </tr>

          <!-- TICKET COMPONENT (Paper & Beach aesthetic matching website) -->
          <tr>
            <td style="padding: 12px 36px 24px 36px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f4ee; border: 2px solid #ebdcb3; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); color: #141200;">
                
                <!-- Ticket Top Header -->
                <tr>
                  <td style="background-color: #0f2038; padding: 14px 22px; border-bottom: 2px dashed #ebdcb3;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left">
                          <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #ffe705; font-weight: 700;">
                            🎟️ OFFICIAL ADMISSION PASS
                          </span>
                        </td>
                        <td align="right">
                          <span style="background-color: #ffe705; color: #0f2038; font-family: 'Courier Prime', Courier, monospace; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                            CINEMA 1
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Ticket Body -->
                <tr>
                  <td style="padding: 22px 24px;">
                    
                    <!-- Date & Time -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 12px;">
                          <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8c7456; font-weight: 700; display: block; margin-bottom: 3px;">Date</span>
                          <strong style="font-family: 'Fraunces', Georgia, serif; font-size: 16px; color: #0f2038;">October 3, 2026</strong>
                        </td>
                        <td width="50%" valign="top" style="padding-left: 12px;">
                          <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8c7456; font-weight: 700; display: block; margin-bottom: 3px;">Time</span>
                          <strong style="font-family: 'Fraunces', Georgia, serif; font-size: 16px; color: #0f2038;">3:00 PM</strong>
                        </td>
                      </tr>
                    </table>

                    <!-- Location -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px; border-top: 1px solid #ebdcb3; padding-top: 12px;">
                      <tr>
                        <td valign="top">
                          <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8c7456; font-weight: 700; display: block; margin-bottom: 3px;">Location</span>
                          <strong style="font-family: 'Fraunces', Georgia, serif; font-size: 16px; color: #0f2038;">SM Aura Cinema 1</strong>
                        </td>
                      </tr>
                    </table>

                    <!-- Name & Registration ID -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px; border-top: 1px solid #ebdcb3; padding-top: 12px;">
                      <tr>
                        <td width="55%" valign="top" style="padding-right: 10px;">
                          <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8c7456; font-weight: 700; display: block; margin-bottom: 3px;">Name</span>
                          <strong style="font-size: 15px; color: #0f2038; display: block;">${fullName}</strong>
                          ${nickname ? `<span style="font-size: 12px; color: #6d6252;">(${nickname})</span>` : ''}
                        </td>
                        <td width="45%" valign="top" style="padding-left: 10px;">
                          <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8c7456; font-weight: 700; display: block; margin-bottom: 3px;">Registration ID</span>
                          <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 15px; font-weight: 700; color: #1f4072; background-color: #dfe8f6; border: 1px solid #bfd1ee; padding: 4px 8px; border-radius: 6px; display: inline-block;">
                            ${id || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Seat Option -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #ebdcb3; padding-top: 12px;">
                      <tr>
                        <td valign="top">
                          <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8c7456; font-weight: 700; display: block; margin-bottom: 3px;">Seat Option</span>
                          <strong style="font-size: 14px; color: #0f2038;">${seatOptionLabel}</strong>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Ticket Perforated Bottom Ribbon -->
                <tr>
                  <td style="background-color: #ebdcb3; padding: 10px 20px; border-top: 1px dashed #cbbba1; text-align: center;">
                    <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #574e00; font-weight: 700;">
                      FORGOTTEN ISLAND • LTFS EXCLUSIVE PASS
                    </span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Important Reminders Section -->
          <tr>
            <td style="padding: 10px 36px 30px 36px;">
              <h3 style="font-family: 'Fraunces', Georgia, serif; font-size: 16px; font-weight: 700; color: #ffe705; letter-spacing: 0.5px; margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                📌 Important Reminders:
              </h3>

              <div style="background-color: rgba(15, 32, 56, 0.7); border: 1px solid #284777; border-radius: 12px; padding: 18px 20px; font-size: 13px; line-height: 1.6; color: #dbe4f2;">
                <p style="margin: 0 0 12px 0;">
                  <strong style="color: #9fbbe5;">• Event Day Check-in:</strong> Please present this email, together with a valid ID, upon check-in. The name on your ID should match the name registered for the event.
                </p>
                <p style="margin: 0 0 12px 0;">
                  <strong style="color: #9fbbe5;">• Slot Transfer:</strong> If you can no longer attend, please notify Luckytin Fan Support on or before <strong>September 27, 2026</strong>. Slots can only be transferred once, subject to LTFS approval. Requests done after the deadline would not be accomodated, except for genuine emergency situations.
                </p>
                <p style="margin: 0;">
                  <strong style="color: #9fbbe5;">• Free seating:</strong> This is strictly a free-seating event. If you are bringing a child, please make sure that you are sitting together at all times. For those sponsoring children, you don't have to sit with your sponsored child as they have designated seats prepared for them.
                </p>
              </div>

              <p style="margin-top: 24px; margin-bottom: 0; font-size: 14px; line-height: 1.6; color: #dbe4f2;">
                Thank you so much for joining us on this special event. See you there!<br>
                <strong style="font-family: 'Fraunces', Georgia, serif; color: #ffe705; font-size: 15px;">— Luckytin Fan Support Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer matching website footer -->
          <tr>
            <td style="padding: 22px 36px; background-color: #0f2038; border-top: 1px solid rgba(235, 220, 179, 0.15); text-align: center;">
              <p style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; text-transform: uppercase; tracking-wider: 1px; color: rgba(247, 244, 238, 0.7); margin: 0 0 6px 0; line-height: 1.5;">
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
          subject: `Payment Confirmed & Admission Pass [${id || 'LTFS'}] - Forgotten Island Block Screening`,
          html: htmlContent,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Resend API Error (Confirmation):', err)
        throw createError({
          statusCode: res.status,
          statusMessage: err.message || 'Failed to dispatch confirmation email via Resend API.',
        })
      }
    }
    catch (error: any) {
      console.error('Confirmation email error:', error)
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Failed to send confirmation email.',
      })
    }
  }
  else {
    console.log(`[Email Dispatch - Key Not Configured] Sent payment confirmation email with Ticket to ${email} for registrant ${fullName} (${id})`)
  }

  return { success: true, id, email, fullName }
})
