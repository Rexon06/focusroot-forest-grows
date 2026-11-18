import { FileUp, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateFlashcards } from "@/lib/flashcards";
import { parseStudyCards } from "@/lib/notes-parser";
import { readNoteFile } from "@/lib/read-file";
import type { Note } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

export interface NoteDraft {
  title: string;
  subject: string;
  content: string;
  source: Note["source"];
  fileName?: string;
}

interface Props {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Existing note to edit; omit to create. */
  note?: Note;
  initial?: Partial<NoteDraft>;
  onSaved?(note: Note): void;
}

const EMPTY: NoteDraft = { title: "", subject: "", content: "", source: "manual" };

export function NoteEditorDialog({ open, onOpenChange, note, initial, onSaved }: Props) {
  const notes = useAppStore((s) => s.notes);
  const addNote = useAppStore((s) => s.addNote);
  const updateNote = useAppStore((s) => s.updateNote);
  const regenerate = useAppStore((s) => s.regenerateFlashcards);
  const [draft, setDraft] = useState<NoteDraft>(EMPTY);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(
      note
        ? { title: note.title, subject: note.subject, content: note.content, source: note.source, fileName: note.fileName }
        : { ...EMPTY, ...initial },
    );
  }, [open, note, initial]);

  const subjects = useMemo(() => Array.from(new Set(notes.map((n) => n.subject))).sort(), [notes]);
  const cardCount = useMemo(() => parseStudyCards(draft.content).length, [draft.content]);
  const flashCount = useMemo(() => generateFlashcards(draft.content).length, [draft.content]);

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    try {
      const r = await readNoteFile(file);
      setDraft((d) => ({ ...d, title: d.title || r.title, content: r.content, source: "upload", fileName: r.fileName }));
      toast.success(`Loaded ${r.fileName}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = () => {
    if (!draft.content.trim()) {
      toast.error("Add some note text first.");
      return;
    }
    if (note) {
      const changed = note.content !== draft.content;
      updateNote(note.id, { title: draft.title, subject: draft.subject, content: draft.content });
      if (changed) regenerate(note.id);
      toast.success("Note updated");
      onSaved?.({ ...note, ...draft });
    } else {
      const created = addNote(draft);
      toast.success(`Created ${cardCount} study cards`);
      onSaved?.(created);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "New note"}</DialogTitle>
          <DialogDescription>Use # headings or blank lines to split your notes into study cards.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="font-pixel text-[8px] uppercase text-gold">Title</span>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Cell Biology" maxLength={80} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-pixel text-[8px] uppercase text-gold">Subject / folder</span>
              <Input
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                placeholder="e.g. Biology"
                list="subject-options"
                maxLength={40}
              />
              <datalist id="subject-options">
                {subjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between font-pixel text-[8px] uppercase text-gold">
              Notes
              {draft.fileName && <span className="normal-case text-muted-foreground">from {draft.fileName}</span>}
            </span>
            <Textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder={"# Photosynthesis\nPhotosynthesis is how plants turn light into chemical energy.\n\nChlorophyll: the green pigment that absorbs light."}
              rows={12}
              className="min-h-56 font-body"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.markdown,text/plain,text/markdown"
                className="hidden"
                onChange={(e) => void loadFile(e.target.files?.[0])}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <FileUp />} Load .txt / .md
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {cardCount} study cards · {flashCount} flashcards
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!draft.content.trim()}>
              {note ? "Save changes" : "Create cards"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
