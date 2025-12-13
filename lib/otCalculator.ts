import { AttendanceScan, SpecialHoliday } from './supabase'
import { parseISO, format, addDays, isSunday, getDay } from 'date-fns'

interface ScanRecord {
  scanDate: Date
  scanTime: string
  scanType: 1 | 2
  employeeId: string
  machineId: string
}

interface WorkSession {
  workDate: string // Date to record the work (check-in date)
  checkInTime: string
  checkOutTime: string
  actualHours: number
  otHours: number // รวมชั่วโมง OT ทั้งหมด (จริง ไม่คูณ)
  otNormalHours: number // OT ปกติ (ชั่วโมงจริง ไม่คูณ)
  otSpecialHours: number // OT พิเศษ (ชั่วโมงจริง ไม่คูณ)
  otPremiumHours: number // OT ขั้นสูง (ชั่วโมงจริง ไม่คูณ)
  otNormalHoursMultiplied: number // OT ปกติที่คำนวณแล้ว (×1.5)
  otSpecialHoursMultiplied: number // OT พิเศษที่คำนวณแล้ว (รายวัน ×2, รายเดือน ×1)
  otPremiumHoursMultiplied: number // OT ขั้นสูงที่คำนวณแล้ว (×3)
  otHoursMultiplied: number // รวม OT ที่คำนวณแล้ว
  isHoliday: boolean
  shift: 1 | 2 // 1 = 8:00-17:00, 2 = 20:00-05:00
  late: boolean
  lateHours: number
  allowLateNextDay: boolean // true if worked past 3:00 AM
  employmentType: 'รายวัน' | 'รายเดือน' // ประเภทพนักงาน
}

// Convert time string to minutes from midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Convert minutes to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
}

// Round down to nearest 30 minutes for OT calculation
function roundDownToHalfHour(minutes: number): number {
  return Math.floor(minutes / 30) * 30
}

// Round down hours to nearest 0.5 (ปัดลงเป็น .0 หรือ .5 เท่านั้น)
// เช่น 3.12 → 3.0, 3.68 → 3.5, 4.99 → 4.5
function roundDownToHalfHourInHours(hours: number): number {
  return Math.floor(hours * 2) / 2
}

// Check if date is a special holiday or Sunday
function isSpecialDay(date: Date, holidays: SpecialHoliday[]): boolean {
  if (isSunday(date)) return true

  const dateStr = format(date, 'yyyy-MM-dd')
  return holidays.some(h => h.holiday_date === dateStr)
}

// Determine shift based on check-in time
function determineShift(checkInMinutes: number): 1 | 2 {
  // Shift 1: 6:00 - 17:00 (can start OT from 6:00, regular from 8:00)
  // Shift 2: 17:30 - 13:00 next day (can start OT from 17:30, regular from 20:00)

  if (checkInMinutes >= 360 && checkInMinutes < 1020) { // 6:00 - 17:00
    return 1
  } else {
    return 2
  }
}

