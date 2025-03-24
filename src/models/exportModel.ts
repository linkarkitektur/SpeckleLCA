/**
 * Export config for data exports into various formats
 */
export interface ExportConfig {
  format: ExportFormat
  resultKey?: number // if nothing we go with the first
}

/**
 * Exportformats available add more here if needed
 */
export enum ExportFormat {
  JSON = "JSON",
  CSV = "CSV",
  Excel = "Excel"
}