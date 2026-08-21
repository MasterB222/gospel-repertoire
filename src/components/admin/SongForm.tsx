import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { listArtists, listCategories } from "../../lib/catalog";
import type { SongInput } from "../../lib/admin";
import type { Artist, Category, Difficulty, Song, SongStatus } from "../../types/catalog";

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none";
const labelClasses = "mb-1 block text-xs font-semibold text-muted";

function toInput(song?: Song): SongInput {
  return {
    title: song?.title ?? "",
    artist_id: song?.artist_id ?? null,
    category_id: song?.category_id ?? null,
    language: song?.language ?? "Français",
    original_key: song?.original_key ?? "",
    tempo: song?.tempo ?? "",
    difficulty: song?.difficulty ?? "Intermédiaire",
    year: song?.year ?? null,
    album: song?.album ?? "",
    description: song?.description ?? "",
    lyrics: song?.lyrics ?? "",
    chords: song?.chords ?? "",
    youtube_url: song?.youtube_url ?? "",
    cover_url: song?.cover_url ?? "",
    partition_url: song?.partition_url ?? "",
    tags: song?.tags ?? [],
    status: song?.status ?? "brouillon",
  };
}

export function SongForm({ song, onSubmit }: { song?: Song; onSubmit: (input: SongInput) => Promise<void> }) {
  const [input, setInput] = useState<SongInput>(() => toInput(song));
  const [tagsText, setTagsText] = useState(song?.tags.join(", ") ?? "");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listArtists().then(setArtists);
    listCategories().then(setCategories);
  }, []);

  function set<K extends keyof SongInput>(key: K, value: SongInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(status: SongStatus) {
    if (!input.title.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        ...input,
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
        status,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="song-title" className={labelClasses}>
            Titre *
          </label>
          <input id="song-title" value={input.title} onChange={(e) => set("title", e.target.value)} className={fieldClasses} />
        </div>

        <div>
          <label htmlFor="song-artist" className={labelClasses}>
            Artiste
          </label>
          <select
            id="song-artist"
            value={input.artist_id ?? ""}
            onChange={(e) => set("artist_id", e.target.value || null)}
            className={fieldClasses}
          >
            <option value="">—</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="song-category" className={labelClasses}>
            Catégorie
          </label>
          <select
            id="song-category"
            value={input.category_id ?? ""}
            onChange={(e) => set("category_id", e.target.value || null)}
            className={fieldClasses}
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="song-album" className={labelClasses}>
            Album
          </label>
          <input id="song-album" value={input.album} onChange={(e) => set("album", e.target.value)} className={fieldClasses} />
        </div>
        <div>
          <label htmlFor="song-year" className={labelClasses}>
            Année
          </label>
          <input
            id="song-year"
            type="number"
            value={input.year ?? ""}
            onChange={(e) => set("year", e.target.value ? Number(e.target.value) : null)}
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="song-language" className={labelClasses}>
            Langue
          </label>
          <input id="song-language" value={input.language} onChange={(e) => set("language", e.target.value)} className={fieldClasses} />
        </div>
        <div>
          <label htmlFor="song-key" className={labelClasses}>
            Tonalité
          </label>
          <input
            id="song-key"
            value={input.original_key}
            onChange={(e) => set("original_key", e.target.value)}
            className={fieldClasses}
            placeholder="ex. Sol majeur"
          />
        </div>

        <div>
          <label htmlFor="song-tempo" className={labelClasses}>
            Tempo (BPM)
          </label>
          <input id="song-tempo" value={input.tempo} onChange={(e) => set("tempo", e.target.value)} className={fieldClasses} />
        </div>
        <div>
          <label htmlFor="song-difficulty" className={labelClasses}>
            Difficulté
          </label>
          <select
            id="song-difficulty"
            value={input.difficulty}
            onChange={(e) => set("difficulty", e.target.value as Difficulty)}
            className={fieldClasses}
          >
            <option value="Facile">Facile</option>
            <option value="Intermédiaire">Intermédiaire</option>
            <option value="Avancé">Avancé</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="song-description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="song-description"
          rows={2}
          value={input.description}
          onChange={(e) => set("description", e.target.value)}
          className={fieldClasses}
        />
      </div>

      <div>
        <label htmlFor="song-lyrics" className={labelClasses}>
          Paroles
        </label>
        <textarea id="song-lyrics" rows={6} value={input.lyrics} onChange={(e) => set("lyrics", e.target.value)} className={fieldClasses} />
      </div>

      <div>
        <label htmlFor="song-chords" className={labelClasses}>
          Accords
        </label>
        <textarea id="song-chords" rows={3} value={input.chords} onChange={(e) => set("chords", e.target.value)} className={fieldClasses} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="song-youtube" className={labelClasses}>
            URL YouTube
          </label>
          <input
            id="song-youtube"
            value={input.youtube_url}
            onChange={(e) => set("youtube_url", e.target.value)}
            className={fieldClasses}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div>
          <label htmlFor="song-cover" className={labelClasses}>
            URL image (pochette)
          </label>
          <input
            id="song-cover"
            value={input.cover_url}
            onChange={(e) => set("cover_url", e.target.value)}
            className={fieldClasses}
            placeholder="https://..."
          />
        </div>
        <div>
          <label htmlFor="song-partition" className={labelClasses}>
            URL partition (PDF)
          </label>
          <input
            id="song-partition"
            value={input.partition_url}
            onChange={(e) => set("partition_url", e.target.value)}
            className={fieldClasses}
            placeholder="https://..."
          />
        </div>
        <div>
          <label htmlFor="song-tags" className={labelClasses}>
            Tags (séparés par des virgules)
          </label>
          <input id="song-tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={fieldClasses} placeholder="louange, dimanche, chorale" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button onClick={() => handleSubmit("brouillon")} variant="secondary" disabled={saving}>
          <Save size={15} />
          Enregistrer en brouillon
        </Button>
        <Button onClick={() => handleSubmit("publie")} disabled={saving}>
          <Save size={15} />
          Publier
        </Button>
      </div>
    </div>
  );
}
