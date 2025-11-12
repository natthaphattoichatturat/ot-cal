'use client'

import { useEffect, useState, useRef } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  queryType?: 'database' | 'system_usage' | 'general'
}

export default function AIChatbotPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LINE_CONFIG.liff.aiChatbot })

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        // Add welcome message
        setMessages([
          {
            id: '1',
            text: 'สวัสดีค่ะ ฉันคือผู้ช่วย AI ของระบบ HR\n\nคุณสามารถถามฉันได้เกี่ยวกับ:\n• ข้อมูลพนักงาน (เช่น วันนี้มีใครลาบ้าง)\n• การใช้งานระบบ (เช่น จะเพิ่มพนักงานใหม่ทำอย่างไร)\n• คำถามทั่วไป\n\nลองถามฉันได้เลยค่ะ!',
            isUser: false,
            timestamp: new Date(),
          },
        ])

        setLoading(false)
      } catch (err) {
        console.error('LIFF initialization failed', err)
        setLoading(false)
      }
    }

    initLiff()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!inputText.trim() || sending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setSending(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.response,
          isUser: false,
          timestamp: new Date(),
          queryType: result.queryType,
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.error || 'ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'ขออภัย ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getQueryTypeColor = (type?: string) => {
    switch (type) {
      case 'database':
        return 'bg-blue-100 text-blue-700'
      case 'system_usage':
        return 'bg-green-100 text-green-700'
      case 'general':
        return 'bg-gray-100 text-gray-700'
      default:
        return ''
    }
  }

  const getQueryTypeLabel = (type?: string) => {
    switch (type) {
      case 'database':
        return 'ข้อมูลระบบ'
      case 'system_usage':
        return 'การใช้งาน'
      case 'general':
        return 'ทั่วไป'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">AI Assistant</h1>
            <p className="text-xs text-gray-600">ผู้ช่วย HR อัจฉริยะ</p>
          </div>
          {sending && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-md'
                }`}
              >
                {!message.isUser && message.queryType && (
                  <div className={`text-xs px-2 py-1 rounded-full mb-2 inline-block ${getQueryTypeColor(message.queryType)}`}>
                    {getQueryTypeLabel(message.queryType)}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์ข้อความ..."
              disabled={sending}
              rows={2}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              className="px-6 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI อาจให้ข้อมูลที่ไม่ถูกต้อง กรุณาตรวจสอบข้อมูลสำคัญอีกครั้ง
          </p>
        </div>
      </div>
    </div>
  )
}
