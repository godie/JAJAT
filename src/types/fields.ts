// src/types/fields.ts

export interface FieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'url' | 'timeline';
  enabled: boolean;
}