// Calculate OT for shift 1 (8:00-17:00)
function calculateShift1OT(
  checkInMinutes: number,
  checkOutMinutes: number,
  checkOutDate: Date,
  checkInDate: Date,
  isHoliday: boolean,
  employmentType: 'รายวัน' | 'รายเดือน' = 'รายวัน'
): {
  actualHours: number;
  otHours: number;
  otNormalHours: number;
  otSpecialHours: number;
  otPremiumHours: number;
  otNormalHoursMultiplied: number;
  otSpecialHoursMultiplied: number;
  otPremiumHoursMultiplied: number;
  otHoursMultiplied: number;
  allowLateNextDay: boolean;
  late: boolean;
  lateHours: number;
} {
  const scheduledIn = 480 // 8:00
  const scheduledOut = 1020 // 17:00
  const otStart = 360 // 6:00
  const nightOtStart = 1050 // 17:30

  let actualHours = 0
  let late = false
  let lateHours = 0

  // Check if late (after 8:00)
  if (checkInMinutes > scheduledIn) {
    late = true
    lateHours = (checkInMinutes - scheduledIn) / 60
  }

  // Calculate morning OT (6:00 - 8:00, max 2 hours)
  let morningOT = 0
  if (checkInMinutes < scheduledIn && checkInMinutes >= otStart) {
    const otMinutes = scheduledIn - checkInMinutes
    morningOT = roundDownToHalfHour(Math.min(otMinutes, 120)) // Max 2 hours
  }

  // Calculate night OT (after 17:30)
  let nightOT = 0
  let allowLateNextDay = false

  // Check if work crossed to next day
  const sameDay = checkInDate.toDateString() === checkOutDate.toDateString()

  if (!sameDay) {
    // Worked past midnight
    const minutesUntilMidnight = 1440 - nightOtStart // From 17:30 to 24:00
    const minutesAfterMidnight = checkOutMinutes // From 00:00 to checkout

    const totalNightMinutes = minutesUntilMidnight + minutesAfterMidnight

    // Special rule: if checkout between 2:00-3:00, max 8 hours OT
    // if checkout after 3:00, can get 9+ hours OT
    if (checkOutMinutes > 0 && checkOutMinutes <= 120) { // 0:00 - 2:00
      nightOT = roundDownToHalfHour(totalNightMinutes)
    } else if (checkOutMinutes > 120 && checkOutMinutes <= 180) { // 2:00 - 3:00
      nightOT = Math.min(480, roundDownToHalfHour(totalNightMinutes)) // Max 8 hours
    } else if (checkOutMinutes > 180) { // After 3:00
      nightOT = roundDownToHalfHour(totalNightMinutes)
      allowLateNextDay = true // Can come at 13:00 next day
    }
  } else {
    // Same day checkout
    if (checkOutMinutes > nightOtStart) {
      const otMinutes = checkOutMinutes - nightOtStart
      nightOT = roundDownToHalfHour(otMinutes)
    }
  }

  // คำนวณชั่วโมงทำงานจริง (ไม่รวม OT multiplier)
  let workMinutes = 0
  
  if (isHoliday) {
    // วันหยุด: นับทุกชั่วโมงที่ทำงาน รวมเวลาปกติ 8:00-17:00 ด้วย
    // คำนวณจากเวลาเข้าถึงเวลาออก หักเวลาพัก
    const sameDay = checkInDate.toDateString() === checkOutDate.toDateString()
    
    if (sameDay) {
      // ทำงานไม่ข้ามวัน
      workMinutes = checkOutMinutes - checkInMinutes
    } else {
      // ทำงานข้ามวัน
      const minutesUntilMidnight = 1440 - checkInMinutes
      const minutesAfterMidnight = checkOutMinutes
      workMinutes = minutesUntilMidnight + minutesAfterMidnight
    }
    
    // หักเวลาพักกลางวัน 1 ชม. (12:00-13:00 หรือ 720-780 นาที)
    if (checkInMinutes < 780 && checkOutMinutes > 720) {
      workMinutes -= 60
    }
    
    // หักเวลาพักเย็น 30 นาที (17:00-17:30 หรือ 1020-1050 นาที)
    if (checkInMinutes < 1050 && checkOutMinutes > 1020) {
      workMinutes -= 30
    }
    
    actualHours = workMinutes / 60
  } else {
    // วันธรรมดา: นับเฉพาะ OT นอกเวลา
    actualHours = (morningOT + nightOT) / 60
  }

  // Calculate OT hours - เก็บชั่วโมงจริงและชั่วโมงที่คำนวณแล้วแยกกัน
  let otHours = 0 // รวมชั่วโมงจริง (ไม่คูณ)
  let otNormalHours = 0 // ชั่วโมงจริง OT ปกติ
  let otSpecialHours = 0 // ชั่วโมงจริง OT พิเศษ
  let otPremiumHours = 0 // ชั่วโมงจริง OT ขั้นสูง

  let otNormalHoursMultiplied = 0 // ชั่วโมงที่คำนวณแล้ว (×1.5)
  let otSpecialHoursMultiplied = 0 // ชั่วโมงที่คำนวณแล้ว (×2 หรือ ×1)
  let otPremiumHoursMultiplied = 0 // ชั่วโมงที่คำนวณแล้ว (×3)
  let otHoursMultiplied = 0 // รวมชั่วโมงที่คำนวณแล้ว

  if (isHoliday) {
    // วันหยุด/อาทิตย์: คำนวณ OT แบบพิเศษ
    const totalMinutes = workMinutes

    if (totalMinutes <= 480) {
      // ทำงานไม่เกิน 8 ชม.
      // ปัดลงเป็น .0 หรือ .5 เท่านั้น
      otSpecialHours = roundDownToHalfHourInHours(totalMinutes / 60)
      otHours = otSpecialHours

      // คำนวณชั่วโมงที่คูณแล้ว
      if (employmentType === 'รายวัน') {
        otSpecialHoursMultiplied = otSpecialHours * 2
      } else {
        otSpecialHoursMultiplied = otSpecialHours * 1
      }
      otHoursMultiplied = otSpecialHoursMultiplied
    } else {
      // ทำงานเกิน 8 ชม.
      otSpecialHours = 8 // 8 ชั่วโมงเต็ม
      otPremiumHours = roundDownToHalfHourInHours((totalMinutes - 480) / 60)
      otHours = otSpecialHours + otPremiumHours

      // คำนวณชั่วโมงที่คูณแล้ว
      if (employmentType === 'รายวัน') {
        otSpecialHoursMultiplied = otSpecialHours * 2
      } else {
        otSpecialHoursMultiplied = otSpecialHours * 1
      }
      otPremiumHoursMultiplied = otPremiumHours * 3
      otHoursMultiplied = otSpecialHoursMultiplied + otPremiumHoursMultiplied
    }
  } else {
    // วันธรรมดา: OT ปกติ
    // ปัดลงเป็น .0 หรือ .5
    otNormalHours = roundDownToHalfHourInHours(actualHours)
    otHours = otNormalHours

    // คำนวณชั่วโมงที่คูณแล้ว (×1.5)
    otNormalHoursMultiplied = otNormalHours * 1.5
    otHoursMultiplied = otNormalHoursMultiplied
  }

  return {
    actualHours: Math.round(actualHours * 100) / 100,
    otHours: Math.round(otHours * 100) / 100,
    otNormalHours: Math.round(otNormalHours * 100) / 100,
    otSpecialHours: Math.round(otSpecialHours * 100) / 100,
    otPremiumHours: Math.round(otPremiumHours * 100) / 100,
    otNormalHoursMultiplied: Math.round(otNormalHoursMultiplied * 100) / 100,
    otSpecialHoursMultiplied: Math.round(otSpecialHoursMultiplied * 100) / 100,
    otPremiumHoursMultiplied: Math.round(otPremiumHoursMultiplied * 100) / 100,
    otHoursMultiplied: Math.round(otHoursMultiplied * 100) / 100,
    allowLateNextDay,
    late,
    lateHours: Math.round(lateHours * 100) / 100
  }
}

