/**
 * Share機能の型定義
 */

export interface ShareFormData {
  title: string;
  password: string;
  expirationDays: string;
}

export interface ShareResult {
  shareUrl: string;
  expiresAt: string;
  success: boolean;
}

export interface ShareDialogProps {
  isOpen?: boolean;
  markdown: string;
  theme: string;
  onClose: () => void;
  getRenderMarkdown?: ((markdown: string) => string) | null;
}

export interface ShareFormProps {
  formData: ShareFormData;
  onFormDataChange: (data: Partial<ShareFormData>) => void;
  onSubmit: () => void;
  onClose?: () => void;
  isSharing: boolean;
  hasError: boolean;
  errorMessage?: string | undefined;
  onClearError: () => void;
}

export interface ShareResultProps {
  result: ShareResult;
  onClose: () => void;
  onCopyToClipboard: (text: string) => Promise<void>;
  password?: string | undefined;
}

export interface UseShareDialogOptions {
  markdown: string;
  theme: string;
  getRenderMarkdown?: ((markdown: string) => string) | null;
}

export interface UseShareDialogReturn {
  // State
  isSharing: boolean;
  shareResult: ShareResult | null;
  formData: ShareFormData;
  hasError: boolean;
  errorMessage?: string | undefined;

  // Actions
  handleShare: () => Promise<void>;
  handleFormDataChange: (data: Partial<ShareFormData>) => void;
  handleCopyToClipboard: (text: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export type ExpirationOption = "1" | "7" | "30";

export const EXPIRATION_OPTIONS: Array<{
  value: ExpirationOption;
  label: string;
}> = [
  { value: "1", label: "24 hours" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
];
