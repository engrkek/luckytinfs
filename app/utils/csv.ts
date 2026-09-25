type CsvColumns<T> = Record<string, (row: T) => unknown>

// Registrant-typed text can start with = + - @ and run as a formula in Excel/Sheets.
// Plain @handles are harmless, so they're left readable.
function cell(value: unknown) {
  let s = value == null ? '' : value instanceof Date ? value.toISOString() : String(value)
  if (/^[=+\-@\t\r]/.test(s) && !/^@[\w.]+$/.test(s))
    s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Local wall-clock time, sortable: 2026-09-24 00:50:13 */
export function csvDate(value: string | number | Date | null | undefined) {
  return value == null ? '' : new Date(value).toLocaleString('sv-SE')
}

/** e.g. donations-2026-09-24.csv */
export function csvFilename(name: string) {
  return `${name}-${new Date().toLocaleDateString('sv-SE')}.csv`
}

export function toCsv<T>(rows: T[], columns: CsvColumns<T>) {
  const header = Object.keys(columns).map(cell).join(',')
  const body = rows.map(r => Object.values(columns).map(get => cell(get(r))).join(','))
  return [header, ...body].join('\r\n')
}

export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumns<T>) {
  // BOM so Excel reads UTF-8 (ñ, emoji) instead of mangling it
  const blob = new Blob(['﻿', toCsv(rows, columns)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
