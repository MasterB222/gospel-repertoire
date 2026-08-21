import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { X, Check, GraduationCap } from "lucide-react";
import { addComment, getAssignment, listCommentsForSong, updateAssignmentStatus } from "../../lib/collaboration";
import { getSong } from "../../lib/catalog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { CommentThread } from "../../components/collaboration/CommentThread";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { Assignment, Comment } from "../../types/collaboration";
import type { Song } from "../../types/catalog";

export function LearnMode() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get("assignment");
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null | undefined>(undefined);
  const [song, setSong] = useState<Song | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    if (!assignmentId) {
      setAssignment(null);
      return;
    }
    getAssignment(assignmentId).then(async (a) => {
      setAssignment(a);
      if (a) {
        const [s, c] = await Promise.all([getSong(a.song_id), listCommentsForSong(a.song_id)]);
        setSong(s);
        setComments(c);
      }
    });
  }, [assignmentId]);

  const section = song?.structure.find((s) => s.id === assignment?.section_id);
  const measure = section?.measures.find((m) => m.number === assignment?.measure_number);
  const relevantComments = comments.filter(
    (c) =>
      (!assignment?.section_id || c.section_id === assignment.section_id) &&
      (assignment?.measure_number == null || c.measure_number === assignment.measure_number)
  );

  async function handleAddComment(text: string) {
    if (!profile || !assignment) return;
    try {
      await addComment({
        song_id: assignment.song_id,
        section_id: assignment.section_id,
        measure_number: assignment.measure_number,
        author_id: profile.id,
        text,
      });
      setComments(await listCommentsForSong(assignment.song_id));
    } catch {
      showToast("Échec de l'envoi du commentaire.", "error");
    }
  }

  async function handleComplete() {
    if (!assignment) return;
    try {
      await updateAssignmentStatus(assignment.id, "termine");
      showToast("Assignation marquée comme terminée !", "success");
    } catch {
      showToast("Échec de la mise à jour.", "error");
    }
  }

  if (assignment === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  if (assignment === null || !song) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <EmptyState icon={GraduationCap} title="Assignation introuvable" />
        <Link to="/dashboard" className="text-sm text-accent hover:underline">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Mode Apprentissage</p>
          <p className="font-serif text-lg font-semibold">{song.title}</p>
        </div>
        <Link to={`/songs/${id ?? song.id}`} className="rounded-full p-2 text-muted hover:bg-surface-raised hover:text-ink">
          <X size={20} />
        </Link>
      </div>

      <div className="mx-auto max-w-xl space-y-6 px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-sm text-muted">
            {section ? section.name : "Chanson entière"}
            {assignment.measure_number != null && ` · Mesure ${assignment.measure_number}`}
            {assignment.part && ` · ${assignment.part}`}
          </p>
        </div>

        {measure ? (
          <div className="space-y-2 rounded-xl border border-border p-4">
            {measure.chord && <p className="font-serif text-2xl font-bold text-accent">{measure.chord}</p>}
            <p className="text-lg">{measure.lyrics || "—"}</p>
            {measure.notes && <p className="text-sm text-muted">Notes : {measure.notes}</p>}
          </div>
        ) : section ? (
          <div className="space-y-2">
            {section.measures.map((m) => (
              <div key={m.number} className="rounded-lg bg-surface-raised px-3 py-2 text-sm">
                <span className="text-muted">#{m.number}</span> {m.chord && <span className="font-semibold text-accent">{m.chord}</span>}{" "}
                {m.lyrics}
              </div>
            ))}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-ink">{song.lyrics}</pre>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Commentaires du chef</p>
          <CommentThread comments={relevantComments} onAdd={handleAddComment} />
        </div>

        <div className="flex justify-center pt-4">
          {!understood ? (
            <button
              onClick={() => setUnderstood(true)}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-[#2A0F1E] hover:bg-accent-soft"
            >
              J'ai compris
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              <Check size={16} />
              Marquer comme terminé
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
