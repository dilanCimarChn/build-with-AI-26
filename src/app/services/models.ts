// Tipos compartidos del pipeline PDF -> Markdown -> Landing.

/** Un fragmento de texto extraído del PDF con su info de estilo y posición. */
export interface Span {
  text: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  x: number;
  y: number;
  page: number;
}

/** Hipervínculo encontrado en las anotaciones del PDF. */
export interface PdfLink {
  text: string;
  url: string;
}

/** Resultado crudo de la extracción con PyMuPDF-equivalente (pdf.js). */
export interface ExtractionResult {
  spans: Span[];
  links: PdfLink[];
  /** Tamaño del archivo PDF en bytes (para estimar tokens "PDF directo"). */
  fileSize: number;
  pageCount: number;
}

/** Estadísticas de ahorro de tokens — el diferenciador técnico. */
export interface TokenStats {
  originalTokens: number;
  mdTokens: number;
  savingsPct: number;
}