// ============ END calculateShift1OT ============

// Calculate OT for shift 2 (20:00-05:00)
function calculateShift2OT(
  checkInMinutes: number,
  checkOutMinutes: number,
  checkOutDate: Date,
  checkInDate: Date,
  isHoliday: boolean,
  employmentType: 'รายวัน' | 'รายเดือน' = 'รายวัน'
): {
  actualHours: number;
  otHours: number;
  otNormalHours: number;
  otSpecialHours: number;
  otPremiumHours: number;
  otNormalHoursMultiplied: number;
  otSpecialHoursMultiplied: number;
  otPremiumHoursMultiplied: number;
  otHoursMultiplied: number;
  allowLateNextDay: boolean;
  late: boolean;
  lateHours: number;
} {
  const scheduledIn = 1200 // 20:00
  const scheduledOut = 300 // 5:00 next day
  const otStart = 1050 // 17:30
  const nightOtStart = 330 // 5:30 next day

  let actualHours = 0
  let late = false
  let lateHours = 0

  // Check if late (after 20:00)
  if (checkInMinutes > scheduledIn) {
    late = true
    const lateMinutes = checkInMinutes - scheduledIn
    // If check-in is after midnight (next day), it's very late
    if (checkInMinutes < scheduledIn) { // This means it wrapped around midnight
      lateHours = (1440 - scheduledIn + checkInMinutes) / 60
    } else {
      lateHours = lateMinutes / 60
    }
  }

  // Calculate evening OT (17:30 - 20:00)
  let eveningOT = 0
  if (checkInMinutes >= otStart && checkInMinutes < scheduledIn) {
    const otMinutes = scheduledIn - checkInMinutes
    eveningOT = roundDownToHalfHour(otMinutes)
  }

  // Calculate morning OT (after 5:30 next day)
  let morningOT = 0
  let allowLateNextDay = false

  // Shift 2 always crosses to next day
  if (checkOutMinutes > nightOtStart) {
    const otMinutes = checkOutMinutes - nightOtStart
    morningOT = roundDownToHalfHour(otMinutes)
  }

  // คำนวณชั่วโมงทำงานจริง
  let workMinutes = 0
  
  if (isHoliday) {
    // วันหยุด: นับทุกชั่วโมงที่ทำงาน (กะดึกข้ามวันเสมอ)
    // คำนวณจาก check-in ถึง midnight + midnight ถึง check-out
    const minutesUntilMidnight = 1440 - checkInMinutes // จาก check-in ถึง 24:00
    const minutesAfterMidnight = checkOutMinutes // จาก 00:00 ถึง check-out
    workMinutes = minutesUntilMidnight + minutesAfterMidnight
    
    // หักเวลาพักกลางคืน 1 ชม. (00:00-01:00)
    if (checkOutMinutes > 60) {
      workMinutes -= 60
    }
    
    // หักเวลาพักเช้า 30 นาที (05:00-05:30)
    if (checkOutMinutes > 330) {
      workMinutes -= 30
    }
    
    actualHours = workMinutes / 60
  } else {
    // วันธรรมดา: นับเฉพาะ OT นอกเวลา
    actualHours = (eveningOT + morningOT) / 60
  }

  // Calculate OT hours - เก็บชั่วโมงจริงและชั่วโมงที่คำนวณแล้วแยกกัน
  let otHours = 0 // รวมชั่วโมงจริง (ไม่คูณ)
  let otNormalHours = 0 // ชั่วโมงจริง OT ปกติ
  let otSpecialHours = 0 // ชั่วโมงจริง OT พิเศษ
  let otPremiumHours = 0 // ชั่วโมงจริง OT ขั้นสูง

  let otNormalHoursMultiplied = 0 // ชั่วโมงที่คำนวณแล้ว (×1.5)
  let otSpecialHoursMultiplied = 0 // ชั่วโมงที่คำนวณแล้ว (×2 หรือ ×1)
  let otPremiumHoursMultiplied = 0 // ชั่วโมงที่คำนวณแล้ว (×3)
  let otHoursMultiplied = 0 // รวมชั่วโมงที่คำนวณแล้ว

  if (isHoliday) {
    // วันหยุด/อาทิตย์: คำนวณ OT แบบพิเศษ
    const totalMinutes = workMinutes

    if (totalMinutes <= 480) {
      // ทำงานไม่เกิน 8 ชม.
      // ปัดลงเป็น .0 หรือ .5 เท่านั้น
      otSpecialHours = roundDownToHalfHourInHours(totalMinutes / 60)
      otHours = otSpecialHours

      // คำนวณชั่วโมงที่คูณแล้ว
      if (employmentType === 'รายวัน') {
        otSpecialHoursMultiplied = otSpecialHours * 2
      } else {
        otSpecialHoursMultiplied = otSpecialHours * 1
      }
      otHoursMultiplied = otSpecialHoursMultiplied
    } else {
      // ทำงานเกิน 8 ชม.
      otSpecialHours = 8 // 8 ชั่วโมงเต็ม
      otPremiumHours = roundDownToHalfHourInHours((totalMinutes - 480) / 60)
      otHours = otSpecialHours + otPremiumHours

      // คำนวณชั่วโมงที่คูณแล้ว
      if (employmentType === 'รายวัน') {
        otSpecialHoursMultiplied = otSpecialHours * 2
      } else {
        otSpecialHoursMultiplied = otSpecialHours * 1
      }
      otPremiumHoursMultiplied = otPremiumHours * 3
      otHoursMultiplied = otSpecialHoursMultiplied + otPremiumHoursMultiplied
    }
  } else {
    // วันธรรมดา: OT ปกติ
    // ปัดลงเป็น .0 หรือ .5
    otNormalHours = roundDownToHalfHourInHours(actualHours)
    otHours = otNormalHours

    // คำนวณชั่วโมงที่คูณแล้ว (×1.5)
    otNormalHoursMultiplied = otNormalHours * 1.5
    otHoursMultiplied = otNormalHoursMultiplied
  }

  return {
    actualHours: Math.round(actualHours * 100) / 100,
    otHours: Math.round(otHours * 100) / 100,
    otNormalHours: Math.round(otNormalHours * 100) / 100,
    otSpecialHours: Math.round(otSpecialHours * 100) / 100,
    otPremiumHours: Math.round(otPremiumHours * 100) / 100,
    otNormalHoursMultiplied: Math.round(otNormalHoursMultiplied * 100) / 100,
    otSpecialHoursMultiplied: Math.round(otSpecialHoursMultiplied * 100) / 100,
    otPremiumHoursMultiplied: Math.round(otPremiumHoursMultiplied * 100) / 100,
    otHoursMultiplied: Math.round(otHoursMultiplied * 100) / 100,
    allowLateNextDay,
    late,
    lateHours: Math.round(lateHours * 100) / 100
  }
}

