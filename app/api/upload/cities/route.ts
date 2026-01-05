import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as xlsx from 'xlsx'
import type { City } from '@/types/database'

// GET: 获取所有城市列表
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('city_name, year')
      .order('city_name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ cities: data || [] })
  } catch (error) {
    console.error('获取城市列表失败:', error)
    return NextResponse.json(
      { error: '获取城市列表失败' },
      { status: 500 }
    )
  }
}

// POST: 上传城市数据
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 })
    }

    // 读取 Excel 文件
    const arrayBuffer = await file.arrayBuffer()
    const workbook = xlsx.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet) as any[]

    // 验证数据格式
    const requiredFields = ['city_name', 'year', 'base_min', 'base_max', 'rate']
    for (const row of data) {
      for (const field of requiredFields) {
        if (!(field in row)) {
          return NextResponse.json(
            { error: `数据格式错误：缺少字段 ${field}` },
            { status: 400 }
          )
        }
      }
    }

    // 转换数据格式
    const cities: Omit<City, 'id'>[] = data.map((row) => ({
      city_name: row.city_name,
      year: String(row.year),
      base_min: Number(row.base_min),
      base_max: Number(row.base_max),
      rate: Number(row.rate),
    }))

    // 先清空旧数据（可选）
    await supabase.from('cities').delete().neq('id', 0)

    // 插入新数据
    const { data: insertedData, error } = await supabase
      .from('cities')
      .insert(cities)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: insertedData?.length || 0,
    })
  } catch (error) {
    console.error('上传城市数据失败:', error)
    return NextResponse.json(
      { error: '上传失败，请检查文件格式' },
      { status: 500 }
    )
  }
}
