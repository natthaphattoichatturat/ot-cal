import { NextRequest, NextResponse } from 'next/server'
import { LINE_CONFIG, replyHRLineMessage } from '@/lib/lineConfig'
import { checkHRPermission } from '@/lib/hrPermission'
import crypto from 'crypto'

// Verify LINE signature
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', LINE_CONFIG.hrChannelSecret)
    .update(body)
    .digest('base64')
  return hash === signature
}

// Handle text message from user
async function handleTextMessage(replyToken: string, text: string, userId: string) {
  try {
    // Check HR permission first
    const permission = await checkHRPermission(userId)

    if (!permission.allowed) {
      // User doesn't have HR permission
      await replyHRLineMessage(replyToken, [
        {
          type: 'text',
          text: permission.error || 'คุณไม่มีสิทธิ์ใช้งานระบบ HR\n\nระบบนี้เฉพาะพนักงานแผนก admin_etec เท่านั้น',
        },
      ])
      return
    }

    // Call chatbot API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://ot-cal-sdht.vercel.app'}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
      }),
    })

    const result = await response.json()

    if (result.success) {
      // Send response via LINE
      await replyHRLineMessage(replyToken, [
        {
          type: 'text',
          text: result.response,
        },
      ])
    } else {
      await replyHRLineMessage(replyToken, [
        {
          type: 'text',
          text: 'ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        },
      ])
    }
  } catch (error) {
    console.error('Error handling text message:', error)
    try {
      await replyHRLineMessage(replyToken, [
        {
          type: 'text',
          text: 'ขออภัย เกิดข้อผิดพลาดในระบบ',
        },
      ])
    } catch (replyError) {
      console.error('Error sending error message:', replyError)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature')

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'No signature' },
        { status: 400 }
      )
    }

    // Verify signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)

    // Handle webhook events
    for (const event of data.events) {
      const { type, replyToken, message, source } = event

      if (type === 'message' && message.type === 'text') {
        // Handle text message
        await handleTextMessage(replyToken, message.text, source.userId)
      }
      // Can add more event handlers here (postback, follow, unfollow, etc.)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('HR Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'HR LINE OA Webhook is active',
  })
}
