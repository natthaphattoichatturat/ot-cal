# LINE ID Migration - Complete Summary

## Overview
Successfully migrated the database schema and all code from a single `line_id` column to dual LINE ID columns (`line_id_employ` and `line_id_hr`) to support two separate LINE Official Accounts.

## Database Changes

### Schema Migration
**File:** `database-migration-line-ids.sql`

```sql
-- Add new column for HR LINE OA
ALTER TABLE employees ADD COLUMN IF NOT EXISTS line_id_hr TEXT;

-- Rename existing line_id to line_id_employ
ALTER TABLE employees RENAME COLUMN line_id TO line_id_employ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_line_id_employ ON employees(line_id_employ);
CREATE INDEX IF NOT EXISTS idx_employees_line_id_hr ON employees(line_id_hr);
```

### Column Purpose
- **`line_id_employ`**: LINE User ID from Employee LINE OA (Channel ID: 2008436527)
- **`line_id_hr`**: LINE User ID from HR LINE OA (Channel ID: 2008409511)

## Code Changes Summary

### 1. Permission Helper
**File:** `lib/hrPermission.ts`
- Changed to use `line_id_hr` for HR permission checks
- HR system access is verified via HR LINE OA ID

### 2. Registration APIs

#### Employee Registration
**File:** `app/api/line/register-employee/route.ts`
- Uses `line_id_employ` column
- Registers employees via Employee LINE OA

#### Admin Registration
**File:** `app/api/line/register-admin/route.ts`
- Uses `line_id_hr` column
- Registers HR admins via HR LINE OA

### 3. LINE OA Webhook Routes

#### Employee LINE OA Webhook
**File:** `app/api/line/webhook/route.ts`
- Uses `line_id_employ` to send approval/rejection notifications
- Sends messages via Employee LINE OA

#### HR LINE OA Webhook
**File:** `app/api/line/hr-webhook/route.ts`
- Already uses `line_id_hr` for permission checks
- Processes chatbot requests from HR LINE OA

### 4. Attendance & Leave APIs

#### Attendance Check-in
**File:** `app/api/line/attendance-checkin/route.ts`
- Uses `line_id_employ` to identify employees
- Employee LINE OA feature

#### Submit Leave Request
**File:** `app/api/line/submit-leave/route.ts`
- Uses `line_id_employ` for created_by field
- Sends notifications to HR admins via `line_id_hr`
- HR receives leave requests on HR LINE OA

#### Schedule Meeting
**File:** `app/api/line/schedule-meeting/route.ts`
- Uses `line_id_employ` to send meeting invitations
- Sends to Employee LINE OA
- Validates employee has registered Employee LINE OA

### 5. Employee Management APIs

#### Employees API
**File:** `app/api/employees/route.ts`
- GET: Supports searching by `line_id_employ` or `line_id_hr`
- POST: Accepts both `line_id_employ` and `line_id_hr` fields
- Updated to handle dual LINE ID columns

#### Import API
**File:** `app/api/employees/import/route.ts`
- Accepts both `line_id_employ` and `line_id_hr` in CSV imports
- Bulk import supports dual LINE IDs

### 6. LIFF Pages

#### Employee OT Viewer
**File:** `app/liff/employee-ot-viewer/page.tsx`
- Searches by `line_id_employ`
- Employee-facing feature

#### Employee Meeting Scheduler
**File:** `app/liff/employee-meeting/page.tsx`
- Interface updated to use `line_id_employ`
- Shows warning if employee hasn't registered Employee LINE OA
- HR feature that sends to Employee LINE OA

#### AI Chatbot
**File:** `app/liff/ai-chatbot/page.tsx`
- Already uses HR permission check with `line_id_hr`
- HR-only feature

## LINE OA Architecture

### Employee LINE OA (Channel ID: 2008436527)
**Uses `line_id_employ` column**
- Attendance check-in/check-out
- Receive meeting invitations
- Receive leave request approvals/rejections
- View OT hours

### HR LINE OA (Channel ID: 2008409511)
**Uses `line_id_hr` column**
- Permission checking (admin_etec only)
- Receive leave requests
- AI Chatbot
- HR Dashboard
- Schedule employee meetings

## Key Implementation Details

1. **Separate LINE IDs**: Same user has different LINE IDs on different LINE OAs
2. **Permission System**: HR features check `line_id_hr` against `admin_etec` department
3. **Messaging Routes**:
   - Employee notifications → `line_id_employ` → Employee LINE OA
   - HR notifications → `line_id_hr` → HR LINE OA
4. **Registration Flow**:
   - Employees register both LINE OAs separately
   - `line_id_employ` via Employee LINE OA
   - `line_id_hr` via HR LINE OA (admin_etec only)

## Migration Steps for Deployment

1. **Run SQL Migration**:
   ```sql
   -- Execute database-migration-line-ids.sql in Supabase SQL Editor
   ```

2. **Deploy Code**:
   ```bash
   npm run build
   # Deploy to Vercel
   ```

3. **User Re-registration**:
   - Existing users need to re-register on both LINE OAs
   - Employee LINE OA: `/liff/employee-register`
   - HR LINE OA: `/liff/admin-register` (admin_etec only)

## Build Status
✅ **Build Successful** - All TypeScript type checks passed

## Testing Checklist

- [ ] Run database migration in Supabase
- [ ] Test employee registration via Employee LINE OA
- [ ] Test admin registration via HR LINE OA
- [ ] Test attendance check-in via Employee LINE OA
- [ ] Test leave request submission (should notify HR via HR LINE OA)
- [ ] Test leave approval/rejection (should notify employee via Employee LINE OA)
- [ ] Test meeting scheduling (should send to employee via Employee LINE OA)
- [ ] Test HR chatbot via HR LINE OA
- [ ] Test HR permission checks on all HR features
- [ ] Verify dual LINE IDs are stored correctly

## Notes

- All changes maintain backward compatibility during migration
- NULL values allowed for both LINE ID columns
- Users can register one LINE OA without the other
- Permission checks ensure HR features only accessible via HR LINE OA
