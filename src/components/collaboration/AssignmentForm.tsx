import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { listGroups, searchProfiles } from "../../lib/collaboration";
import type { Group } from "../../types/collaboration";
import type { Section } from "../../types/editor";

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink focus:border-accent focus:outline-none";

interface AssignmentFormProps {
  sections: Section[];
  onSubmit: (input: {
    section_id: string | null;
    measure_number: number | null;
    assignee_group_id: string | null;
    assignee_user_id: string | null;
    part: string;
  }) => void;
}

export function AssignmentForm({ sections, onSubmit }: AssignmentFormProps) {
  const [sectionId, setSectionId] = useState<string>("");
  const [measureNumber, setMeasureNumber] = useState<string>("");
  const [assigneeType, setAssigneeType] = useState<"group" | "user">("group");
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [part, setPart] = useState("");

  useEffect(() => {
    listGroups().then((g) => {
      setGroups(g);
      if (g[0]) setGroupId(g[0].id);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (assigneeType === "user" && userQuery.trim()) {
        searchProfiles(userQuery).then(setUserResults);
      } else {
        setUserResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [userQuery, assigneeType]);

  const selectedSection = sections.find((s) => s.id === sectionId);

  function handleSubmit() {
    if (assigneeType === "group" && !groupId) return;
    if (assigneeType === "user" && !userId) return;
    onSubmit({
      section_id: sectionId || null,
      measure_number: sectionId && measureNumber ? Number(measureNumber) : null,
      assignee_group_id: assigneeType === "group" ? groupId : null,
      assignee_user_id: assigneeType === "user" ? userId : null,
      part,
    });
    setPart("");
    setUserQuery("");
    setUserId(null);
  }

  return (
    <div className="space-y-2.5 rounded-xl border border-border p-3">
      <div className="grid grid-cols-2 gap-2">
        <select value={sectionId} onChange={(e) => { setSectionId(e.target.value); setMeasureNumber(""); }} className={fieldClasses}>
          <option value="">Chanson entière</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={measureNumber} onChange={(e) => setMeasureNumber(e.target.value)} disabled={!selectedSection} className={fieldClasses}>
          <option value="">Toute la section</option>
          {selectedSection?.measures.map((m) => (
            <option key={m.number} value={m.number}>
              Mesure {m.number}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => setAssigneeType("group")}
          className={`rounded-full px-2.5 py-1 text-xs ${assigneeType === "group" ? "bg-accent/20 text-accent" : "text-muted hover:bg-surface-raised"}`}
        >
          Groupe/pupitre
        </button>
        <button
          onClick={() => setAssigneeType("user")}
          className={`rounded-full px-2.5 py-1 text-xs ${assigneeType === "user" ? "bg-accent/20 text-accent" : "text-muted hover:bg-surface-raised"}`}
        >
          Membre
        </button>
      </div>

      {assigneeType === "group" ? (
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={fieldClasses}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      ) : (
        <div>
          <input
            value={userQuery}
            onChange={(e) => {
              setUserQuery(e.target.value);
              setUserId(null);
            }}
            placeholder="Chercher un membre par nom..."
            className={fieldClasses}
          />
          {userResults.length > 0 && !userId && (
            <div className="mt-1 space-y-0.5 rounded-lg border border-border bg-surface p-1">
              {userResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setUserId(u.id);
                    setUserQuery(`${u.first_name} ${u.last_name}`);
                    setUserResults([]);
                  }}
                  className="block w-full rounded px-2 py-1 text-left text-xs text-ink hover:bg-surface-raised"
                >
                  {u.first_name} {u.last_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <input
        value={part}
        onChange={(e) => setPart(e.target.value)}
        placeholder="Partie (ex. Basse, Alto...)"
        className={fieldClasses}
      />

      <Button onClick={handleSubmit} className="w-full">
        Assigner
      </Button>
    </div>
  );
}
