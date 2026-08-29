import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EntityForm } from "../../components/admin/EntityForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { createArtist, deleteArtist, updateArtist } from "../../lib/admin";
import { listArtists } from "../../lib/catalog";
import type { Artist } from "../../types/catalog";

export function AdminArtists() {
  const { t } = useTranslation("admin");
  const { showToast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listArtists()
      .then(setArtists)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!window.confirm(t("artists.deleteConfirm"))) return;
    try {
      await deleteArtist(id);
      setArtists((prev) => prev.filter((a) => a.id !== id));
    } catch {
      showToast(t("artists.deleteFailed"), "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("artists.title")}</h1>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus size={15} />
            {t("artists.new")}
          </Button>
        )}
      </div>

      {creating && (
        <div className="mb-6 max-w-md">
          <EntityForm
            nameLabel={t("artists.nameLabel")}
            descriptionLabel={t("artists.bioLabel")}
            onCancel={() => setCreating(false)}
            onSubmit={async (input) => {
              try {
                const artist = await createArtist(input);
                setArtists((prev) => [...prev, artist].sort((a, b) => a.name.localeCompare(b.name)));
                setCreating(false);
                showToast(t("artists.createSuccess"), "success");
              } catch {
                showToast(t("artists.createFailed"), "error");
              }
            }}
          />
        </div>
      )}

      {loading ? (
        <Skeleton className="h-40 w-full max-w-md" />
      ) : artists.length === 0 ? (
        <EmptyState icon={Mic2} title={t("artists.empty")} />
      ) : (
        <div className="max-w-md space-y-2">
          {artists.map((artist) =>
            editingId === artist.id ? (
              <EntityForm
                key={artist.id}
                nameLabel={t("artists.nameLabel")}
                descriptionLabel={t("artists.bioLabel")}
                initial={{ name: artist.name, description: artist.biography, image_url: artist.image_url }}
                onCancel={() => setEditingId(null)}
                onSubmit={async (input) => {
                  try {
                    await updateArtist(artist.id, input);
                    setArtists((prev) =>
                      prev.map((a) => (a.id === artist.id ? { ...a, name: input.name, biography: input.description, image_url: input.image_url } : a))
                    );
                    setEditingId(null);
                    showToast(t("artists.updateSuccess"), "success");
                  } catch {
                    showToast(t("artists.updateFailed"), "error");
                  }
                }}
              />
            ) : (
              <div key={artist.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3 py-2.5">
                <span className="text-sm font-semibold text-ink">{artist.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingId(artist.id)} className="rounded-lg p-1.5 text-muted hover:text-ink">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(artist.id)} className="rounded-lg p-1.5 text-muted hover:text-danger">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