// ============ END calculateShift2OT ============

// Main function to calculate OT from scans
export function calculateOTFromScans(
  scans: AttendanceScan[],
  holidays: SpecialHoliday[],
  employeeData?: Map<string, { employment_type?: string }> // ข้อมูลพนักงาน
): WorkSession[] {
  // Group scans by employee
  const employeeScans = new Map<string, ScanRecord[]>()

  scans.forEach(scan => {
    const scanDate = parseISO(scan.scan_date)
    const record: ScanRecord = {
      scanDate,
      scanTime: scan.scan_time,
      scanType: scan.scan_type,
      employeeId: scan.employee_id,
      machineId: scan.machine_id
    }

    if (!employeeScans.has(scan.employee_id)) {
      employeeScans.set(scan.employee_id, [])
    }
    employeeScans.get(scan.employee_id)!.push(record)
  })

  const workSessions: WorkSession[] = []

  // Process each employee
  employeeScans.forEach((records, employeeId) => {
    // Sort by date and time
    records.sort((a, b) => {
      const dateCompare = a.scanDate.getTime() - b.scanDate.getTime()
      if (dateCompare !== 0) return dateCompare
      return timeToMinutes(a.scanTime) - timeToMinutes(b.scanTime)
    })

    // Remove duplicate scans (same type within 2 minutes)
    const cleanedRecords: ScanRecord[] = []
    for (let idx = 0; idx < records.length; idx++) {
      const current = records[idx]

      // Check if this is a duplicate of the last added scan
      if (cleanedRecords.length > 0) {
        const last = cleanedRecords[cleanedRecords.length - 1]
        const isSameDate = current.scanDate.getTime() === last.scanDate.getTime()
        const isSameType = current.scanType === last.scanType
        const timeDiff = Math.abs(timeToMinutes(current.scanTime) - timeToMinutes(last.scanTime))

        // If same date, same type, and within 2 minutes, skip (duplicate scan)
        if (isSameDate && isSameType && timeDiff <= 2) {
          console.log(`Removing duplicate scan for ${employeeId} at ${current.scanTime} (within 2min of ${last.scanTime})`)
          continue
        }
      }

      cleanedRecords.push(current)
    }

    // Use cleaned records instead of original
    const processedRecords = cleanedRecords

    // Track which scans have been processed
    const processedIndices = new Set<number>()

    // Match check-in and check-out pairs
    let i = 0
    while (i < processedRecords.length) {
      const checkIn = processedRecords[i]

      if (checkIn.scanType !== 1) {
        i++
        continue
      }

      // Skip check-in scans during 00:00-01:00 (misdata from break period)
      const checkInMinutes = timeToMinutes(checkIn.scanTime)
      if (checkInMinutes >= 0 && checkInMinutes <= 60) {
        // This is a break scan after midnight, skip it
        processedIndices.add(i)
        i++
        continue
      }

      // Find corresponding check-out
      let checkOut: ScanRecord | null = null
      let j = i + 1

      // Look for check-out, handling special case of shift 2 with break scan
      while (j < processedRecords.length) {
        if (processedRecords[j].scanType === 2) {
          checkOut = processedRecords[j]
          break
        } else if (processedRecords[j].scanType === 1) {
          // Found another check-in before check-out
          // Skip if it's a break scan (00:00-01:00)
          const nextCheckInMinutes = timeToMinutes(processedRecords[j].scanTime)

          if (nextCheckInMinutes >= 0 && nextCheckInMinutes <= 60) {
            // This is a break scan after midnight, skip it and continue looking for check-out
            j++
            continue
          } else {
            // This is a new work session, stop looking
            break
          }
        }
        j++
      }

      if (!checkOut) {
        // Skip incomplete scan - only check-in without check-out
        // This is a penalty for employees who don't scan properly
        console.log(`Skipping incomplete scan for employee ${checkIn.employeeId} on ${format(checkIn.scanDate, 'yyyy-MM-dd')} - check-in only`)
        processedIndices.add(i)
        i++
        continue
      }

      // Mark both check-in and check-out as processed
      processedIndices.add(i)
      processedIndices.add(j)

      // Calculate OT
      const checkInDate = checkIn.scanDate
      const checkOutDate = checkOut.scanDate
      // checkInMinutes already declared above
      const checkOutMinutes = timeToMinutes(checkOut.scanTime)

      const shift = determineShift(checkInMinutes)
      const isHoliday = isSpecialDay(checkInDate, holidays)
      
      // ดึงข้อมูลประเภทพนักงาน (default เป็นรายวัน)
      const empData = employeeData?.get(employeeId)
      const employmentType = (empData?.employment_type === 'รายเดือน' ? 'รายเดือน' : 'รายวัน') as 'รายวัน' | 'รายเดือน'

      let result
      if (shift === 1) {
        result = calculateShift1OT(checkInMinutes, checkOutMinutes, checkOutDate, checkInDate, isHoliday, employmentType)
      } else {
        result = calculateShift2OT(checkInMinutes, checkOutMinutes, checkOutDate, checkInDate, isHoliday, employmentType)
      }

      workSessions.push({
        workDate: format(checkInDate, 'yyyy-MM-dd'),
        checkInTime: checkIn.scanTime,
        checkOutTime: checkOut.scanTime,
        actualHours: result.actualHours,
        otHours: result.otHours,
        otNormalHours: result.otNormalHours,
        otSpecialHours: result.otSpecialHours,
        otPremiumHours: result.otPremiumHours,
        otNormalHoursMultiplied: result.otNormalHoursMultiplied,
        otSpecialHoursMultiplied: result.otSpecialHoursMultiplied,
        otPremiumHoursMultiplied: result.otPremiumHoursMultiplied,
        otHoursMultiplied: result.otHoursMultiplied,
        isHoliday,
        shift,
        late: result.late,
        lateHours: result.lateHours,
        allowLateNextDay: result.allowLateNextDay,
        employmentType
      })

      i = j + 1
    }

    // Handle orphan check-out scans (check-out without check-in)
    // Skip these as penalty for not scanning properly
    for (let k = 0; k < processedRecords.length; k++) {
      if (processedIndices.has(k)) continue

      const scan = processedRecords[k]
      if (scan.scanType !== 2) continue // Only process check-out scans

      // Skip orphan check-out - no matching check-in
      console.log(`Skipping orphan check-out for employee ${scan.employeeId} on ${format(scan.scanDate, 'yyyy-MM-dd')} - check-out only`)
    }
  })

  return workSessions
}

