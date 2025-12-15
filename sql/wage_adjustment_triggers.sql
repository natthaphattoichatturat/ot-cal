-- Function: บันทึก log เมื่อมีการ insert wage_adjustment
CREATE OR REPLACE FUNCTION log_wage_adjustment_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wage_adjustment_logs (
    adjustment_id,
    employee_id,
    year,
    month,
    period,
    adjustment_type,
    category,
    amount,
    description,
    action_type,
    performed_by,
    performed_at
  ) VALUES (
    NEW.id,
    NEW.employee_id,
    NEW.year,
    NEW.month,
    NEW.period,
    NEW.adjustment_type,
    NEW.category,
    NEW.amount,
    NEW.description,
    'create',
    NEW.created_by,
    NEW.created_at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: บันทึก log เมื่อมีการ update wage_adjustment
CREATE OR REPLACE FUNCTION log_wage_adjustment_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wage_adjustment_logs (
    adjustment_id,
    employee_id,
    year,
    month,
    period,
    adjustment_type,
    category,
    amount,
    description,
    action_type,
    old_data,
    performed_by,
    performed_at
  ) VALUES (
    NEW.id,
    NEW.employee_id,
    NEW.year,
    NEW.month,
    NEW.period,
    NEW.adjustment_type,
    NEW.category,
    NEW.amount,
    NEW.description,
    'update',
    jsonb_build_object(
      'category', OLD.category,
      'amount', OLD.amount,
      'description', OLD.description,
      'adjustment_type', OLD.adjustment_type
    ),
    COALESCE(NEW.created_by, 'system'),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: บันทึก log เมื่อมีการ delete wage_adjustment
CREATE OR REPLACE FUNCTION log_wage_adjustment_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wage_adjustment_logs (
    adjustment_id,
    employee_id,
    year,
    month,
    period,
    adjustment_type,
    category,
    amount,
    description,
    action_type,
    old_data,
    performed_by,
    performed_at
  ) VALUES (
    OLD.id,
    OLD.employee_id,
    OLD.year,
    OLD.month,
    OLD.period,
    OLD.adjustment_type,
    OLD.category,
    OLD.amount,
    OLD.description,
    'delete',
    jsonb_build_object(
      'category', OLD.category,
      'amount', OLD.amount,
      'description', OLD.description,
      'adjustment_type', OLD.adjustment_type
    ),
    COALESCE(OLD.created_by, 'system'),
    NOW()
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
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.adjustment_type IS DISTINCT FROM NEW.adjustment_type
  )
  EXECUTE FUNCTION log_wage_adjustment_update();

DROP TRIGGER IF EXISTS trigger_log_wage_adjustment_delete ON wage_adjustments;
CREATE TRIGGER trigger_log_wage_adjustment_delete
  BEFORE DELETE ON wage_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION log_wage_adjustment_delete();

-- Comment
COMMENT ON FUNCTION log_wage_adjustment_create IS 'บันทึก log เมื่อสร้าง wage adjustment';
COMMENT ON FUNCTION log_wage_adjustment_update IS 'บันทึก log เมื่อแก้ไข wage adjustment';
COMMENT ON FUNCTION log_wage_adjustment_delete IS 'บันทึก log เมื่อลบ wage adjustment';
