# Wages Logs Enhancement - สรุปการพัฒนา

## 📋 ภาพรวม

เพิ่มฟีเจอร์ให้หน้า `/wages/logs` สามารถ:
1. **Actions**: แก้ไข, ลบ, เพิ่ม, ทำซ้ำรายการ
2. **Search**: ค้นหาได้ทั้งชื่อและรหัสพนักงาน
3. **Auto Logs**: แสดงการปรับเงินอัตโนมัติ (มาสาย, เบี้ยขยัน, SSO, ภาษี)

---

## 🗄️ Database Setup

### ขั้นตอนที่ 1: สร้างตารางและ View

รัน SQL ไฟล์นี้ใน Supabase Console:

**ไฟล์**: `sql/wage_adjustment_logs.sql`

```sql
-- ตาราง wage_adjustment_logs: เก็บประวัติการดำเนินการ
CREATE TABLE IF NOT EXISTS wage_adjustment_logs (
  id BIGSERIAL PRIMARY KEY,
  adjustment_id BIGINT REFERENCES wage_adjustments(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  period INT NOT NULL CHECK (period IN (1, 2)),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('income', 'deduction')),
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
  old_data JSONB,
  performed_by TEXT NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ตาราง auto_adjustment_logs: เก็บประวัติการคำนวณอัตโนมัติ
CREATE TABLE IF NOT EXISTS auto_adjustment_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  period INT NOT NULL CHECK (period IN (1, 2)),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('income', 'deduction')),
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  details JSONB,
  calculation_run_id TEXT,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- View: รวม manual และ auto adjustments
CREATE OR REPLACE VIEW wage_adjustments_combined AS
SELECT
  'manual' as source_type,
  wa.id,
  wa.employee_id,
  e.name as employee_name,
  e.department,
  wa.year,
  wa.month,
  wa.period,
  wa.adjustment_type,
  wa.category,
  wa.amount,
  wa.description,
  NULL as details,
  wa.created_at,
  wa.created_by as performed_by,
  TRUE as can_edit,
  TRUE as can_delete
FROM wage_adjustments wa
LEFT JOIN employees e ON wa.employee_id = e.employee_id

UNION ALL

SELECT
  'auto' as source_type,
  aal.id,
  aal.employee_id,
  e.name as employee_name,
  e.department,
  aal.year,
  aal.month,
  aal.period,
  aal.adjustment_type,
  aal.category,
  aal.amount,
  NULL as description,
  aal.details,
  aal.calculated_at as created_at,
  'system' as performed_by,
  FALSE as can_edit,
  FALSE as can_delete
FROM auto_adjustment_logs aal
LEFT JOIN employees e ON aal.employee_id = e.employee_id;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wage_adjustment_logs_employee_id ON wage_adjustment_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_wage_adjustment_logs_year_month ON wage_adjustment_logs(year, month);
CREATE INDEX IF NOT EXISTS idx_auto_adjustment_logs_employee_id ON auto_adjustment_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_auto_adjustment_logs_year_month ON auto_adjustment_logs(year, month);
```

### ขั้นตอนที่ 2: สร้าง Triggers

รัน SQL ไฟล์นี้ใน Supabase Console:

**ไฟล์**: `sql/wage_adjustment_triggers.sql`

```sql
-- Function: บันทึก log เมื่อมีการ insert
CREATE OR REPLACE FUNCTION log_wage_adjustment_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wage_adjustment_logs (
    adjustment_id, employee_id, year, month, period,
    adjustment_type, category, amount, description,
    action_type, performed_by, performed_at
  ) VALUES (
    NEW.id, NEW.employee_id, NEW.year, NEW.month, NEW.period,
    NEW.adjustment_type, NEW.category, NEW.amount, NEW.description,
    'create', NEW.created_by, NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: บันทึก log เมื่อมีการ update
CREATE OR REPLACE FUNCTION log_wage_adjustment_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wage_adjustment_logs (
    adjustment_id, employee_id, year, month, period,
    adjustment_type, category, amount, description,
    action_type, old_data, performed_by, performed_at
  ) VALUES (
    NEW.id, NEW.employee_id, NEW.year, NEW.month, NEW.period,
    NEW.adjustment_type, NEW.category, NEW.amount, NEW.description,
    'update',
    jsonb_build_object(
      'category', OLD.category,
      'amount', OLD.amount,
      'description', OLD.description
    ),
    COALESCE(NEW.created_by, 'system'), NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: บันทึก log เมื่อมีการ delete
CREATE OR REPLACE FUNCTION log_wage_adjustment_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wage_adjustment_logs (
    adjustment_id, employee_id, year, month, period,
    adjustment_type, category, amount, description,
    action_type, old_data, performed_by, performed_at
  ) VALUES (
    OLD.id, OLD.employee_id, OLD.year, OLD.month, OLD.period,
    OLD.adjustment_type, OLD.category, OLD.amount, OLD.description,
    'delete',
    jsonb_build_object(
      'category', OLD.category,
      'amount', OLD.amount,
      'description', OLD.description
    ),
    COALESCE(OLD.created_by, 'system'), NOW()
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_log_wage_adjustment_create ON wage_adjustments;
CREATE TRIGGER trigger_log_wage_adjustment_create
  AFTER INSERT ON wage_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION log_wage_adjustment_create();

DROP TRIGGER IF EXISTS trigger_log_wage_adjustment_update ON wage_adjustments;
CREATE TRIGGER trigger_log_wage_adjustment_update
  AFTER UPDATE ON wage_adjustments
  FOR EACH ROW
  WHEN (
    OLD.category IS DISTINCT FROM NEW.category OR
    OLD.amount IS DISTINCT FROM NEW.amount OR
    OLD.description IS DISTINCT FROM NEW.description
  )
  EXECUTE FUNCTION log_wage_adjustment_update();

DROP TRIGGER IF EXISTS trigger_log_wage_adjustment_delete ON wage_adjustments;
CREATE TRIGGER trigger_log_wage_adjustment_delete
  BEFORE DELETE ON wage_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION log_wage_adjustment_delete();
```

