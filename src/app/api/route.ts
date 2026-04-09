import { NextRequest, NextResponse } from 'next/server'

// ─── Types ────────────────────────────────────────────────────────────────────

type RegistrationPayload = {
  firstName: string
  lastName: string
  email: string
  phoneNo: string
}

type ValidationResult =
  | { valid: true; data: RegistrationPayload }
  | { valid: false; errors: Record<string, string> }

// ─── Server-side validation ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/

function validatePayload(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, errors: { _root: 'Invalid request body.' } }
  }

  const raw = body as Record<string, unknown>
  const errors: Record<string, string> = {}

  const firstName = typeof raw.firstName === 'string' ? raw.firstName.trim() : ''
  const lastName = typeof raw.lastName === 'string' ? raw.lastName.trim() : ''
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : ''
  const phoneNo = typeof raw.phoneNo === 'string' ? raw.phoneNo.trim() : ''

  if (!firstName) errors.firstName = 'First name is required.'
  else if (firstName.length < 2) errors.firstName = 'First name must be at least 2 characters.'
  else if (firstName.length > 50) errors.firstName = 'First name must be 50 characters or fewer.'

  if (!lastName) errors.lastName = 'Last name is required.'
  else if (lastName.length < 2) errors.lastName = 'Last name must be at least 2 characters.'
  else if (lastName.length > 50) errors.lastName = 'Last name must be 50 characters or fewer.'

  if (!email) errors.email = 'Email address is required.'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Please enter a valid email address.'

  if (!phoneNo) errors.phoneNo = 'Phone number is required.'
  else if (!PHONE_REGEX.test(phoneNo.replace(/[\s\-()]/g, ''))) {
    errors.phoneNo = 'Please enter a valid phone number.'
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, data: { firstName, lastName, email, phoneNo } }
}

// ─── POST /api/registration ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON in request body.' },
      { status: 400 },
    )
  }

  const result = validatePayload(body)

  if (!result.valid) {
    return NextResponse.json(
      { message: 'Validation failed.', errors: result.errors },
      { status: 422 },
    )
  }

  const { firstName, lastName, email, phoneNo } = result.data

  /**
   * Integration point — replace this block with your actual downstream call:
   *
   * Examples:
   *   - CRM: await salesforceClient.createLead({ firstName, lastName, email, phoneNo })
   *   - Email service: await sendgrid.addContact({ email, firstName, lastName })
   *   - Database: await db.insert('registrations', { ... })
   *   - Webhook: await fetch(process.env.WEBHOOK_URL!, { method: 'POST', body: JSON.stringify({...}) })
   */
  console.info('[registration] New registration received:', {
    firstName,
    lastName,
    email,
    phoneNo,
    receivedAt: new Date().toISOString(),
  })

  return NextResponse.json(
    {
      message: 'Registration successful.',
      data: { firstName, lastName, email },
    },
    { status: 201 },
  )
}

// ─── Method guard ─────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed.' },
    { status: 405, headers: { Allow: 'POST' } },
  )
}