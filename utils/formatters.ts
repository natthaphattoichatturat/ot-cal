// Utility functions สำหรับ format ค่าต่างๆ

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0
}

export const formatDate = (dateStr: string, locale: string = 'th-TH'): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatThaiYear = (year: number): number => {
  return year + 543
}
