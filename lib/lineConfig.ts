// LINE OA Configuration
export const LINE_CONFIG = {
  // Employee LINE OA
  channelId: '2008436527',
  channelSecret: '8c524fd6d33e4c964fac2e5bee10ac4f',
  channelAccessToken: 'w15cxvoC+7lGeUWYywdZb1NNU1hNtMxm4Rv92+9IokWzMUECy5NilG/EW8ZXWU6wbxvduQf10nIfYuYnu2ZShaKgKT1iiLJYdUo1XcFbzv6U0XJ1w0Sxn6yrQ8JTLzi+wLadAxlWEDxt4YiwDZFgxQdB04t89/1O/w1cDnyilFU=',

  // LINE Login
  loginChannelId: '2008436560',
  loginChannelSecret: 'c0f5746d2541552c7c006afcddeb2fb0',

  // HR LINE OA (for HR admin functions)
  hrChannelId: '2008409511',
  hrChannelSecret: '99b6f4656a2037e14c8975b5fb61916b',
  hrChannelAccessToken: '1YxuekdODxH0PKgSl+xLpXYrnViKidJAC64ZirqFXHv68FiPl4ybkqTnz7W+gwx24ysl0vj5xTsLg8uEXUmTNSGEBA7QbzL6R3xA8BsscP5ov5eWXSCjSuo5G9LIbNvAlgWOEzVQWok1EMzy/csE9wdB04t89/1O/w1cDnyilFU=',

  // LIFF IDs
  liff: {
    employeeRegistration: '2008436560-GMZNa4OA', // LIFF 1: Employee registration
    adminRegistration: '2008436560-lygzv9WO',    // LIFF 2: Admin registration
    leaveRequest: '2008436560-J06MeXN4',          // LIFF 3: Leave request
    attendanceCheckin: '2008436560-DQqw6EPV',     // LIFF 4: Attendance check-in/out
    hrAdmin: '2008409515-1Ew4WMVL',               // LIFF 5: HR Admin management
    otViewer: '2008409515-EDXmdnJG',              // LIFF 6: OT hours viewer
    employeeOtViewer: '2008436560-WZqNLp6Z',      // LIFF 7: Employee OT viewer (for employees)
    aiPerformance: '2008436560-wJ3Mnl7g',         // LIFF 8: AI Performance evaluation (mock)
    hrDashboard: '2008409515-XnPV2b48',           // LIFF 9: HR Dashboard with AI analytics
    employeeMeeting: '2008409515-V336WkL9',       // LIFF 10: Schedule employee meetings
    aiChatbot: '2008409515-JPzQG38r',             // LIFF 11: AI Chatbot
  },

  // Admin password
  adminPassword: 'ecloude_tecHR2025!',

  // Messaging API endpoint
  messagingApiEndpoint: 'https://api.line.me/v2/bot/message',
}

// Helper function to send LINE message
export async function sendLineMessage(to: string, messages: any[]) {
  const response = await fetch(`${LINE_CONFIG.messagingApiEndpoint}/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CONFIG.channelAccessToken}`,
    },
    body: JSON.stringify({
      to,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send LINE message: ${error}`)
  }

  return response.json()
}

// Helper function to send reply message
export async function replyLineMessage(replyToken: string, messages: any[]) {
  const response = await fetch(`${LINE_CONFIG.messagingApiEndpoint}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CONFIG.channelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to reply LINE message: ${error}`)
  }

  return response.json()
}

// Helper function to send HR LINE message
export async function sendHRLineMessage(to: string, messages: any[]) {
  const response = await fetch(`${LINE_CONFIG.messagingApiEndpoint}/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CONFIG.hrChannelAccessToken}`,
    },
    body: JSON.stringify({
      to,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send HR LINE message: ${error}`)
  }

  return response.json()
}

// Helper function to reply HR LINE message
export async function replyHRLineMessage(replyToken: string, messages: any[]) {
  const response = await fetch(`${LINE_CONFIG.messagingApiEndpoint}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CONFIG.hrChannelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to reply HR LINE message: ${error}`)
  }

  return response.json()
}
