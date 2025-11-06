# Test Cases: Incomplete Scan Handling

## Feature: Handle scans with missing check-in or check-out

### Test Case 1: Only Check-In (after 12:00)
**Input:**
- Employee: 20056136
- Scan: 11-10-2025 | 14:30:00 | Check-IN (Type 1)
- No Check-OUT scan

**Expected Behavior:**
- Detected as **Shift 1** (since 14:30 > 12:00)
- Default check-out = **17:00** same day
- Calculate OT: 14:30 → 17:00 (no OT, within regular hours)
- Record saved with `check_out_time = "17:00:00"`

---

### Test Case 2: Only Check-In (before 12:00)
**Input:**
- Employee: 20056415
- Scan: 11-10-2025 | 07:45:00 | Check-IN (Type 1)
- No Check-OUT scan

**Expected Behavior:**
- Detected as **Shift 2** (since 07:45 ≤ 12:00)
- Default check-out = **05:00** next day (12-10-2025)
- Calculate OT for Shift 2: 07:45 → 05:00 (next day)
- Morning OT from 05:30 to actual checkout time
- Record saved with `check_out_time = "05:00:00"`, `work_date = "2025-10-11"`

---

### Test Case 3: Only Check-Out (after 12:00)
**Input:**
- Employee: 20056243
- Scan: 11-10-2025 | 20:04:01 | Check-OUT (Type 2)
- No Check-IN scan

**Expected Behavior:**
- Detected as **Shift 1** (since 20:04 > 12:00)
- Default check-in = **08:00** same day
- Calculate OT: 08:00 → 20:04
- Evening OT from 17:30 to 20:04 = 2.5 hours OT
- Record saved with `check_in_time = "08:00:00"`, `work_date = "2025-10-11"`

---

### Test Case 4: Only Check-Out (before 12:00)
**Input:**
- Employee: 20055498
- Scan: 12-10-2025 | 03:26:00 | Check-OUT (Type 2)
- No Check-IN scan

**Expected Behavior:**
- Detected as **Shift 2** (since 03:26 ≤ 12:00)
- Default check-in = **20:00** previous day (11-10-2025)
- Calculate OT for Shift 2: 20:00 (prev day) → 03:26 (current day)
- Record saved with `check_in_time = "20:00:00"`, `work_date = "2025-10-11"`

---

## Logic Summary

### For Check-In Only (no Check-Out):
```
if (checkInTime > 12:00):
    shift = 1
    defaultCheckOut = 17:00 (same day)
else:
    shift = 2
    defaultCheckOut = 05:00 (next day)
```

### For Check-Out Only (no Check-In):
```
if (checkOutTime > 12:00):
    shift = 1
    defaultCheckIn = 08:00 (same day)
else:
    shift = 2
    defaultCheckIn = 20:00 (previous day)
```

---

## Implementation Details

**File Modified:** `/lib/otCalculator.ts`

**Changes:**
1. Added `processedIndices` Set to track which scans have been matched
2. Lines 300-347: Handle check-in without check-out
3. Lines 385-433: Handle orphan check-out scans (loop through unprocessed scans)

**Key Functions Used:**
- `timeToMinutes()` - Convert time string to minutes
- `minutesToTime()` - Convert minutes back to time string
- `addDays()` - Add/subtract days from date (from date-fns)
- `calculateShift1OT()` / `calculateShift2OT()` - Calculate OT with default times
