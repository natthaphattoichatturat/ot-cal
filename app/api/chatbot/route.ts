import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const DATABASE_SCHEMA = `
# Database Schema for OT Calculation System

## Tables:

### employees
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR(20) UNIQUE - Employee code
- name: VARCHAR(255) - Full name
- department: VARCHAR(100) - Department name
- perday_salary: DECIMAL(10,2) - Daily salary
- perhr_salary: DECIMAL(10,2) - Hourly salary
- bank_id: INTEGER - Bank code
- bank_account: INTEGER - Bank account number
- identity_id: VARCHAR(20) - ID card number
- line_id: TEXT - LINE User ID
- status: VARCHAR - 'active' or 'removed'
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### daily_attendance
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR(20) - FK to employees
- work_date: DATE - Work date
- check_in_time: TIME - Clock in time
- check_out_time: TIME - Clock out time
- scheduled_in_time: TIME - Scheduled start time
- scheduled_out_time: TIME - Scheduled end time
- actual_hours: DECIMAL(5,2) - Actual work hours
- ot_hours: DECIMAL(5,2) - Overtime hours
- is_holiday: BOOLEAN - Is holiday flag
- is_leave: BOOLEAN - Is on leave flag
- late: BOOLEAN - Late flag
- late_hours: DECIMAL(5,2) - Late hours
- notes: TEXT - Notes
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### leave_records
- id: SERIAL PRIMARY KEY
- employee_id: VARCHAR(20) - FK to employees
- leave_date: DATE - Leave date
- leave_type: VARCHAR(50) - 'sick', 'vacation', 'personal', etc.
- reason: TEXT - Leave reason
- leave_able: BOOLEAN - Approval status
- rejected_reason: TEXT - Rejection reason if any
- created_by: VARCHAR(100) - Created by
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### special_holidays
- id: SERIAL PRIMARY KEY
- holiday_date: DATE - Holiday date
- holiday_name: VARCHAR(100) - Holiday name
- is_national: BOOLEAN - National holiday flag
- description: TEXT - Description
- created_at: TIMESTAMP

## Example Queries:

### Count employees on leave today
SELECT COUNT(*) FROM leave_records WHERE leave_date = CURRENT_DATE AND leave_able = true;

### Get total OT hours for an employee in a date range
SELECT SUM(ot_hours) FROM daily_attendance WHERE employee_id = 'EMP001' AND work_date BETWEEN '2025-01-01' AND '2025-01-31';

### List employees by department
SELECT employee_id, name, department FROM employees WHERE status = 'active' ORDER BY department;

### Get attendance rate for an employee
SELECT
  COUNT(*) as total_days,
  SUM(CASE WHEN check_in_time IS NOT NULL THEN 1 ELSE 0 END) as attended_days
FROM daily_attendance
WHERE employee_id = 'EMP001' AND work_date BETWEEN '2025-01-01' AND '2025-01-31';
`

const SYSTEM_USAGE_GUIDE = `
# System Usage Guide

## Employee Management
- Add employee: Go to /employees/add page
- Edit employee: Go to /employees/edit page or /employees/[employee_id] page
- Remove employee: Go to /employees/remove page
- Import employees: Go to /employees/import page

## Attendance and OT
- View OT hours: Go to /liff/ot-viewer (for HR) or /liff/employee-ot-viewer (for employees)
- Check in/out: Use /liff/attendance-checkin LIFF app
- View attendance: Main dashboard or attendance pages

## Leave Management
- Request leave: Use /liff/leave-request LIFF app
- Approve/reject leave: HR receives requests via LINE and can approve through the web interface at /leave

## HR Functions
- HR Dashboard: /liff/hr-dashboard - View overall statistics and AI insights
- Schedule meetings: /liff/employee-meeting - Schedule meetings with employees
- Employee reports: /liff/hr-dashboard - View department and individual performance

## LINE Integration
- Employee LINE OA: For employees to request leave, check in/out, view their OT
- HR LINE OA: For HR to receive notifications, access HR functions, and use AI chatbot
`

async function normalizeInput(userInput: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `You are an input normalizer. Your job is to take user input (which may be in Thai or English, may have typos, may be informal) and normalize it into a clear, well-formed question or statement that can be easily classified and processed by another AI system.

Rules:
- Fix typos and grammar
- Expand abbreviations (e.g., "OT" -> "overtime", "พนง" -> "พนักงาน")
- Keep the original intent and meaning
- Keep it concise and clear
- Use formal language
- Preserve Thai language if input is in Thai

Example:
Input: "วันนี้มีใครลาป่วยบ้างครับ"
Output: "วันนี้มีพนักงานคนไหนลาป่วยบ้าง"

Input: "how to add new emp?"
Output: "How do I add a new employee?"`,
      },
      {
        role: 'user',
        content: userInput,
      },
    ],
    temperature: 0.3,
  })

  return response.choices[0].message.content || userInput
}

