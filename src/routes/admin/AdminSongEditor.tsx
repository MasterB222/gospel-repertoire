import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SongForm } from "../../components/admin/SongForm";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { createSong, updateSong, type SongInput } from "../../lib/admin";
import { getSong } from "../../lib/catalog";
import type { Song } from "../../types/catalog";

export function AdminSongEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;
  const [song, setSong] = useState<Song | null | undefined>(isEdit ? undefined : null);

  useEffect(() => {
    if (!id) return;
    getSong(id).then(setSong);
  }, [id]);

  async function handleSubmit(input: SongInput) {
    try {
      if (isEdit && id) {
        await updateSong(id, input);
        showToast("Chanson mise à jour.", "success");
      } else {
        await createSong(input);
        showToast("Chanson créée.", "success");
      }
      navigate("/admin/songs");
    } catch {
      showToast("Échec de l'enregistrement.", "error");
    }
  }

  if (isEdit && song === undefined) {
    return <Skeleton className="h-96 w-full max-w-2xl" />;
  }

  return (
    <div>
      <Link to="/admin/songs" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.8} />
        Retour aux chansons
      </Link>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">
        {isEdit ? "Modifier la chanson" : "Nouvelle chanson"}
      </h1>
      <SongForm song={song ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
