# 五险一金计算器 - 项目上下文管理中枢

## 项目目标
构建一个迷你"五险一金"计算器 Web 应用，根据预设的员工工资数据和城市社保标准，计算出公司为每位员工应缴纳的社保公积金费用，并清晰展示结果。

## 技术栈
- **前端框架**: Next.js (App Router)
- **UI/样式**: Tailwind CSS
- **数据库/后端**: Supabase (PostgreSQL + Auth + Storage)

## 数据库设计 (Supabase)

### 1. cities (城市标准表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int (PK) | 主键 |
| city_name | text | 城市名 |
| year | text | 年份 |
| base_min | int | 社保基数下限 |
| base_max | int | 社保基数上限 |
| rate | float | 综合缴纳比例 (如 0.15) |

### 2. salaries (员工工资表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int (PK) | 主键 |
| employee_id | text | 员工工号 |
| employee_name | text | 员工姓名 |
| month | text | 年份月份 (YYYYMM) |
| salary_amount | int | 该月工资金额 |

### 3. results (计算结果表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int (PK) | 主键 |
| employee_name | text | 员工姓名 |
| city_name | text | 城市名 |
| avg_salary | float | 年度月平均工资 |
| contribution_base | float | 最终缴费基数 |
| company_fee | float | 公司缴纳金额 |
| calculated_at | timestamp | 计算时间 |

## 核心业务逻辑

### 计算函数执行流程
1. 从 `salaries` 表中读取所有数据
2. 按 `employee_name` 分组，计算每位员工的"年度月平均工资"
3. 从 `cities` 表中获取**用户选择的城市**的 `base_min`, `base_max`, `rate`
4. 对每位员工，将"年度月平均工资"与基数上下限比较，确定"最终缴费基数"：
   - 平均工资 < 下限 → 使用下限
   - 平均工资 > 上限 → 使用上限
   - 在中间 → 使用平均工资本身
5. 计算公司应缴纳金额：`公司缴纳金额 = 最终缴费基数 × rate`
6. 将结果（含城市名和计算时间）存入 `results` 表

### 数据处理策略
- 支持用户选择：**覆盖旧数据** 或 **追加新数据**

## 前端页面功能

### 1. `/` 主页
- 定位：应用入口和导航中枢
- 布局：两个功能卡片（并排或垂直排列）
  - **卡片一「数据上传」**：点击跳转至 `/upload`
  - **卡片二「结果查询」**：点击跳转至 `/results`

### 2. `/upload` (数据上传与操作页)
- 定位：后台操作控制面板
- **城市选择器**：下拉菜单选择计算用的城市
- **上传区域一「上传城市数据」**：
  - 上传 Excel 到 `cities` 表
  - 支持批量导入/覆盖
- **上传区域二「上传工资数据」**：
  - 上传 Excel 到 `salaries` 表
  - 支持批量导入/覆盖
- **计算控制区域**：
  - **数据处理选项**：单选框「覆盖旧数据」/「追加新数据」
  - **「执行计算」按钮**：触发计算并存储结果

### 3. `/results` (结果查询与展示页)
- 定位：计算成果展示页面
- **数据加载**：页面加载时从 `results` 表获取所有结果
- **结果展示**：结构清晰的表格（Tailwind CSS）
  - 表头：员工姓名、城市、平均工资、缴费基数、公司缴纳金额、计算时间
- **「导出 Excel」按钮**：将当前结果导出为 Excel 文件

---

## TODO List (详细开发步骤)

### Phase 1: 环境搭建与项目初始化
- [ ] 1.1 创建 Next.js 项目（使用 App Router）
- [ ] 1.2 安装 Tailwind CSS 并配置
- [ ] 1.3 安装 Supabase 客户端库 (`@supabase/supabase-js`)
- [ ] 1.4 安装 Excel 处理库 (`xlsx` 或 `sheetjs`)
- [ ] 1.5 创建 `.env.local` 文件模板（Supabase URL 和 Key）

### Phase 2: Supabase 配置
- [ ] 2.1 在 Supabase 创建项目
- [ ] 2.2 在 Supabase 中创建三张表（cities, salaries, results）
- [ ] 2.3 配置表结构和约束
- [ ] 2.4 设置 RLS (Row Level Security) 策略
- [ ] 2.5 获取并配置环境变量

### Phase 3: 基础代码架构
- [ ] 3.1 创建 Supabase 客户端实例 (`lib/supabase.ts`)
- [ ] 3.2 创建类型定义文件 (`types/database.ts`)
- [ ] 3.3 创建基础布局组件 (`app/layout.tsx`)
- [ ] 3.4 配置 Tailwind 主题和自定义样式

### Phase 4: 主页开发 (`/`)
- [ ] 4.1 创建 `app/page.tsx` 主页组件
- [ ] 4.2 设计并实现功能卡片组件
- [ ] 4.3 添加卡片点击跳转逻辑
- [ ] 4.4 样式优化（响应式设计）

### Phase 5: 上传页开发 (`/upload`)
- [ ] 5.1 创建 `app/upload/page.tsx` 组件
- [ ] 5.2 实现城市选择下拉菜单（从 cities 表读取选项）
- [ ] 5.3 实现「上传城市数据」区域和文件选择
- [ ] 5.4 实现「上传工资数据」区域和文件选择
- [ ] 5.5 实现 Excel 解析和 Supabase 插入逻辑
- [ ] 5.6 实现数据处理选项（覆盖/追加）
- [ ] 5.7 实现计算按钮和计算逻辑
- [ ] 5.8 添加加载状态和错误处理

### Phase 6: 结果页开发 (`/results`)
- [ ] 6.1 创建 `app/results/page.tsx` 组件
- [ ] 6.2 实现从 Supabase 获取结果的逻辑
- [ ] 6.3 设计并实现结果表格组件
- [ ] 6.4 实现数据格式化显示
- [ ] 6.5 实现「导出 Excel」功能
- [ ] 6.6 添加空状态和加载状态处理

### Phase 7: API 路由开发
- [ ] 7.1 创建 `app/api/upload/cities/route.ts` - 城市数据上传 API
- [ ] 7.2 创建 `app/api/upload/salaries/route.ts` - 工资数据上传 API
- [ ] 7.3 创建 `app/api/calculate/route.ts` - 计算执行 API
- [ ] 7.4 创建 `app/api/results/export/route.ts` - 导出 Excel API

### Phase 8: 计算核心逻辑实现
- [ ] 8.1 实现平均工资计算函数
- [ ] 8.2 实现基数比较和确定逻辑
- [ ] 8.3 实现公司费用计算函数
- [ ] 8.4 实现覆盖/追加数据处理逻辑
- [ ] 8.5 添加错误处理和日志

### Phase 9: 测试与优化
- [ ] 9.1 使用提供的测试数据（cities.xlsx, salaries.xlsx）测试上传
- [ ] 9.2 测试计算功能正确性
- [ ] 9.3 测试多城市切换
- [ ] 9.4 测试覆盖/追加功能
- [ ] 9.5 测试导出功能
- [ ] 9.6 UI/UX 优化和响应式适配

### Phase 10: 部署准备
- [ ] 10.1 代码审查和清理
- [ ] 10.2 环境变量检查
- [ ] 10.3 部署到 Vercel (或其他平台)
- [ ] 10.4 最终功能验证

---

## 项目注意事项
- 始终参考此文件确保不偏离方向
- 每个 Phase 完成后标记进度
- 遇到需求变更及时更新此文件
