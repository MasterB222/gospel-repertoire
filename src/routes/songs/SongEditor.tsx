import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutGrid, Music4, PanelRight, Rows3 } from "lucide-react";
import { EditorTopBar } from "../../components/editor/EditorTopBar";
import { SectionList } from "../../components/editor/SectionList";
import { MeasureGrid } from "../../components/editor/MeasureGrid";
import { PropertiesPanel } from "../../components/editor/PropertiesPanel";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { getSong, saveSongStructure } from "../../lib/catalog";
import { useSongPresence } from "../../lib/collaboration";
import { distributeQuickEntry, transposeChord, transposeKey } from "../../lib/music";
import {
  measureFilledFraction,
  noteDurationSeconds,
  noteFraction,
  parseTimeSignature,
  playMelody,
  playTone,
  vexKeyToFrequency,
} from "../../lib/notation";
import { createEmptyMeasure, createEmptySection, type Annotation, type NoteDuration, type NoteNotation, type ScoreNote, type Section } from "../../types/editor";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Music2 } from "lucide-react";

const NotationEditorPanel = lazy(() =>
  import("../../components/notation/NotationEditorPanel").then((m) => ({ default: m.NotationEditorPanel }))
);

function bumpMinorVersion(version: string): string {
  const [major, minor] = version.split(".").map((n) => parseInt(n, 10) || 0);
  return `${major}.${minor + 1}`;
}

function bumpMajorVersion(version: string): string {
  const [major] = version.split(".").map((n) => parseInt(n, 10) || 0);
  return `${major + 1}.0`;
}

