import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { FileUp, Loader2, Plus, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { NoteEditorDialog, type NoteDraft } from "@/components/notes/NoteEditorDialog";
import { Chip, EmptyState, PageHeader } from "@/components/pixel/Panel";
import { PixelIcon, Sprite } from "@/components/pixel/Sprite";
import { DECOR_SPRITES } from "@/components/pixel/sprites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseStudyCards } from "@/lib/notes-parser";
import { readNoteFile } from "@/lib/read-file";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/notes/")({
  head: () => ({
    meta: [
      { title: "Notes & Study Cards · FocusRoot" },
      { name: "description", content: "Upload or write notes and turn them into collectible study cards, flashcards and quizzes." },
      { property: "og:title", content: "Notes & Study Cards · FocusRoot" },
      { property: "og:description", content: "Upload or write notes and turn them into collectible study cards, flashcards and quizzes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const notes = useAppStore((s) => s.notes);
  const flashcards = useAppStore((s) => s.flashcards);
  const addNote = useAppStore((s) => s.addNote);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [initial, setInitial] = useState<Partial<NoteDraft> | undefined>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const subjects = useMemo(() => {
    const m = new Map<string, number>();
    notes.forEach((n) => m.set(n.subject, (m.get(n.subject) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => !subject || n.subject === subject)
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, query, subject]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      if (files.length === 1) {
        const r = await readNoteFile(files[0]);
        setInitial({ title: r.title, content: r.content, source: "upload", fileName: r.fileName, subject: subject ?? "" });
        setEditorOpen(true);
      } else {
        let ok = 0;
        for (const f of Array.from(files)) {
          try {
            const r = await readNoteFile(f);
            addNote({ title: r.title, content: r.content, subject: subject ?? "General", source: "upload", fileName: r.fileName });
            ok++;
          } catch (e) {
            toast.error(e instanceof Error ? e.message : `Couldn't read ${f.name}`);
          }
        }
        if (ok) toast.success(`Imported ${ok} note${ok > 1 ? "s" : ""}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Your library" title="Notes & study cards">
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".txt,.md,.markdown,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => void onFiles(e.target.files)}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <FileUp />} Upload
          </Button>
          <Button
            onClick={() => {
              setInitial(subject ? { subject } : undefined);
              setEditorOpen(true);
            }}
          >
            <Plus /> New note
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes…" className="pl-9" aria-label="Search notes" />
        </div>
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by subject">
            <Chip active={!subject} onClick={() => setSubject(null)}>
              All · {notes.length}
            </Chip>
            {subjects.map(([s, n]) => (
              <Chip key={s} active={subject === s} onClick={() => setSubject(subject === s ? null : s)}>
                {s} · {n}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {notes.length === 0 ? (
        <EmptyState
          art={<Sprite sprite={DECOR_SPRITES.mushroom} size={64} />}
          title="Your library is empty"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <FileUp /> Upload .txt / .md
              </Button>
              <Button onClick={() => setEditorOpen(true)}>
                <Plus /> Write a note
              </Button>
            </div>
          }
        >
          Paste or upload your study notes. Headings and paragraphs become collectible study cards, flashcards and quizzes.
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching notes">Try another search word or subject.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((n) => {
            const cards = parseStudyCards(n.content).length;
            const fc = flashcards.filter((f) => f.noteId === n.id);
            const remembered = fc.filter((f) => f.status === "remembered").length;
            return (
              <li key={n.id}>
                <Link
                  to="/notes/$noteId"
                  params={{ noteId: n.id }}
                  className="pixel-panel flex h-full flex-col gap-3 p-4 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 text-[11px] leading-relaxed text-foreground">{n.title}</h2>
                    <PixelIcon name="notes" size={18} className="shrink-0 text-gold" />
                  </div>
                  <p className="line-clamp-3 flex-1 text-muted-foreground">{n.content.replace(/[#*_`>]/g, "").slice(0, 200)}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip>{n.subject}</Chip>
                    <Chip>{cards} cards</Chip>
                    <Chip>
                      {remembered}/{fc.length} flash
                    </Chip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {n.source === "upload" ? `Uploaded ${n.fileName ?? ""}` : "Written"} · {format(n.updatedAt, "d MMM yyyy")}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <NoteEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={initial}
        onSaved={(note) => void navigate({ to: "/notes/$noteId", params: { noteId: note.id } })}
      />
    </div>
  );
}