async function classifyQuery(normalizedInput: string): Promise<'database' | 'system_usage' | 'general'> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `You are a query classifier. Classify the user's question into one of three categories:

1. "database" - Questions about data in the system (employees, attendance, OT hours, leave records, statistics, counts, etc.)
   Examples: "วันนี้มีใครลาบ้าง", "พนักงานแผนกผลิตมีกี่คน", "OT ของพนักงาน EMP001 เดือนนี้เท่าไร"

2. "system_usage" - Questions about how to use the system (how to add employees, where to find features, how to approve leave, etc.)
   Examples: "จะเพิ่มพนักงานใหม่ทำอย่างไร", "อยากดูรายงาน OT ต้องเข้าหน้าไหน", "How do I import employees?"

3. "general" - General questions not related to the system or its data
   Examples: "สภาพอากาศวันนี้เป็นอย่างไร", "ราคาทองวันนี้", "What is the capital of Thailand?"

Respond with ONLY ONE WORD: either "database", "system_usage", or "general".`,
      },
      {
        role: 'user',
        content: normalizedInput,
      },
    ],
    temperature: 0.1,
  })

  const classification = (response.choices[0].message.content || 'general').toLowerCase().trim()
  if (classification === 'database' || classification === 'system_usage') {
    return classification as 'database' | 'system_usage'
  }
  return 'general'
}

async function generateSQL(normalizedInput: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      {
        role: 'system',
        content: `You are a SQL query generator for a PostgreSQL database. Generate ONLY the SQL query, no explanations.

Database Schema:
${DATABASE_SCHEMA}

Rules:
- Generate valid PostgreSQL SQL only
- Use proper joins and WHERE clauses
- Always filter out removed employees (status = 'active') unless specifically asked about removed employees
- Use CURRENT_DATE for "today" queries
- Format dates as 'YYYY-MM-DD'
- Return SELECT queries only, no INSERT/UPDATE/DELETE
- Keep queries efficient
- Use Thai field values where appropriate

Respond with ONLY the SQL query, nothing else.`,
      },
      {
        role: 'user',
        content: normalizedInput,
      },
    ],
    temperature: 0.2,
  })

  return response.choices[0].message.content || ''
}

async function executeSQL(sqlQuery: string): Promise<any[]> {
  try {
    // Clean up the SQL query
    const cleanQuery = sqlQuery.replace(/```sql/g, '').replace(/```/g, '').trim()

    // Execute the query using Supabase
    // Note: This is a simplified version. In production, you should use proper query builders
    // For now, we'll use a safe approach by parsing the query type

    if (!cleanQuery.toUpperCase().startsWith('SELECT')) {
      throw new Error('Only SELECT queries are allowed')
    }

    const { data, error } = await supabase.rpc('execute_raw_query', { query_text: cleanQuery })

    if (error) {
      console.error('SQL execution error:', error)
      // If RPC doesn't exist, we'll use standard Supabase queries as fallback
      // This is a simplified version - in production you'd need proper query parsing
      return []
    }

    return data || []
  } catch (error) {
    console.error('SQL execution error:', error)
    return []
  }
}

async function generateNaturalLanguageResponse(
  userInput: string,
  queryResult: any[]
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `You are a friendly HR assistant. Convert the database query results into a natural, easy-to-understand response in Thai.

Rules:
- Be concise and clear
- Use Thai language
- Format numbers nicely (use commas for thousands)
- If no data found, say so politely
- Present data in a readable format (use bullet points if multiple items)
- Be professional but friendly`,
      },
      {
        role: 'user',
        content: `User asked: "${userInput}"

Query results: ${JSON.stringify(queryResult, null, 2)}

Please provide a natural language response to the user.`,
      },
    ],
    temperature: 0.7,
  })

  return response.choices[0].message.content || 'ไม่สามารถประมวลผลข้อมูลได้'
}

async function generateSystemUsageResponse(normalizedInput: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful system guide. Answer questions about how to use the OT calculation system.

System Guide:
${SYSTEM_USAGE_GUIDE}

Rules:
- Provide clear, step-by-step instructions
- Include specific page URLs when relevant
- Use Thai language
- Be concise but comprehensive
- Format with bullet points or numbered steps when appropriate
- If you don't know the answer, say so honestly`,
      },
      {
        role: 'user',
        content: normalizedInput,
      },
    ],
    temperature: 0.7,
  })

  return response.choices[0].message.content || 'ขออภัย ไม่สามารถตอบคำถามนี้ได้'
}

async function generateGeneralResponse(normalizedInput: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant. Answer general questions politely and concisely in Thai.

If the question is not related to the HR/OT system, answer it briefly and suggest focusing on work-related questions.`,
      },
      {
        role: 'user',
        content: normalizedInput,
      },
    ],
    temperature: 0.8,
  })

  return response.choices[0].message.content || 'ขออภัย ไม่สามารถตอบคำถามนี้ได้'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message: userMessage } = body

    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุข้อความ' },
        { status: 400 }
      )
    }

    // Step 1: Normalize input
    const normalizedInput = await normalizeInput(userMessage)
    console.log('Normalized:', normalizedInput)

    // Step 2: Classify query
    const queryType = await classifyQuery(normalizedInput)
    console.log('Query type:', queryType)

    let response = ''

    if (queryType === 'database') {
      // Step 3a: Generate SQL
      const sqlQuery = await generateSQL(normalizedInput)
      console.log('Generated SQL:', sqlQuery)

      // Step 4a: Execute SQL
      const queryResult = await executeSQL(sqlQuery)
      console.log('Query result:', queryResult)

      // Step 5a: Generate natural language response
      response = await generateNaturalLanguageResponse(normalizedInput, queryResult)
    } else if (queryType === 'system_usage') {
      // Step 3b: Generate system usage response
      response = await generateSystemUsageResponse(normalizedInput)
    } else {
      // Step 3c: Generate general response
      response = await generateGeneralResponse(normalizedInput)
    }

    return NextResponse.json({
      success: true,
      response,
      queryType,
      normalizedInput,
    })
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    )
  }
}