export function SongEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const presentUsers = useSongPresence(
    id,
    profile ? { id: profile.id, name: profile.first_name || "Anonyme" } : null
  );

  const [songTitle, setSongTitle] = useState("");
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [tempo, setTempo] = useState("");
  const [loaded, setLoaded] = useState<boolean | null>(null);

  const [sections, setSections] = useState<Section[]>([]);
  const [, setPast] = useState<Section[][]>([]);
  const [, setFuture] = useState<Section[][]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedMeasureNumber, setSelectedMeasureNumber] = useState<number | null>(null);

  const [notation, setNotation] = useState<NoteNotation>("letters");
  const [version, setVersion] = useState("1.0");
  const [versionHistory, setVersionHistory] = useState<{ version: string; author: string; at: string }[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [displayKey, setDisplayKey] = useState("");
  const [keyOffset, setKeyOffset] = useState(0);
  const [chordOffset, setChordOffset] = useState(0);
  const [pendingSteps, setPendingSteps] = useState(0);

  const [mobileSectionsOpen, setMobileSectionsOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const [editorView, setEditorView] = useState<"grid" | "score">("grid");
  const [scoreDuration, setScoreDuration] = useState<NoteDuration>("quarter");
  const [scoreDotted, setScoreDotted] = useState(false);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);
  const playbackRef = useRef<{ stop: () => void } | null>(null);

  const sessionOriginalKey = useRef("");
  const skipNextAutosave = useRef(true);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    getSong(id)
      .then((song) => {
        if (!song) {
          setLoaded(false);
          return;
        }
        setSongTitle(song.title);
        setTimeSignature(song.default_time_signature || "4/4");
        setTempo(song.tempo);
        const initialSections = song.structure.length > 0 ? song.structure : [createEmptySection(0)];
        setSections(initialSections);
        setSelectedSectionId(initialSections[0]?.id ?? null);
        setVersion(song.version || "1.0");
        setVersionHistory(song.version_history || []);
        setDisplayKey(song.original_key || "");
        sessionOriginalKey.current = song.original_key || "";
        setLoaded(true);
      })
      .catch(() => setLoaded(false));
  }, [id]);

  const applyChange = useCallback(
    (updater: (current: Section[]) => Section[]) => {
      setSections((current) => {
        const next = updater(current);
        setPast((p) => [...p, current].slice(-50));
        setFuture([]);
        return next;
      });
    },
    []
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setSections((current) => {
        setFuture((f) => [current, ...f]);
        return previous;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setSections((current) => {
        setPast((p) => [...p, current]);
        return next;
      });
      return f.slice(1);
    });
  }, []);

  // Autosave (debounced)
  useEffect(() => {
    if (!id || loaded !== true) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = window.setTimeout(async () => {
      const newVersion = bumpMinorVersion(version);
      const entry = { version: newVersion, author: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Anonyme", at: new Date().toISOString() };
      const newHistory = [...versionHistory, entry].slice(-20);
      try {
        await saveSongStructure(id, {
          structure: sections,
          original_key: displayKey,
          version: newVersion,
          version_history: newHistory,
        });
        setVersion(newVersion);
        setVersionHistory(newHistory);
        setSaveStatus("saved");
      } catch {
        showToast("Échec de la sauvegarde automatique.", "error");
        setSaveStatus("idle");
      }
    }, 1500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, displayKey]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;
  const selectedMeasure = selectedSection?.measures.find((m) => m.number === selectedMeasureNumber) ?? null;

  function selectSection(sectionId: string) {
    setSelectedSectionId(sectionId);
    setSelectedMeasureNumber(null);
    setMobileSectionsOpen(false);
  }

  function addSection() {
    applyChange((current) => [...current, createEmptySection(current.length)]);
  }

  function renameSection(sectionId: string, name: string) {
    applyChange((current) => current.map((s) => (s.id === sectionId ? { ...s, name } : s)));
  }

  function duplicateSection(sectionId: string) {
    applyChange((current) => {
      const idx = current.findIndex((s) => s.id === sectionId);
      if (idx === -1) return current;
      const clone: Section = {
        ...current[idx],
        id: crypto.randomUUID(),
        name: `${current[idx].name} (copie)`,
        order: idx + 1,
      };
      const next = [...current];
      next.splice(idx + 1, 0, clone);
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  function deleteSection(sectionId: string) {
    applyChange((current) => current.filter((s) => s.id !== sectionId).map((s, i) => ({ ...s, order: i })));
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
      setSelectedMeasureNumber(null);
    }
  }

  function toggleHidden(sectionId: string) {
    applyChange((current) => current.map((s) => (s.id === sectionId ? { ...s, hidden: !s.hidden } : s)));
  }

  function reorderSections(draggedId: string, targetId: string) {
    applyChange((current) => {
      const next = [...current];
      const fromIdx = next.findIndex((s) => s.id === draggedId);
      const toIdx = next.findIndex((s) => s.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return current;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  function updateSectionAssignment(sectionId: string, text: string) {
    applyChange((current) => current.map((s) => (s.id === sectionId ? { ...s, assigned_to: text } : s)));
  }

  function addMeasure(sectionId: string) {
    applyChange((current) =>
      current.map((s) =>
        s.id === sectionId
          ? { ...s, measures: [...s.measures, { number: s.measures.length + 1, lyrics: "", chord: "", notes: "", annotations: [] }] }
          : s
      )
    );
  }

  function updateMeasure(sectionId: string, number: number, patch: Partial<Section["measures"][number]>) {
    applyChange((current) =>
      current.map((s) =>
        s.id === sectionId
          ? { ...s, measures: s.measures.map((m) => (m.number === number ? { ...m, ...patch } : m)) }
          : s
      )
    );
  }

  function quickEntry(sectionId: string, text: string) {
    const tokens = distributeQuickEntry(text);
    applyChange((current) =>
      current.map((s) => {
        if (s.id !== sectionId) return s;
        const measures = [...s.measures];
        tokens.forEach((token, i) => {
          if (!measures[i]) measures.push({ number: i + 1, lyrics: "", chord: "", notes: "", annotations: [] });
          measures[i] = { ...measures[i], notes: token };
        });
        return { ...s, measures };
      })
    );
  }

  function addAnnotation(sectionId: string, measureNumber: number, annotation: Omit<Annotation, "id" | "author">) {
    applyChange((current) =>
      current.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              measures: s.measures.map((m) =>
                m.number === measureNumber
                  ? {
                      ...m,
                      annotations: [
                        ...m.annotations,
                        { ...annotation, id: crypto.randomUUID(), author: profile ? profile.first_name : "Anonyme" },
                      ],
                    }
                  : m
              ),
            }
          : s
      )
    );
  }

  function removeAnnotation(sectionId: string, measureNumber: number, annotationId: string) {
    applyChange((current) =>
      current.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              measures: s.measures.map((m) =>
                m.number === measureNumber
                  ? { ...m, annotations: m.annotations.filter((a) => a.id !== annotationId) }
                  : m
              ),
            }
          : s
      )
    );
  }

  function playAndRecordNote(pitch: string | null) {
    if (!selectedSectionId || selectedMeasureNumber == null || !selectedSection) return;
    const measure = selectedSection.measures.find((m) => m.number === selectedMeasureNumber);
    if (!measure) return;
    const capacity = parseTimeSignature(selectedSection.time_signature).capacity;
    const filled = measureFilledFraction(measure.score);
    const frac = noteFraction({ duration: scoreDuration, dotted: scoreDotted });
    const overflow = filled + frac > capacity + 1e-9;
    const targetNumber = overflow ? measure.number + 1 : measure.number;

    applyChange((current) =>
      current.map((s) => {
        if (s.id !== selectedSectionId) return s;
        const measures = [...s.measures];
        let idx = measures.findIndex((m) => m.number === targetNumber);
        if (idx === -1) {
          measures.push(createEmptyMeasure(targetNumber));
          idx = measures.length - 1;
        }
        const newNote: ScoreNote = { id: crypto.randomUUID(), pitch, duration: scoreDuration, dotted: scoreDotted };
        measures[idx] = { ...measures[idx], score: [...(measures[idx].score ?? []), newNote] };
        return { ...s, measures };
      })
    );
    if (overflow) setSelectedMeasureNumber(targetNumber);
    if (pitch) {
      const bpm = parseInt(tempo, 10) || 90;
      playTone(vexKeyToFrequency(pitch), noteDurationSeconds({ duration: scoreDuration, dotted: scoreDotted }, bpm) * 0.9, { gain: 0.22 });
    }
  }

  function clearLastNote() {
    if (!selectedSectionId || selectedMeasureNumber == null) return;
    applyChange((current) =>
      current.map((s) =>
        s.id === selectedSectionId
          ? { ...s, measures: s.measures.map((m) => (m.number === selectedMeasureNumber ? { ...m, score: (m.score ?? []).slice(0, -1) } : m)) }
          : s
      )
    );
  }

  function clearMeasureScore() {
    if (!selectedSectionId || selectedMeasureNumber == null) return;
    applyChange((current) =>
      current.map((s) =>
        s.id === selectedSectionId
          ? { ...s, measures: s.measures.map((m) => (m.number === selectedMeasureNumber ? { ...m, score: [] } : m)) }
          : s
      )
    );
  }

  function togglePlayMelody() {
    if (isPlayingMelody) {
      playbackRef.current?.stop();
      playbackRef.current = null;
      setIsPlayingMelody(false);
      return;
    }
    if (!selectedSection) return;
    const allNotes = selectedSection.measures.flatMap((m) => m.score ?? []);
    if (allNotes.length === 0) {
      showToast("Aucune note saisie dans cette section.", "info");
      return;
    }
    const bpm = parseInt(tempo, 10) || 90;
    setIsPlayingMelody(true);
    const totalDuration = allNotes.reduce((sum, n) => sum + noteDurationSeconds(n, bpm), 0);
    playbackRef.current = playMelody(allNotes, bpm);
    window.setTimeout(() => {
      setIsPlayingMelody(false);
      playbackRef.current = null;
    }, totalDuration * 1000 + 150);
  }

  function handleTransposeStep(direction: 1 | -1) {
    const newOffset = keyOffset + direction;
    setDisplayKey(transposeKey(sessionOriginalKey.current, newOffset));
    setKeyOffset(newOffset);
    setPendingSteps((p) => p + direction);
  }

  function handleTransposeAnswer(applyToChords: boolean) {
    if (applyToChords && pendingSteps !== 0) {
      const step = pendingSteps;
      applyChange((current) =>
        current.map((s) => ({ ...s, measures: s.measures.map((m) => ({ ...m, chord: transposeChord(m.chord, step) })) }))
      );
      setChordOffset((c) => c + step);
    }
    setPendingSteps(0);
  }

  function handleTransposeReset() {
    setDisplayKey(sessionOriginalKey.current);
    setKeyOffset(0);
    if (chordOffset !== 0) {
      const step = -chordOffset;
      applyChange((current) =>
        current.map((s) => ({ ...s, measures: s.measures.map((m) => ({ ...m, chord: transposeChord(m.chord, step) })) }))
      );
    }
    setChordOffset(0);
    setPendingSteps(0);
  }

  function handlePublish() {
    if (!id) return;
    const newVersion = bumpMajorVersion(version);
    const entry = { version: newVersion, author: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Anonyme", at: new Date().toISOString() };
    const newHistory = [...versionHistory, entry].slice(-20);
    setSaveStatus("saving");
    saveSongStructure(id, { structure: sections, original_key: displayKey, version: newVersion, version_history: newHistory })
      .then(() => {
        setVersion(newVersion);
        setVersionHistory(newHistory);
        setSaveStatus("saved");
        showToast(`Chanson publiée en version ${newVersion}.`, "success");
      })
      .catch(() => showToast("Échec de la publication.", "error"));
  }

  // Raccourcis clavier
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isEditable = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        return;
      }
      if (isEditable) return;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y")) {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedSectionId) duplicateSection(selectedSectionId);
      } else if (e.key === "Delete" && selectedSectionId && selectedMeasureNumber != null) {
        updateMeasure(selectedSectionId, selectedMeasureNumber, { lyrics: "", chord: "", notes: "", annotations: [] });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedSectionId, selectedMeasureNumber]);

  useEffect(() => {
    return () => playbackRef.current?.stop();
  }, []);

  if (loaded === null) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (loaded === false) {
    return (
      <EmptyState
        icon={Music2}
        title="Chanson introuvable"
        action={
          <button onClick={() => navigate("/songs")} className="text-sm font-semibold text-accent hover:underline">
            Retour au répertoire
          </button>
        }
      />
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorTopBar
        songId={id!}
        title={songTitle}
        timeSignature={timeSignature}
        bpm={tempo}
        saveStatus={saveStatus}
        version={version}
        notation={notation}
        onSetNotation={setNotation}
        onPublish={handlePublish}
        displayKey={displayKey}
        pendingConfirm={pendingSteps !== 0}
        canReset={keyOffset !== 0 || chordOffset !== 0}
        onStep={handleTransposeStep}
        onAnswer={handleTransposeAnswer}
        onReset={handleTransposeReset}
        presentUsers={presentUsers}
      />

      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <button
          onClick={() => setMobileSectionsOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink md:hidden"
        >
          <Rows3 size={14} />
          Sections
        </button>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            onClick={() => setEditorView("grid")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
              editorView === "grid" ? "bg-accent text-[#2A0F1E]" : "text-muted hover:text-ink"
            }`}
          >
            <LayoutGrid size={13} />
            Grille
          </button>
          <button
            onClick={() => setEditorView("score")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
              editorView === "score" ? "bg-accent text-[#2A0F1E]" : "text-muted hover:text-ink"
            }`}
          >
            <Music4 size={13} />
            Portée
          </button>
        </div>
        {editorView === "grid" && (
          <button
            onClick={() => setMobilePanelOpen(true)}
            disabled={!selectedSection}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink disabled:opacity-40 md:hidden"
          >
            <PanelRight size={14} />
            Propriétés
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-64 shrink-0 overflow-y-auto border-r border-border p-3 md:block">
          <SectionList
            sections={sections}
            selectedId={selectedSectionId}
            onSelect={selectSection}
            onAdd={addSection}
            onRename={renameSection}
            onDuplicate={duplicateSection}
            onDelete={deleteSection}
            onToggleHidden={toggleHidden}
            onReorder={reorderSections}
          />
        </div>

        {editorView === "grid" ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <MeasureGrid
                section={selectedSection}
                selectedMeasureNumber={selectedMeasureNumber}
                notation={notation}
                songKey={displayKey}
                onSelectMeasure={setSelectedMeasureNumber}
                onQuickEntry={(text) => selectedSectionId && quickEntry(selectedSectionId, text)}
                onAddMeasure={() => selectedSectionId && addMeasure(selectedSectionId)}
              />
            </div>

            <div className="hidden w-72 shrink-0 overflow-y-auto border-l border-border md:block">
              <PropertiesPanel
                section={selectedSection}
                measure={selectedMeasure}
                notation={notation}
                authorName={profile?.first_name ?? "Anonyme"}
                onUpdateMeasure={(patch) => selectedSectionId && selectedMeasureNumber != null && updateMeasure(selectedSectionId, selectedMeasureNumber, patch)}
                onAddAnnotation={(a) => selectedSectionId && selectedMeasureNumber != null && addAnnotation(selectedSectionId, selectedMeasureNumber, a)}
                onRemoveAnnotation={(annotationId) => selectedSectionId && selectedMeasureNumber != null && removeAnnotation(selectedSectionId, selectedMeasureNumber, annotationId)}
                onUpdateSectionAssignment={(text) => selectedSectionId && updateSectionAssignment(selectedSectionId, text)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <NotationEditorPanel
                section={selectedSection}
                selectedMeasureNumber={selectedMeasureNumber}
                onSelectMeasure={setSelectedMeasureNumber}
                duration={scoreDuration}
                dotted={scoreDotted}
                onChangeDuration={setScoreDuration}
                onToggleDotted={() => setScoreDotted((d) => !d)}
                onPlayNote={playAndRecordNote}
                onAddRest={() => playAndRecordNote(null)}
                onClearLastNote={clearLastNote}
                onClearMeasureScore={clearMeasureScore}
                bpm={parseInt(tempo, 10) || 90}
                isPlayingMelody={isPlayingMelody}
                onTogglePlayMelody={togglePlayMelody}
              />
            </Suspense>
          </div>
        )}
      </div>

      <Modal open={mobileSectionsOpen} onClose={() => setMobileSectionsOpen(false)} title="Structure">
        <SectionList
          sections={sections}
          selectedId={selectedSectionId}
          onSelect={selectSection}
          onAdd={addSection}
          onRename={renameSection}
          onDuplicate={duplicateSection}
          onDelete={deleteSection}
          onToggleHidden={toggleHidden}
          onReorder={reorderSections}
        />
      </Modal>

      <Modal open={mobilePanelOpen} onClose={() => setMobilePanelOpen(false)} title="Propriétés">
        <PropertiesPanel
          section={selectedSection}
          measure={selectedMeasure}
          notation={notation}
          authorName={profile?.first_name ?? "Anonyme"}
          onUpdateMeasure={(patch) => selectedSectionId && selectedMeasureNumber != null && updateMeasure(selectedSectionId, selectedMeasureNumber, patch)}
          onAddAnnotation={(a) => selectedSectionId && selectedMeasureNumber != null && addAnnotation(selectedSectionId, selectedMeasureNumber, a)}
          onRemoveAnnotation={(annotationId) => selectedSectionId && selectedMeasureNumber != null && removeAnnotation(selectedSectionId, selectedMeasureNumber, annotationId)}
          onUpdateSectionAssignment={(text) => selectedSectionId && updateSectionAssignment(selectedSectionId, text)}
        />
      </Modal>
    </div>
  );
}
