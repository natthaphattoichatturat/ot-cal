export type PayrollPeriod = {
  year: number
  month: number
  period: 1 | 2
}

export function getPayrollPeriodFromDate(input: string | Date): PayrollPeriod {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date input')
  }

  const day = date.getDate()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let period: 1 | 2

  if (day <= 10) {
    period = 1
  } else if (day <= 25) {
    period = 2
  } else {
    period = 1
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return { year, month, period }
}
