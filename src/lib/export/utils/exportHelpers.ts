export type ExportMimeType =
  | "text/html"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export type FileExtension = "html" | "pdf" | "pptx";

/**
 * marp-cli生成HTMLのタイトルを更新
 * marp-cliは完全なHTMLを生成するため、タイトルのみ置換
 */
export function generateCompleteHTML(
  marpHTML: string,
  title = "Marp Presentation"
): string {
  if (marpHTML.includes("<title>") && title !== "Marp Presentation") {
    return marpHTML.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  }
  return marpHTML;
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: ExportMimeType = "text/html"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Markdownから安全なファイル名を生成
 * 最初の見出しをタイトルとして使用、特殊文字を除去
 */
export function generateFilename(
  markdown: string,
  extension: FileExtension = "html"
): string {
  // 最初の見出しからタイトルを抽出
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  let title = titleMatch ? titleMatch[1] : "marp-presentation";

  // ファイル名として安全な文字列に変換
  title =
    title ||
    ""
      .replace(/[^a-zA-Z0-9\s-]/g, "") // 特殊文字除去
      .replace(/\s+/g, "-") // スペースをハイフンに
      .toLowerCase()
      .substring(0, 50); // 長さ制限

  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${title}-${timestamp}.${extension}`;
}
