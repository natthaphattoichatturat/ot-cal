# Fix: Skip Midnight Break Scans (00:00-01:00)

## ปัญหา

การ scan เข้างาน (Type 1) ช่วงเวลา **00:00:00 - 01:00:00** เป็น **misdata** ที่เกิดจากการสแกนหลังพักเที่ยงคืนของพนักงานกะ 2 (20:00-05:00)

**ไม่ใช่** การเข้างานจริง แต่เป็นการสแกนกลับเข้ามาหลังพักเที่ยงคืน

---

## การแก้ไข

### **File:** `/lib/otCalculator.ts`

### **Change 1: Skip break scans in main loop** (Lines 271-278)

```typescript
// Skip check-in scans during 00:00-01:00 (misdata from break period)
const checkInMinutes = timeToMinutes(checkIn.scanTime)
if (checkInMinutes >= 0 && checkInMinutes <= 60) {
  // This is a break scan after midnight, skip it
  processedIndices.add(i)
  i++
  continue
}
```

**การทำงาน:**
- ตรวจสอบเวลา check-in ทุกตัว
- ถ้าอยู่ในช่วง 00:00 - 01:00 → **ข้ามไปเลย**
- เพิ่ม index เข้า `processedIndices` เพื่อไม่ให้ถูก process ซ้ำ

---

### **Change 2: Skip break scans when looking for check-out** (Lines 291-297)

```typescript
// Found another check-in before check-out
// Skip if it's a break scan (00:00-01:00)
const nextCheckInMinutes = timeToMinutes(records[j].scanTime)

if (nextCheckInMinutes >= 0 && nextCheckInMinutes <= 60) {
  // This is a break scan after midnight, skip it and continue looking for check-out
  j++
  continue
}
```

**การทำงาน:**
- เมื่อกำลังหา check-out สำหรับ check-in ตัวหนึ่ง
- หากเจอ check-in อีกตัวในช่วง 00:00 - 01:00
- **ไม่ถือว่าเป็น work session ใหม่** → ข้ามไป และหา check-out ต่อ

---

## ตัวอย่างข้อมูล

### **ก่อนแก้ไข ❌**

```
Input:
01	20-10-2025	19:49:00	'20056572	1  ← Check-in กะ 2
01	21-10-2025	00:45:28	'20056572	1  ← Break scan (misdata)
04	21-10-2025	08:02:39	'20056572	2  ← Check-out

Result:
- Session 1: 19:49 → ??? (ไม่มี check-out ที่ match)
- Session 2: 00:45 → 08:02 (ผิดพลาด! คำนวนผิด)
```

### **หลังแก้ไข ✅**

```
Input:
01	20-10-2025	19:49:00	'20056572	1  ← Check-in กะ 2
01	21-10-2025	00:45:28	'20056572	1  ← SKIPPED (break scan)
04	21-10-2025	08:02:39	'20056572	2  ← Check-out

Result:
- Session: 19:49 → 08:02 (ถูกต้อง! คำนวน OT กะ 2)
- Break scan ถูกข้ามไปแล้ว
```

---

## กรณีทดสอบ

### **Test Case 1: Normal Shift 2 with Break Scan**

**Input:**
```
01	20-10-2025	19:30:00	'20056572	1
01	21-10-2025	00:50:00	'20056572	1  ← break scan
04	21-10-2025	05:15:00	'20056572	2
```

**Expected:**
- Work session: 20-10-2025 19:30 → 21-10-2025 05:15
- Break scan at 00:50 is **ignored**
- OT calculated correctly for Shift 2

---

### **Test Case 2: Multiple Employees with Break Scans**

**Input:**
```
01	20-10-2025	20:05:00	'20056001	1
01	21-10-2025	00:30:00	'20056001	1  ← break scan (ignored)
04	21-10-2025	06:00:00	'20056001	2

01	20-10-2025	20:10:00	'20056002	1
01	21-10-2025	00:55:00	'20056002	1  ← break scan (ignored)
04	21-10-2025	05:30:00	'20056002	2
```

**Expected:**
- Employee 20056001: 20:05 → 06:00 (morning OT calculated)
- Employee 20056002: 20:10 → 05:30 (regular shift)
- Both break scans ignored

---

### **Test Case 3: Check-in at 00:xx but NOT Shift 2 (Edge Case)**

**Input:**
```
01	21-10-2025	00:30:00	'20056003	1  ← Standalone scan at midnight
```

**Expected:**
- This scan is **skipped** as misdata
- No work session created
- Assumed to be erroneous break scan data

---

## สรุป

### ✅ **Changes Made:**
1. Added check to skip check-in scans during 00:00-01:00 in main loop
2. Simplified break scan detection logic when looking for check-out
3. Mark skipped scans in `processedIndices` to prevent reprocessing

### ✅ **Benefits:**
- **Eliminates misdata** from break period scans
- **Correct OT calculation** for Shift 2 employees
- **Cleaner data** in daily_attendance table
- **No false work sessions** created from break scans

### 📊 **Impact:**
- All check-in scans between **00:00:00 - 01:00:00** are now ignored
- Existing matched pairs remain unaffected
- Orphan check-out scans still processed normally

---

## Implementation Summary

**Total Changes:** 2 locations in `/lib/otCalculator.ts`

1. **Line 271-278:** Early skip for midnight break scans
2. **Line 291-297:** Simplified break scan handling when matching pairs

**Files Modified:**
- ✅ `/lib/otCalculator.ts` (2 changes)
- ✅ `/fix-midnight-break-scans.md` (documentation)

**Status:** ✅ Complete and tested
