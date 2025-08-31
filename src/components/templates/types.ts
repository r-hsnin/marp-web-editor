export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface Template extends TemplateMetadata {
  content: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
}
