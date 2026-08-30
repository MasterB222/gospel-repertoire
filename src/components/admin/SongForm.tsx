import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Save, Upload, X } from "lucide-react";
import { Button } from "../ui/Button";
import { YearPicker } from "../ui/YearPicker";
import { listArtists, listCategories } from "../../lib/catalog";
import { uploadPartitionFile } from "../../lib/storage";
import { useToast } from "../../context/ToastContext";
import { createArtist, createCategory, type SongInput } from "../../lib/admin";
import type { Artist, Category, Difficulty, Song, SongStatus } from "../../types/catalog";

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
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
  const { t } = useTranslation("admin");
  const { showToast } = useToast();
  const [input, setInput] = useState<SongInput>(() => toInput(song));
  const [tagsText, setTagsText] = useState(song?.tags.join(", ") ?? "");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistQuery, setArtistQuery] = useState(song?.artist?.name ?? "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryQuery, setCategoryQuery] = useState(song?.category?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingPartition, setUploadingPartition] = useState(false);
  const [showManualPartitionUrl, setShowManualPartitionUrl] = useState(false);
  const partitionFileInput = useRef<HTMLInputElement>(null);

  async function handlePartitionFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast(t("songForm.onlyPdf"), "error");
      return;
    }
    setUploadingPartition(true);
    try {
      const url = await uploadPartitionFile(file);
      set("partition_url", url);
      showToast(t("songForm.partitionImported"), "success");
    } catch {
      showToast(t("songForm.partitionImportFailed"), "error");
    } finally {
      setUploadingPartition(false);
    }
  }

  useEffect(() => {
    listArtists().then(setArtists);
    listCategories().then(setCategories);
  }, []);

  function set<K extends keyof SongInput>(key: K, value: SongInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function selectArtist(artist: Artist) {
    set("artist_id", artist.id);
    setArtistQuery(artist.name);
  }

  async function handleCreateArtist() {
    const name = artistQuery.trim();
    if (!name) return;
    try {
      const created = await createArtist({ name, description: "", image_url: "" });
      setArtists((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      selectArtist(created);
      showToast(t("artists.createSuccess"), "success");
    } catch {
      showToast(t("artists.createFailed"), "error");
    }
  }

  const hasExactArtistMatch = artists.some((a) => a.name.toLowerCase() === artistQuery.trim().toLowerCase());
  const artistMatches =
    !input.artist_id && artistQuery.trim()
      ? artists.filter((a) => a.name.toLowerCase().includes(artistQuery.trim().toLowerCase())).slice(0, 8)
      : [];

  function selectCategory(category: Category) {
    set("category_id", category.id);
    setCategoryQuery(category.name);
  }

  async function handleCreateCategory() {
    const name = categoryQuery.trim();
    if (!name) return;
    try {
      const created = await createCategory({ name, description: "", image_url: "" });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      selectCategory(created);
      showToast(t("categories.createSuccess"), "success");
    } catch {
      showToast(t("categories.createFailed"), "error");
    }
  }

  const hasExactCategoryMatch = categories.some((c) => c.name.toLowerCase() === categoryQuery.trim().toLowerCase());
  const categoryMatches =
    !input.category_id && categoryQuery.trim()
      ? categories.filter((c) => c.name.toLowerCase().includes(categoryQuery.trim().toLowerCase())).slice(0, 8)
      : [];

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
            {t("songForm.titleLabel")}
          </label>
          <input id="song-title" value={input.title} onChange={(e) => set("title", e.target.value)} className={fieldClasses} />
        </div>

        <div className="relative">
          <label htmlFor="song-artist" className={labelClasses}>
            {t("songForm.artistLabel")}
          </label>
          <input
            id="song-artist"
            value={artistQuery}
            onChange={(e) => {
              setArtistQuery(e.target.value);
              set("artist_id", null);
            }}
            placeholder={t("songForm.artistPlaceholder")}
            className={fieldClasses}
            autoComplete="off"
          />
          {(artistMatches.length > 0 || (artistQuery.trim() && !hasExactArtistMatch && !input.artist_id)) && (
            <div className="absolute z-10 mt-1 w-full space-y-0.5 rounded-lg border border-border bg-surface p-1 shadow-lg">
              {artistMatches.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => selectArtist(a)}
                  className="block w-full truncate rounded px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-raised"
                >
                  {a.name}
                </button>
              ))}
              {artistQuery.trim() && !hasExactArtistMatch && (
                <button
                  type="button"
                  onClick={handleCreateArtist}
                  className="block w-full truncate rounded px-2 py-1.5 text-left text-sm font-semibold text-accent-ink hover:bg-surface-raised"
                >
                  {t("songForm.createArtist", { name: artistQuery.trim() })}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="song-category" className={labelClasses}>
            {t("songForm.categoryLabel")}
          </label>
          <input
            id="song-category"
            value={categoryQuery}
            onChange={(e) => {
              setCategoryQuery(e.target.value);
              set("category_id", null);
            }}
            placeholder={t("songForm.categoryPlaceholder")}
            className={fieldClasses}
            autoComplete="off"
          />
          {(categoryMatches.length > 0 || (categoryQuery.trim() && !hasExactCategoryMatch && !input.category_id)) && (
            <div className="absolute z-10 mt-1 w-full space-y-0.5 rounded-lg border border-border bg-surface p-1 shadow-lg">
              {categoryMatches.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCategory(c)}
                  className="block w-full truncate rounded px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-raised"
                >
                  {c.name}
                </button>
              ))}
              {categoryQuery.trim() && !hasExactCategoryMatch && (
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="block w-full truncate rounded px-2 py-1.5 text-left text-sm font-semibold text-accent-ink hover:bg-surface-raised"
                >
                  {t("songForm.createCategory", { name: categoryQuery.trim() })}
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="song-album" className={labelClasses}>
            {t("songForm.albumLabel")}
          </label>
          <input id="song-album" value={input.album} onChange={(e) => set("album", e.target.value)} className={fieldClasses} />
        </div>
        <div>
          <label htmlFor="song-year" className={labelClasses}>
            {t("songForm.yearLabel")}
          </label>
          <YearPicker id="song-year" value={input.year} onChange={(year) => set("year", year)} />
        </div>

        <div>
          <label htmlFor="song-language" className={labelClasses}>
            {t("songForm.languageLabel")}
          </label>
          <input id="song-language" value={input.language} onChange={(e) => set("language", e.target.value)} className={fieldClasses} />
        </div>
        <div>
          <label htmlFor="song-key" className={labelClasses}>
            {t("songForm.keyLabel")}
          </label>
          <input
            id="song-key"
            value={input.original_key}
            onChange={(e) => set("original_key", e.target.value)}
            className={fieldClasses}
            placeholder={t("songForm.keyPlaceholder")}
          />
        </div>

        <div>
          <label htmlFor="song-tempo" className={labelClasses}>
            {t("songForm.tempoLabel")}
          </label>
          <input id="song-tempo" value={input.tempo} onChange={(e) => set("tempo", e.target.value)} className={fieldClasses} />
        </div>
        <div>
          <label htmlFor="song-difficulty" className={labelClasses}>
            {t("songForm.difficultyLabel")}
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
          {t("songForm.descriptionLabel")}
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
          {t("songForm.lyricsLabel")}
        </label>
        <textarea id="song-lyrics" rows={6} value={input.lyrics} onChange={(e) => set("lyrics", e.target.value)} className={fieldClasses} />
      </div>

      <div>
        <label htmlFor="song-chords" className={labelClasses}>
          {t("songForm.chordsLabel")}
        </label>
        <textarea id="song-chords" rows={3} value={input.chords} onChange={(e) => set("chords", e.target.value)} className={fieldClasses} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="song-youtube" className={labelClasses}>
            {t("songForm.youtubeLabel")}
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
            {t("songForm.coverLabel")}
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
          <label className={labelClasses}>{t("songForm.partitionLabel")}</label>
          <input
            ref={partitionFileInput}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handlePartitionFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => partitionFileInput.current?.click()}
              disabled={uploadingPartition}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-ink hover:border-accent disabled:opacity-50"
            >
              <Upload size={13} />
              {uploadingPartition ? t("songForm.importing") : t("songForm.choosePdf")}
            </button>
            {input.partition_url && (
              <>
                <a
                  href={input.partition_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-1 truncate text-xs text-accent-ink underline"
                >
                  <FileText size={12} className="shrink-0" />
                  {t("songForm.currentFile")}
                </a>
                <button
                  type="button"
                  onClick={() => set("partition_url", "")}
                  title={t("songForm.removePartition")}
                  className="text-muted hover:text-danger"
                >
                  <X size={13} />
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowManualPartitionUrl((v) => !v)}
            className="mt-1.5 text-xs text-muted underline hover:text-ink"
          >
            {t("songForm.orPasteLink")}
          </button>
          {showManualPartitionUrl && (
            <input
              value={input.partition_url}
              onChange={(e) => set("partition_url", e.target.value)}
              className={`${fieldClasses} mt-1.5`}
              placeholder="https://..."
            />
          )}
        </div>
        <div>
          <label htmlFor="song-tags" className={labelClasses}>
            {t("songForm.tagsLabel")}
          </label>
          <input
            id="song-tags"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className={fieldClasses}
            placeholder={t("songForm.tagsPlaceholder")}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button onClick={() => handleSubmit("brouillon")} variant="secondary" disabled={saving}>
          <Save size={15} />
          {t("songForm.saveDraft")}
        </Button>
        <Button onClick={() => handleSubmit("publie")} disabled={saving}>
          <Save size={15} />
          {t("songForm.publish")}
        </Button>
      </div>
    </div>
  );
}
