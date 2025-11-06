// LINE OA Configuration
export const LINE_CONFIG = {
  // Employee LINE OA
  channelId: '2008436527',
  channelSecret: '8c524fd6d33e4c964fac2e5bee10ac4f',
  channelAccessToken: 'w15cxvoC+7lGeUWYywdZb1NNU1hNtMxm4Rv92+9IokWzMUECy5NilG/EW8ZXWU6wbxvduQf10nIfYuYnu2ZShaKgKT1iiLJYdUo1XcFbzv6U0XJ1w0Sxn6yrQ8JTLzi+wLadAxlWEDxt4YiwDZFgxQdB04t89/1O/w1cDnyilFU=',

  // LINE Login
  loginChannelId: '2008436560',
  loginChannelSecret: 'c0f5746d2541552c7c006afcddeb2fb0',

  // LIFF IDs
  liff: {
    employeeRegistration: '2008436560-GMZNa4OA', // LIFF 1: Employee registration
    adminRegistration: '2008436560-lygzv9WO',    // LIFF 2: Admin registration
    leaveRequest: '2008436560-J06MeXN4',          // LIFF 3: Leave request
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
