export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
  placeholder: string;
}

export interface DataMapping {
  csvColumn: string;
  templateField: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  message?: string;
}