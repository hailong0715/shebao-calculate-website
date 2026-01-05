// Database table types

export interface City {
  id: number
  city_name: string
  year: string
  base_min: number
  base_max: number
  rate: number
}

export interface Salary {
  id: number
  employee_id: string
  employee_name: string
  month: string // YYYYMM format
  salary_amount: number
}

export interface Result {
  id: number
  employee_name: string
  city_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
  calculated_at: string
}

export interface EmployeeSalarySummary {
  employee_name: string
  avg_salary: number
  months: number
}
