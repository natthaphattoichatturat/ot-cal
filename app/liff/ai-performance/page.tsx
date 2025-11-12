'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

interface PerformanceData {
  score: number
  attendance: number
  productivity: number
  quality: number
  teamwork: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
}

export default function AIPerformancePage() {
  const [loading, setLoading] = useState(true)
  const [lineUserId, setLineUserId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [performance, setPerformance] = useState<PerformanceData | null>(null)

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LINE_CONFIG.liff.aiPerformance })

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        const profile = await liff.getProfile()
        setLineUserId(profile.userId)
        setEmployeeName(profile.displayName)

        // Generate mock performance data
        const mockPerformance: PerformanceData = {
          score: 85,
          attendance: 92,
          productivity: 88,
          quality: 82,
          teamwork: 90,
          strengths: [
            'เข้างานตรงเวลาสม่ำเสมอ',
            'มีความรับผิดชอบต่องานที่ได้รับมอบหมาย',
            'ทำงานร่วมกับทีมได้ดี',
            'มีความคิดสร้างสรรค์ในการแก้ปัญหา'
          ],
          improvements: [
            'ควรเพิ่มทักษะในการสื่อสารกับลูกค้า',
            'ควรพัฒนาทักษะการใช้เครื่องมือใหม่ๆ',
            'ควรมีการจัดการเวลาให้มีประสิทธิภาพมากขึ้น'
          ],
          recommendations: [
            'แนะนำให้เข้าร่วมอบรมหลักสูตร Customer Service Excellence',
            'แนะนำให้ศึกษาเพิ่มเติมเกี่ยวกับเทคโนโลยีใหม่ๆ ในสายงาน',
            'แนะนำให้ใช้เครื่องมือจัดการเวลาเพื่อเพิ่มประสิทธิภาพการทำงาน'
          ]
        }

        setPerformance(mockPerformance)
        setLoading(false)
      } catch (err) {
        console.error('LIFF initialization failed', err)
        setLoading(false)
      }
    }

    initLiff()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังวิเคราะห์ผลการทำงาน...</p>
        </div>
      </div>
    )
  }

  if (!performance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50'
    if (score >= 80) return 'bg-blue-50'
    if (score >= 70) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">การประเมินผลการทำงาน</h1>
              <p className="text-sm text-gray-600">{employeeName}</p>
              <p className="text-xs text-gray-500">วิเคราะห์โดย AI</p>
            </div>
          </div>

          {/* Overall Score */}
          <div className={`${getScoreBg(performance.score)} rounded-xl p-6 text-center`}>
            <p className="text-sm font-medium text-gray-600 mb-2">คะแนนรวม</p>
            <p className={`text-6xl font-bold ${getScoreColor(performance.score)}`}>
              {performance.score}
            </p>
            <p className="text-sm text-gray-600 mt-2">จาก 100 คะแนน</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">รายละเอียดผลการประเมิน</h2>
          <div className="space-y-4">
            {[
              { label: 'การเข้างาน', value: performance.attendance },
              { label: 'ประสิทธิภาพการทำงาน', value: performance.productivity },
              { label: 'คุณภาพงาน', value: performance.quality },
              { label: 'การทำงานร่วมกับทีม', value: performance.teamwork }
            ].map((metric, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.value >= 90 ? 'bg-green-500' :
                      metric.value >= 80 ? 'bg-blue-500' :
                      metric.value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">จุดแข็ง</h2>
          </div>
          <ul className="space-y-2">
            {performance.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">จุดที่ควรพัฒนา</h2>
          </div>
          <ul className="space-y-2">
            {performance.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">คำแนะนำ</h2>
          </div>
          <ul className="space-y-2">
            {performance.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Note */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>หมายเหตุ:</strong> ข้อมูลนี้เป็นการประเมินเบื้องต้นโดยระบบ AI จากข้อมูลการทำงานของคุณ
            สำหรับการประเมินอย่างเป็นทางการ โปรดติดต่อฝ่ายทรัพยากรบุคคล
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>ระบบประเมินผลการทำงาน</p>
          <p>© 2025 E-Cloud Technology</p>
        </div>
      </div>
    </div>
  )
}
