'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function PresentationPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-teal-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        ></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">AI-Powered HR Management</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Smart HR System
            <br />
            <span className="bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent">
              via LINE Official Account
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Revolutionize your workforce management with dual LINE OA integration, 
            intelligent automation, and AI-powered analytics
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">2</div>
              <div className="text-sm text-blue-200">LINE OA Channels</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">1s</div>
              <div className="text-sm text-blue-200">Check-in Time</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-blue-200">Automated</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* System Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              System Architecture
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Dual LINE OA Integration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system operates through two specialized LINE Official Accounts, 
              each designed for specific user roles and requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Employee OA */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 border-2 border-green-200 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Employee LINE OA</h3>
              <p className="text-gray-700 mb-6">
                Dedicated channel for workforce operations and daily task management
              </p>
              <ul className="space-y-3">
                {[
                  'One-click attendance check-in/out',
                  'Leave request submission',
                  'Personal OT hours tracking',
                  'Real-time notifications',
                  'Location-based verification'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* HR OA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">HR Management LINE OA</h3>
              <p className="text-gray-700 mb-6">
                Administrative hub with advanced security and comprehensive management tools
              </p>
              <ul className="space-y-3">
                {[
                  'Secure admin authentication',
                  'Complete employee management',
                  'Leave approval workflow',
                  'OT hours monitoring',
                  'AI-powered dashboard',
                  'Employee meeting scheduler',
                  'Intelligent chatbot assistant'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Features Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              For Employees
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Effortless Daily Operations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamlined employee experience with intelligent automation and instant access
            </p>
          </div>

          {/* Feature 1: LINE Interface */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5229.PNG" 
                    alt="Employee LINE OA Interface" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  Step 1
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  LINE Official Account Access
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Employees interact with the system through a familiar LINE interface. 
                  The chat-based design eliminates learning curves and provides instant 
                  access to all workforce management features directly from their smartphone.
                </p>
                <div className="bg-white rounded-xl p-6 border-l-4 border-green-500 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Key Benefits</h4>
                  <ul className="text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      No app installation required
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Instant notifications and updates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Intuitive chat-based interface
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Registration */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  Step 2
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Simple Employee Registration
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Quick and secure onboarding process where employees register using their 
                  13-digit ID card number and full name. The system automatically validates 
                  and links their LINE account to their employee profile.
                </p>
                <div className="bg-white rounded-xl p-6 border-l-4 border-teal-500 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Security Features</h4>
                  <ul className="text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      ID card verification
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      One-time registration process
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      Automatic profile linking
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5218.PNG" 
                    alt="Employee Registration" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: One-Click Check-in */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5237.PNG" 
                    alt="Check-out Success" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5238.PNG" 
                    alt="Check-in Success" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  Step 3
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Automated Attendance in 1 Second
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Revolutionary one-click attendance system that captures check-in/out with 
                  GPS location verification. The system automatically calculates working hours, 
                  overtime, and late arrivals in real-time.
                </p>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-4xl font-bold mb-2">1 Second</div>
                    <div className="text-green-100">Complete check-in/out process</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 border-l-4 border-green-500 shadow-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Automated Features</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        GPS location verification
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Automatic OT calculation
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Late arrival detection
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Instant confirmation message
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Leave Request */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  Step 4
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Intelligent Leave Management
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Submit leave requests with ease through a simple form. The system automatically 
                  notifies HR administrators and sends real-time approval notifications back to 
                  employees through LINE messages.
                </p>
                <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Workflow Automation</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </div>
                      <div className="text-gray-700">
                        <div className="font-medium">Employee submits request</div>
                        <div className="text-sm text-gray-500">Fill form with leave details</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </div>
                      <div className="text-gray-700">
                        <div className="font-medium">HR receives notification</div>
                        <div className="text-sm text-gray-500">Instant alert to admin LINE</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </div>
                      <div className="text-gray-700">
                        <div className="font-medium">Approve/Reject decision</div>
                        <div className="text-sm text-gray-500">One-click approval process</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        4
                      </div>
                      <div className="text-gray-700">
                        <div className="font-medium">Employee gets notified</div>
                        <div className="text-sm text-gray-500">Instant status update</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5216.PNG" 
                    alt="Leave Request Form" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Personal OT Viewer */}
          <div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5219.PNG" 
                    alt="Personal OT Hours Viewer" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  Step 5
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Personal OT Hours Tracking
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Employees can view their overtime hours and work history anytime. The system 
                  provides a clear breakdown of working hours, OT accumulation, and attendance 
                  details with customizable date ranges.
                </p>
                <div className="bg-white rounded-xl p-6 border-l-4 border-teal-500 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Real-time Insights</h4>
                  <ul className="text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      Daily and monthly OT summaries
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      Custom date range selection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      Transparent attendance records
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      Mobile-optimized interface
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HR Features Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-400 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              For HR Administrators
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive Management Platform
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Enterprise-grade tools with advanced security and AI-powered analytics
            </p>
          </div>

          {/* Feature 1: HR LINE Interface */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5239.PNG" 
                    alt="HR LINE OA Interface" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 1
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Dedicated HR LINE Official Account
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Separate LINE OA channel exclusively for HR administrators with enhanced 
                  security measures. Access comprehensive management tools through an intuitive 
                  interface designed for efficient workforce administration.
                </p>
                <div className="bg-blue-800/50 backdrop-blur rounded-xl p-6 border border-blue-400/30">
                  <h4 className="font-semibold mb-3">Management Capabilities</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>Employee data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>OT tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>Reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>AI chatbot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Secure Authentication */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 2
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Secure Admin Registration
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Multi-layer security system with password-protected registration. Only 
                  authorized personnel with the correct admin password can access the HR 
                  management system, ensuring data privacy and system integrity.
                </p>
                <div className="bg-red-900/30 backdrop-blur rounded-xl p-6 border-2 border-red-400/50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-200 mb-2">Security Measures</h4>
                      <ul className="text-blue-200 space-y-1 text-sm">
                        <li>Password-protected access</li>
                        <li>Admin role verification</li>
                        <li>Department-level access control</li>
                        <li>Unauthorized access prevention</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5225.PNG" 
                    alt="Admin Registration" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Employee Management System */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5223.PNG" 
                    alt="Employee Management System" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 3
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Complete Employee Management
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Comprehensive employee database management with full CRUD operations. 
                  View detailed information, edit employee data, add new employees, 
                  and remove personnel with an intuitive 4-panel interface.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-blue-800/50 backdrop-blur rounded-lg p-4 border border-blue-400/30">
                    <div className="text-2xl mb-1">View</div>
                    <div className="text-sm text-blue-200">Employee details & history</div>
                  </div>
                  <div className="bg-blue-800/50 backdrop-blur rounded-lg p-4 border border-blue-400/30">
                    <div className="text-2xl mb-1">Edit</div>
                    <div className="text-sm text-blue-200">Update information</div>
                  </div>
                  <div className="bg-blue-800/50 backdrop-blur rounded-lg p-4 border border-blue-400/30">
                    <div className="text-2xl mb-1">Add</div>
                    <div className="text-sm text-blue-200">New employee onboarding</div>
                  </div>
                  <div className="bg-blue-800/50 backdrop-blur rounded-lg p-4 border border-blue-400/30">
                    <div className="text-2xl mb-1">Remove</div>
                    <div className="text-sm text-blue-200">Employee offboarding</div>
                  </div>
                </div>
                <div className="bg-blue-800/50 backdrop-blur rounded-xl p-4 border border-blue-400/30 text-sm">
                  <div className="flex items-center gap-2 text-blue-200">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Advanced search and filtering capabilities
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Leave Approval */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 4
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Instant Leave Approval Workflow
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Receive immediate notifications when employees submit leave requests. 
                  Review employee information, leave type, date, and reason all in one 
                  card. Approve or reject with a single tap, and the employee receives 
                  instant feedback.
                </p>
                <div className="bg-blue-800/50 backdrop-blur rounded-xl p-6 border border-blue-400/30">
                  <h4 className="font-semibold mb-4">Intelligent Workflow</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Real-time notifications</div>
                        <div className="text-blue-200">Instant alert on new requests</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Complete information display</div>
                        <div className="text-blue-200">All details in one card</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">One-click decision</div>
                        <div className="text-blue-200">Approve or reject instantly</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Automatic employee notification</div>
                        <div className="text-blue-200">Status updates sent immediately</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5221.PNG" 
                    alt="Leave Approval Interface" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: OT Monitoring */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5224.PNG" 
                    alt="OT Hours Monitoring" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 5
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Comprehensive OT Hours Monitoring
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Monitor overtime hours across your entire workforce with powerful filtering 
                  and date range selection. View both summary and detailed views, search by 
                  employee, and analyze OT patterns to optimize workforce planning.
                </p>
                <div className="bg-blue-800/50 backdrop-blur rounded-xl p-6 border border-blue-400/30">
                  <h4 className="font-semibold mb-4">Advanced Analytics</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Summary and detailed view modes
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Custom date range selection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Employee-specific search
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Total OT hours aggregation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Export-ready data format
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 6: Dashboard */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 6
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  AI-Powered Dashboard Analytics
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Comprehensive dashboard with AI-generated insights and performance metrics. 
                  View total employee count, attendance rates, average OT hours, and overall 
                  performance scores. Identify top performers and track organizational KPIs in real-time.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 shadow-lg">
                    <div className="text-3xl font-bold mb-1">90</div>
                    <div className="text-sm text-blue-100">Total Employees</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 shadow-lg">
                    <div className="text-3xl font-bold mb-1">93.8%</div>
                    <div className="text-sm text-green-100">Attendance Rate</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 shadow-lg">
                    <div className="text-3xl font-bold mb-1">12.0</div>
                    <div className="text-sm text-indigo-100">Avg OT hrs/person</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 shadow-lg">
                    <div className="text-3xl font-bold mb-1">90.0</div>
                    <div className="text-sm text-purple-100">Performance Score</div>
                  </div>
                </div>
                <div className="bg-blue-800/50 backdrop-blur rounded-xl p-4 border border-blue-400/30 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-blue-200">
                      AI analyzes patterns and provides actionable insights for better decision-making
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5240.PNG" 
                    alt="HR Dashboard with AI Analytics" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 7: Employee Meeting Scheduler */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5226.PNG" 
                    alt="Employee Meeting Scheduler" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 7
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Direct Employee Communication
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Schedule meetings and communicate directly with employees through the system. 
                  Search through your entire workforce database, view employee details including 
                  LINE registration status, and initiate conversations with a single click.
                </p>
                <div className="bg-blue-800/50 backdrop-blur rounded-xl p-6 border border-blue-400/30">
                  <h4 className="font-semibold mb-4">Communication Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Search 428+ employees instantly
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      View LINE registration status
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Filter by name, ID, or department
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Direct LINE messaging capability
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Meeting schedule coordination
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 8: AI Chatbot */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 8
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  AI Assistant for HR Operations
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Intelligent AI chatbot that understands HR queries and provides instant answers. 
                  Get help with employee data lookups, system usage, understanding reports, and 
                  general HR questions. The AI is trained on your system and can assist with 
                  day-to-day operations.
                </p>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg mb-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Capabilities
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      Employee information queries
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      System usage guidance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      Report interpretation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      Policy clarification
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-800/50 backdrop-blur rounded-xl p-4 border border-blue-400/30 text-sm">
                  <div className="text-blue-200">
                    Available 24/7 to assist HR administrators with instant, accurate responses
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5227.PNG" 
                    alt="AI Assistant Interface" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 9: AI Chatbot in Action */}
          <div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image 
                    src="/image/IMG_5222.PNG" 
                    alt="AI Chatbot Conversation" 
                    width={400} 
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  HR Step 9
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Intelligent Conversation & Analytics
                </h3>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  The AI chatbot seamlessly integrates with your LINE chat, providing natural 
                  language interaction. Ask complex questions about employee OT patterns, 
                  attendance issues, or get summaries of specific situations. The AI understands 
                  context and provides detailed, actionable insights.
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-800/50 backdrop-blur rounded-lg p-4 border-l-4 border-green-400">
                    <div className="text-sm text-blue-200 mb-1">Example Query</div>
                    <div className="font-medium">"Show me employees with highest OT this month"</div>
                  </div>
                  <div className="bg-blue-800/50 backdrop-blur rounded-lg p-4 border-l-4 border-purple-400">
                    <div className="text-sm text-blue-200 mb-1">Example Query</div>
                    <div className="font-medium">"Who hasn't attended work yesterday?"</div>
                  </div>
                  <div className="bg-blue-800/50 backdrop-blur rounded-lg p-4 border-l-4 border-indigo-400">
                    <div className="text-sm text-blue-200 mb-1">Example Query</div>
                    <div className="font-medium">"Summarize department attendance rates"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Technology Stack
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built with Modern Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade architecture ensuring reliability, security, and scalability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Modern Web Stack</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Next.js 14 with App Router</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>TypeScript for type safety</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Tailwind CSS styling</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>LIFF SDK integration</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-8 border border-gray-200">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Database & Backend</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Supabase PostgreSQL</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Real-time subscriptions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Row-level security</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Automated backups</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Integrations</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span>LINE Messaging API</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span>LINE LIFF v2</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span>Geolocation API</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span>AI/ML services</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-24 bg-gradient-to-br from-teal-600 via-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Our System?
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Comprehensive benefits that transform your HR operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Zero Learning Curve',
                description: 'Employees use familiar LINE interface - no training required',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: '100% Automation',
                description: 'From attendance to OT calculation - fully automated processes',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                )
              },
              {
                title: 'Real-time Operations',
                description: 'Instant notifications, approvals, and data updates',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: 'Enterprise Security',
                description: 'Multi-layer authentication and role-based access control',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              },
              {
                title: 'AI-Powered Insights',
                description: 'Intelligent analytics and chatbot assistance for better decisions',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                title: 'Cost Effective',
                description: 'Reduce administrative overhead and manual processes significantly',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-green-100 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your HR Operations?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join leading organizations using our AI-powered HR management system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#" 
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg"
            >
              Schedule a Demo
            </a>
            <a 
              href="#" 
              className="bg-white/10 backdrop-blur text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Smart HR System</h3>
              <p className="text-sm leading-relaxed">
                AI-powered workforce management through LINE Official Account integration
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-sm">
                <li>Next.js & React</li>
                <li>Supabase PostgreSQL</li>
                <li>LINE Messaging API</li>
                <li>AI/ML Integration</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: info@smarthr.com</li>
                <li>Phone: +66 XX XXX XXXX</li>
                <li>Website: www.smarthr.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>2025 E-Cloud Technology. All rights reserved. Smart HR System powered by LINE OA.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

