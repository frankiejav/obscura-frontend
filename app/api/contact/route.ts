import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { join } from 'path'

const resend = new Resend(process.env.RESEND_API_KEY)

// Get base64 encoded logo
function getLogoDataUri(): string {
  try {
    const logoPath = join(process.cwd(), 'public', 'images', 'obscura-logo-white.png')
    const logoBuffer = readFileSync(logoPath)
    const base64 = logoBuffer.toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    // Fallback to empty string if logo can't be loaded
    console.error('Error loading logo:', error)
    return ''
  }
}

const contactReasons = [
  { value: "enterprise", label: "Enterprise Sales" },
  { value: "research", label: "Research Access Request" },
  { value: "law-enforcement", label: "Law Enforcement Access" },
  { value: "support", label: "Technical Support" },
  { value: "compliance", label: "Compliance & Legal" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "other", label: "Other" },
]

export async function POST(request: NextRequest) {
  try {
    const { name, email, organization, reason, message } = await request.json()

    // Validate required fields
    if (!name || !email || !reason || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determine recipient based on reason
    const recipientMap: Record<string, string> = {
      'enterprise': 'sales@obscuralabs.io',
      'research': 'research@obscuralabs.io',
      'law-enforcement': 'law-enforcement@obscuralabs.io',
      'support': 'contact@obscuralabs.io',
      'compliance': 'contact@obscuralabs.io',
      'partnership': 'sales@obscuralabs.io',
      'other': 'contact@obscuralabs.io'
    }

    const recipient = recipientMap[reason] || 'contact@obscuralabs.io'
    const reasonLabel = contactReasons.find(r => r.value === reason)?.label || reason

    // Use environment variable for from address, or default to verified domain
    const fromAddress = process.env.RESEND_FROM_ADDRESS || 'Obscura Labs <contact@obscuralabs.io>'
    
    // Get base64 encoded logo for email
    const logoDataUri = getLogoDataUri()

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipient,
      replyTo: email,
      subject: `Contact Form: ${reasonLabel} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #171717; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #171717 0%, #262626 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #2a2a2a;">
                      <img src="${logoDataUri}" alt="Obscura Labs" style="max-width: 180px; height: auto; display: block; margin: 0 auto;" />
                    </td>
                  </tr>
                  
                  <!-- Title Section -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                        New Contact Form Submission
                      </h1>
                      <p style="margin: 12px 0 0; color: #a3a3a3; font-size: 16px; font-weight: 400;">
                        ${reasonLabel}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Contact Information Card -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #262626; border-radius: 8px; border: 1px solid #2a2a2a;">
                        <tr>
                          <td style="padding: 30px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding-bottom: 16px; border-bottom: 1px solid #2a2a2a;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="color: #a3a3a3; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px;">Name</td>
                                    </tr>
                                    <tr>
                                      <td style="color: #ffffff; font-size: 16px; font-weight: 500; padding-top: 4px;">${name}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0; border-bottom: 1px solid #2a2a2a;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="color: #a3a3a3; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px;">Email</td>
                                    </tr>
                                    <tr>
                                      <td style="padding-top: 4px;">
                                        <a href="mailto:${email}" style="color: #60a5fa; font-size: 16px; font-weight: 500; text-decoration: none;">${email}</a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0; border-bottom: 1px solid #2a2a2a;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="color: #a3a3a3; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px;">Organization</td>
                                    </tr>
                                    <tr>
                                      <td style="color: #ffffff; font-size: 16px; font-weight: 500; padding-top: 4px;">${organization || 'Not provided'}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-top: 16px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="color: #a3a3a3; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px;">Reason for Contact</td>
                                    </tr>
                                    <tr>
                                      <td style="color: #ffffff; font-size: 16px; font-weight: 500; padding-top: 4px;">${reasonLabel}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Message Section -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="color: #ffffff; font-size: 18px; font-weight: 600; padding-bottom: 16px;">Message</td>
                        </tr>
                        <tr>
                          <td style="background-color: #262626; border-left: 4px solid #60a5fa; border-radius: 6px; padding: 24px; border: 1px solid #2a2a2a;">
                            <p style="margin: 0; color: #e5e5e5; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #171717; padding: 30px 40px; border-top: 1px solid #2a2a2a; text-align: center;">
                      <p style="margin: 0; color: #737373; font-size: 12px; line-height: 1.5;">
                        This email was sent from the Obscura Labs contact form.<br>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.obscuralabs.io'}" style="color: #60a5fa; text-decoration: none;">Visit Obscura Labs</a>
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
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