---

## 🔧 API Updates

### ไฟล์ที่อัพเดทแล้ว

#### 1. `/app/api/wages/adjustments/route.ts`
- ✅ เพิ่ม PUT method สำหรับแก้ไข
- ✅ รองรับ `includeAuto=true` เพื่อดึง auto logs
- ✅ รองรับ `periods=1,2` เพื่อ filter หลายงวด
- ✅ รองรับ `employee_id` เพื่อ filter ตามพนักงาน

**ตัวอย่างการใช้งาน**:
```bash
# ดึงทั้ง manual + auto logs
GET /api/wages/adjustments?month=11&year=2025&periods=1,2&includeAuto=true

# ดึงเฉพาะของพนักงาน
GET /api/wages/adjustments?month=11&year=2025&periods=1,2&employee_id=20051185&includeAuto=true

# แก้ไขรายการ
PUT /api/wages/adjustments
Body: {
  "id": 123,
  "category": "ค่าครองชีพ",
  "amount": 1500,
  "description": "แก้ไขจำนวนเงิน"
}

# ลบรายการ
DELETE /api/wages/adjustments?id=123

# เพิ่มรายการ
POST /api/wages/adjustments
Body: {
  "employee_id": "20051185",
  "year": 2025,
  "month": 11,
  "period": 1,
  "adjustment_type": "income",
  "category": "โบนัส",
  "amount": 5000,
  "description": "โบนัสพิเศษ",
  "created_by": "admin"
}
```

---

## 📱 Frontend ที่ต้องอัพเดท

### ไฟล์ที่ต้องแก้: `/app/wages/logs/page.tsx`

ต้องเพิ่ม:

1. **State สำหรับ Modal**:
```typescript
const [showEditModal, setShowEditModal] = useState(false)
const [showAddModal, setShowAddModal] = useState(false)
const [selectedLog, setSelectedLog] = useState<any | null>(null)
const [editCategory, setEditCategory] = useState('')
const [editAmount, setEditAmount] = useState('')
const [editDescription, setEditDescription] = useState('')
```

2. **Toggle includeAuto**:
```typescript
const [includeAuto, setIncludeAuto] = useState(true)
```

3. **Search พนักงาน**:
```typescript
const [employeeSearchQuery, setEmployeeSearchQuery] = useState('')
```

4. **Functions**:
```typescript
const handleEdit = (log: any) => {
  setSelectedLog(log)
  setEditCategory(log.category)
  setEditAmount(log.amount.toString())
  setEditDescription(log.description || '')
  setShowEditModal(true)
}

const handleDelete = async (id: number) => {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return

  const res = await fetch(`/api/wages/adjustments?id=${id}`, {
    method: 'DELETE'
  })
  const data = await res.json()

  if (data.success) {
    alert('ลบรายการสำเร็จ')
    fetchLogs()
  }
}

const handleDuplicate = (log: any) => {
  // เปิด modal เพิ่มรายการด้วยข้อมูลเดิม
  setEditCategory(log.category)
  setEditAmount(log.amount.toString())
  setEditDescription(log.description || '')
  setShowAddModal(true)
}

const saveEdit = async () => {
  const res = await fetch('/api/wages/adjustments', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: selectedLog.id,
      category: editCategory,
      amount: parseFloat(editAmount),
      description: editDescription
    })
  })

  const data = await res.json()

  if (data.success) {
    alert('แก้ไขสำเร็จ')
    setShowEditModal(false)
    fetchLogs()
  }
}
```

5. **UI Components**:

**Checkbox แสดง Auto Logs**:
```tsx
<label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <input
    type="checkbox"
    checked={includeAuto}
    onChange={(e) => setIncludeAuto(e.target.checked)}
  />
  <span>แสดงรายการอัตโนมัติ (มาสาย, เบี้ยขยัน, SSO)</span>
</label>
```

