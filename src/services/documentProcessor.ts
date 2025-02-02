import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'date' | 'number' | 'signature';
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  value?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  options?: string[]; // For select, radio, checkbox
}

export interface ProcessedDocument {
  fields: FormField[];
  metadata: {
    title: string;
    author?: string;
    createdAt: string;
    pageCount: number;
  };
}

export class DocumentProcessor {
  private async extractText(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    
    switch (file.type) {
      case 'application/pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
      
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        return value;
      
      case 'text/plain':
        return new TextDecoder().decode(buffer);
      
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  private async analyzeText(text: string): Promise<FormField[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "Analyze the following document text and identify form fields. Return a JSON array of field objects with name, type, required status, and validation rules."
        }, {
          role: "user",
          content: text
        }],
        response_format: { type: "json_object" }
      });

      const fields = JSON.parse(response.choices[0].message.content).fields;
      return this.validateFields(fields);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze document');
    }
  }

  private validateFields(fields: any[]): FormField[] {
    return fields.map(field => ({
      id: crypto.randomUUID(),
      name: field.name,
      type: this.validateFieldType(field.type),
      required: Boolean(field.required),
      validation: field.validation || {},
      options: field.options,
      value: field.value
    }));
  }

  private validateFieldType(type: string): FormField['type'] {
    const validTypes: FormField['type'][] = [
      'text', 'checkbox', 'radio', 'select', 'date', 'number', 'signature'
    ];
    return validTypes.includes(type as FormField['type']) 
      ? type as FormField['type']
      : 'text';
  }

  public async processDocument(file: File): Promise<ProcessedDocument> {
    try {
      const text = await this.extractText(file);
      const fields = await this.analyzeText(text);

      return {
        fields,
        metadata: {
          title: file.name,
          createdAt: new Date().toISOString(),
          pageCount: 1 // This would need to be calculated based on the document
        }
      };
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error('Failed to process document');
    }
  }
}