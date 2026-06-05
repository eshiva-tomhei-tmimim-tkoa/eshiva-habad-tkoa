import * as XLSX from 'xlsx';
import type { ColumnDef } from './entities';

type Row = Record<string, unknown>;

/**
 * Экспорт строк таблицы в .xlsx по тем же колонкам, что видны в DataGrid.
 * Значения берутся из ColumnDef.value (как в гриде), поэтому экспорт всегда
 * совпадает с отображением. Файл скачивается на клиенте (SheetJS).
 */
export function exportRowsToXlsx(filename: string, columns: ColumnDef[], rows: Row[]): void {
  const header = columns.map((c) => c.header);
  const body = rows.map((r) => columns.map((c) => c.value(r)));
  const ws = XLSX.utils.aoa_to_sheet([header, ...body]);

  // Ширины колонок по самому длинному значению (с разумным потолком).
  ws['!cols'] = columns.map((c, i) => {
    const maxLen = Math.max(c.header.length, ...body.map((row) => String(row[i] ?? '').length));
    return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Лист1');
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filename}-${stamp}.xlsx`);
}
