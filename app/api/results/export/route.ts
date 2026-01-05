import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as xlsx from 'xlsx'

export async function GET() {
  try {
    // 获取所有结果
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('calculated_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '没有数据可导出' }, { status: 400 })
    }

    // 转换为 Excel 格式
    const exportData = data.map((item) => ({
      '员工姓名': item.employee_name,
      '城市': item.city_name,
      '平均工资': item.avg_salary,
      '缴费基数': item.contribution_base,
      '公司缴纳金额': item.company_fee,
      '计算时间': new Date(item.calculated_at).toLocaleString('zh-CN'),
    }))

    // 创建工作簿
    const worksheet = xlsx.utils.json_to_sheet(exportData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, '计算结果')

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 12 },  // 员工姓名
      { wch: 10 },  // 城市
      { wch: 12 },  // 平均工资
      { wch: 12 },  // 缴费基数
      { wch: 15 },  // 公司缴纳金额
      { wch: 20 },  // 计算时间
    ]

    // 生成 Excel 文件
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // 返回文件
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="社保计算结果_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('导出失败:', error)
    return NextResponse.json({ error: '导出失败' }, { status: 500 })
  }
}