// Parse .txt file format
export function parseScanFile(content: string): AttendanceScan[] {
  const lines = content.trim().split('\n')
  const scans: AttendanceScan[] = []

  lines.forEach((line, index) => {
    // Skip empty lines
    if (!line.trim()) return

    // Split by tab first, filter out empty strings
    let parts = line.split('\t').filter(p => p.trim().length > 0).map(p => p.trim())

    // If still not enough parts, try splitting by any whitespace
    if (parts.length < 5) {
      parts = line.split(/\s+/).filter(p => p.trim().length > 0).map(p => p.trim())
    }

    if (parts.length < 5) {
      console.log(`Skipping line ${index + 1}: insufficient parts (got ${parts.length}, need 5)`, parts)
      return
    }

    const [machineId, dateStr, timeStr, employeeIdRaw, scanTypeStr] = parts

    // Validate machineId
    if (!machineId || machineId.length === 0) {
      console.log(`Skipping line ${index + 1}: invalid machineId`)
      return
    }

    // Parse date from dd-mm-yyyy to yyyy-mm-dd
    const dateParts = dateStr.split('-')
    if (dateParts.length !== 3) {
      console.log(`Skipping line ${index + 1}: invalid date format`, dateStr)
      return
    }

    const scanDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`

    // Validate time format (HH:MM:SS)
    if (!timeStr || !timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
      console.log(`Skipping line ${index + 1}: invalid time format`, timeStr)
      return
    }

    // Clean employee ID (remove leading quote if present)
    const employeeId = employeeIdRaw.replace(/^['"]/, '').replace(/['"]$/, '').trim()

    if (!employeeId || employeeId.length === 0) {
      console.log(`Skipping line ${index + 1}: invalid employee ID`)
      return
    }

    const scanType = parseInt(scanTypeStr)
    if (scanType !== 1 && scanType !== 2) {
      console.log(`Skipping line ${index + 1}: invalid scan type`, scanTypeStr)
      return
    }

    scans.push({
      id: 0, // Will be set by database
      machine_id: machineId,
      scan_date: scanDate,
      scan_time: timeStr,
      employee_id: employeeId,
      scan_type: scanType as 1 | 2,
      created_at: new Date().toISOString()
    })
  })

  console.log(`Parsed ${scans.length} scans from ${lines.length} lines`)
  return scans
}
