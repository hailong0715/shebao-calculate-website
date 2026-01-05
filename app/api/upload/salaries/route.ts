import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as xlsx from 'xlsx'
import type { Salary } from '@/types/database'

// POST: 上传工资数据
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
    const requiredFields = ['employee_id', 'employee_name', 'month', 'salary_amount']
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
    const salaries: Omit<Salary, 'id'>[] = data.map((row) => ({
      employee_id: String(row.employee_id),
      employee_name: String(row.employee_name),
      month: String(row.month),
      salary_amount: Number(row.salary_amount),
    }))

    // 先清空旧数据（可选）
    await supabase.from('salaries').delete().neq('id', 0)

    // 插入新数据
    const { data: insertedData, error } = await supabase
      .from('salaries')
      .insert(salaries)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: insertedData?.length || 0,
    })
  } catch (error) {
    console.error('上传工资数据失败:', error)
    return NextResponse.json(
      { error: '上传失败，请检查文件格式' },
      { status: 500 }
    )
  }
}
