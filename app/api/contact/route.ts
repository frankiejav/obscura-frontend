import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Obscura Labs <onboarding@resend.dev>', // Use your verified domain later
      to: recipient,
      replyTo: email,
      subject: `Contact Form: ${reasonLabel} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #666; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 10px 0;"><strong>Organization:</strong> ${organization || 'N/A'}</p>
            <p style="margin: 10px 0;"><strong>Reason:</strong> ${reasonLabel}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Message:</h3>
            <p style="white-space: pre-wrap; background: #fff; padding: 15px; border-left: 4px solid #666;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This email was sent from the Obscura Labs contact form.
          </p>
        </div>
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

