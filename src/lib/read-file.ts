import { MAX_UPLOAD_BYTES, isAcceptedFile, titleFromFileName } from "./notes-parser";

export interface ReadNoteFile {
  title: string;
  content: string;
  fileName: string;
}

export async function readNoteFile(file: File): Promise<ReadNoteFile> {
  if (!isAcceptedFile(file.name)) throw new Error(`“${file.name}” isn't a .txt or .md file.`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`“${file.name}” is larger than 1 MB.`);
  const content = await file.text();
  if (!content.trim()) throw new Error(`“${file.name}” is empty.`);
  return { title: titleFromFileName(file.name), content, fileName: file.name };
}
