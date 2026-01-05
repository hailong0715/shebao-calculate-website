import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { City, Salary, Result } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { city, isOverwrite } = await request.json()

    if (!city) {
      return NextResponse.json({ error: '请选择城市' }, { status: 400 })
    }

    // 1. 获取城市标准
    const { data: cityData, error: cityError } = await supabase
      .from('cities')
      .select('*')
      .eq('city_name', city)
      .single()

    if (cityError || !cityData) {
      return NextResponse.json({ error: '未找到该城市的社保标准' }, { status: 404 })
    }

    // 2. 获取所有工资数据
    const { data: salaries, error: salariesError } = await supabase
      .from('salaries')
      .select('*')

    if (salariesError) throw salariesError
    if (!salaries || salaries.length === 0) {
      return NextResponse.json({ error: '没有工资数据，请先上传' }, { status: 400 })
    }

    // 3. 按员工分组计算平均工资
    const employeeMap = new Map<string, { total: number; count: number }>()

    for (const salary of salaries) {
      const current = employeeMap.get(salary.employee_name) || { total: 0, count: 0 }
      current.total += salary.salary_amount
      current.count += 1
      employeeMap.set(salary.employee_name, current)
    }

    // 4. 如果是覆盖模式，先删除旧结果
    if (isOverwrite) {
      await supabase.from('results').delete().neq('id', 0)
    }

    // 5. 计算每个员工的缴费基数和公司应缴金额
    const results: Omit<Result, 'id'>[] = []

    for (const [employeeName, { total, count }] of employeeMap.entries()) {
      const avgSalary = total / count

      // 确定缴费基数
      let contributionBase: number
      if (avgSalary < cityData.base_min) {
        contributionBase = cityData.base_min
      } else if (avgSalary > cityData.base_max) {
        contributionBase = cityData.base_max
      } else {
        contributionBase = avgSalary
      }

      // 计算公司应缴金额
      const companyFee = contributionBase * cityData.rate

      results.push({
        employee_name: employeeName,
        city_name: city,
        avg_salary: Number(avgSalary.toFixed(2)),
        contribution_base: Number(contributionBase.toFixed(2)),
        company_fee: Number(companyFee.toFixed(2)),
        calculated_at: new Date().toISOString(),
      })
    }

    // 6. 存入结果表
    const { data: insertedData, error: insertError } = await supabase
      .from('results')
      .insert(results)
      .select()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      count: insertedData?.length || 0,
    })
  } catch (error) {
    console.error('计算失败:', error)
    return NextResponse.json(
      { error: '计算失败，请稍后重试' },
      { status: 500 }
    )
  }
}
