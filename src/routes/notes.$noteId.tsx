import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FlashcardDeck } from "@/components/notes/FlashcardDeck";
import { NoteEditorDialog } from "@/components/notes/NoteEditorDialog";
import { QuizPanel } from "@/components/notes/QuizPanel";
import { StudyCardCarousel } from "@/components/notes/StudyCardCarousel";
import { Chip, EmptyState, Panel } from "@/components/pixel/Panel";
import { Sprite } from "@/components/pixel/Sprite";
import { DECOR_SPRITES } from "@/components/pixel/sprites";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseStudyCards } from "@/lib/notes-parser";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/notes/$noteId")({
  head: () => ({
    meta: [
      { title: "Study Note · FocusRoot" },
      { name: "description", content: "Study cards, flashcards and a quiz generated from your note." },
      { property: "og:title", content: "Study Note · FocusRoot" },
      { property: "og:description", content: "Study cards, flashcards and a quiz generated from your note." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NoteDetailPage,
});

function NoteDetailPage() {
  const { noteId } = Route.useParams();
  const note = useAppStore((s) => s.notes.find((n) => n.id === noteId));
  const flashCount = useAppStore((s) => s.flashcards.filter((f) => f.noteId === noteId).length);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cards = useMemo(() => parseStudyCards(note?.content ?? ""), [note?.content]);

  if (!note) {
    return (
      <EmptyState
        art={<Sprite sprite={DECOR_SPRITES.rock} size={56} />}
        title="Note not found"
        action={
          <Button asChild>
            <Link to="/notes">Back to notes</Link>
          </Button>
        }
      >
        This note may have been deleted.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to="/notes" className="inline-flex items-center gap-2 font-pixel text-[9px] uppercase text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All notes
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="break-words text-sm leading-relaxed sm:text-lg">{note.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip active>{note.subject}</Chip>
              <Chip>{cards.length} cards</Chip>
              <Chip>{flashCount} flashcards</Chip>
              <Chip>Updated {format(note.updatedAt, "d MMM")}</Chip>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cards">
        <TabsList className="flex w-full flex-wrap justify-start sm:w-auto">
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="flash">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="note">Full note</TabsTrigger>
        </TabsList>
        <TabsContent value="cards" className="mt-4">
          <StudyCardCarousel cards={cards} sourceTitle={note.title} />
        </TabsContent>
        <TabsContent value="flash" className="mt-4">
          <FlashcardDeck noteId={note.id} />
        </TabsContent>
        <TabsContent value="quiz" className="mt-4">
          <QuizPanel noteId={note.id} />
        </TabsContent>
        <TabsContent value="note" className="mt-4">
          <Panel>
            <pre className="whitespace-pre-wrap break-words font-body text-lg leading-relaxed">{note.content}</pre>
          </Panel>
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        Study cards, flashcards and quizzes are generated with built-in text rules on your device — no AI service is used.
      </p>

      <NoteEditorDialog open={editOpen} onOpenChange={setEditOpen} note={note} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              “{note.title}” and its {flashCount} flashcards will be removed from this device. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => {
                deleteNote(note.id);
                toast.success("Note deleted");
                void navigate({ to: "/notes" });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
