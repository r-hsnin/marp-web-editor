export interface MarpSettings {
  theme: string;
  paginate: boolean;
  header?: string;
  footer?: string;
}

export interface FrontmatterExtraction {
  frontmatter: string;
  content: string;
  hasManualFrontmatter: boolean;
}
