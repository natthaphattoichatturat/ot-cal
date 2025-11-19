import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET - ดึงข้อมูล master data ของรายการเงินได้/เงินหัก
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') // 'income' หรือ 'deduction'

    let query = supabase
      .from('income_deduction_master')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching master data:', error)
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET master data error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}

