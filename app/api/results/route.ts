import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Result } from '@/types/database'

// GET: 获取所有计算结果
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('calculated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ results: data || [] })
  } catch (error) {
    console.error('获取结果失败:', error)
    return NextResponse.json(
      { error: '获取结果失败' },
      { status: 500 }
    )
  }
}