**Action Buttons ในตาราง**:
```tsx
<td>
  {log.can_edit && (
    <>
      <button
        onClick={() => handleEdit(log)}
        className="btn btn-sm btn-secondary"
        style={{ marginRight: '4px' }}
      >
        ✏️ แก้ไข
      </button>
      <button
        onClick={() => handleDuplicate(log)}
        className="btn btn-sm btn-secondary"
        style={{ marginRight: '4px' }}
      >
        📋 ทำซ้ำ
      </button>
    </>
  )}
  {log.can_delete && (
    <button
      onClick={() => handleDelete(log.id)}
      className="btn btn-sm btn-danger"
    >
      🗑️ ลบ
    </button>
  )}
  {log.source_type === 'auto' && (
    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
      อัตโนมัติ
    </span>
  )}
</td>
```

---

## 🔄 Integration กับ Calculate API

ต้องแก้ `/app/api/wages/calculate-v2/route.ts` เพื่อบันทึก auto logs:

```typescript
// หลังจากคำนวณ periodWage แล้ว บันทึก auto logs
const autoLogs = []

// หักเงินมาสาย
if (periodWage.late_deduction > 0) {
  autoLogs.push({
    employee_id: employee.employee_id,
    year,
    month,
    period,
    adjustment_type: 'deduction',
    category: 'หักเงินมาสาย',
    amount: periodWage.late_deduction,
    details: {
      late_minutes: periodWage.late_minutes,
      per_minute_rate: employee.perhr_salary / 60
    },
    calculation_run_id: `calc_${Date.now()}`
  })
}

// เบี้ยขยัน
if (periodWage.attendance_bonus > 0) {
  autoLogs.push({
    employee_id: employee.employee_id,
    year,
    month,
    period,
    adjustment_type: 'income',
    category: 'เบี้ยขยัน',
    amount: periodWage.attendance_bonus,
    details: {
      bonus_type: 'attendance',
      qualified: true
    },
    calculation_run_id: `calc_${Date.now()}`
  })
}

// ค่ากะดึก
if (periodWage.night_shift_allowance > 0) {
  autoLogs.push({
    employee_id: employee.employee_id,
    year,
    month,
    period,
    adjustment_type: 'income',
    category: 'ค่ากะดึก',
    amount: periodWage.night_shift_allowance,
    details: {
      night_shift_days: periodWage.night_shift_days,
      rate_per_day: 40
    },
    calculation_run_id: `calc_${Date.now()}`
  })
}

// SSO
if (periodWage.sso > 0) {
  autoLogs.push({
    employee_id: employee.employee_id,
    year,
    month,
    period,
    adjustment_type: 'deduction',
    category: 'ประกันสังคม (SSO)',
    amount: periodWage.sso,
    details: {
      income: periodWage.total_income,
      sso_rate: 0.05,
      max_sso: 750
    },
    calculation_run_id: `calc_${Date.now()}`
  })
}

// ภาษี
if (periodWage.tax > 0) {
  autoLogs.push({
    employee_id: employee.employee_id,
    year,
    month,
    period,
    adjustment_type: 'deduction',
    category: 'ภาษีหัก ณ ที่จ่าย',
    amount: periodWage.tax,
    details: {
      taxable_income: periodWage.total_income,
      tax_rate: 0 // กำหนดตาม bracket
    },
    calculation_run_id: `calc_${Date.now()}`
  })
}

// บันทึก auto logs ทั้งหมด
if (autoLogs.length > 0) {
  await supabase
    .from('auto_adjustment_logs')
    .insert(autoLogs)
}
```

---

## ✅ Checklist

### Database
- [ ] รัน `sql/wage_adjustment_logs.sql` ใน Supabase Console
- [ ] รัน `sql/wage_adjustment_triggers.sql` ใน Supabase Console
- [ ] ทดสอบ view `wage_adjustments_combined` ว่าทำงานได้

### API
- [x] อัพเดท `/app/api/wages/adjustments/route.ts` (เพิ่ม PUT, includeAuto)
- [ ] แก้ `/app/api/wages/calculate-v2/route.ts` เพื่อบันทึก auto logs

### Frontend
- [ ] แก้ `/app/wages/logs/page.tsx` เพิ่ม:
  - [ ] Checkbox "แสดงรายการอัตโนมัติ"
  - [ ] Search พนักงาน
  - [ ] Action buttons (แก้ไข, ลบ, ทำซ้ำ)
  - [ ] Edit Modal
  - [ ] Add Modal
  - [ ] Confirm delete dialog

### Testing
- [ ] ทดสอบเพิ่มรายการ
- [ ] ทดสอบแก้ไขรายการ
- [ ] ทดสอบลบรายการ
- [ ] ทดสอบทำซ้ำรายการ
- [ ] ทดสอบ filter ตามพนักงาน
- [ ] ทดสอบแสดง auto logs

---

## 📌 หมายเหตุ

1. **Auto Logs** จะถูกสร้างขึ้นอัตโนมัติเมื่อรัน Calculate V2 API
2. **Manual Logs** จะถูกสร้างผ่าน triggers อัตโนมัติ
3. **View `wage_adjustments_combined`** รวม manual + auto logs พร้อมข้อมูลพนักงาน
4. **can_edit** และ **can_delete** จะเป็น `false` สำหรับ auto logs
5. **details** field เก็บข้อมูลเพิ่มเติม (JSON) สำหรับ auto logs
