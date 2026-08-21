import { useEffect, useState } from "react";
import { LayoutGrid, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EntityForm } from "../../components/admin/EntityForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { createCategory, deleteCategory, updateCategory } from "../../lib/admin";
import { listCategories } from "../../lib/catalog";
import type { Category } from "../../types/catalog";

export function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      showToast("Échec de la suppression (des chansons y sont peut-être liées).", "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Admin — Catégories</h1>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus size={15} />
            Nouvelle catégorie
          </Button>
        )}
      </div>

      {creating && (
        <div className="mb-6 max-w-md">
          <EntityForm
            nameLabel="Nom"
            descriptionLabel="Description"
            onCancel={() => setCreating(false)}
            onSubmit={async (input) => {
              try {
                const category = await createCategory(input);
                setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
                setCreating(false);
                showToast("Catégorie créée.", "success");
              } catch {
                showToast("Échec de la création.", "error");
              }
            }}
          />
        </div>
      )}

      {loading ? (
        <Skeleton className="h-40 w-full max-w-md" />
      ) : categories.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="Aucune catégorie" />
      ) : (
        <div className="max-w-md space-y-2">
          {categories.map((category) =>
            editingId === category.id ? (
              <EntityForm
                key={category.id}
                nameLabel="Nom"
                descriptionLabel="Description"
                initial={{ name: category.name, description: category.description, image_url: category.image_url }}
                onCancel={() => setEditingId(null)}
                onSubmit={async (input) => {
                  try {
                    await updateCategory(category.id, input);
                    setCategories((prev) =>
                      prev.map((c) => (c.id === category.id ? { ...c, name: input.name, description: input.description, image_url: input.image_url } : c))
                    );
                    setEditingId(null);
                    showToast("Catégorie mise à jour.", "success");
                  } catch {
                    showToast("Échec de la mise à jour.", "error");
                  }
                }}
              />
            ) : (
              <div key={category.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3 py-2.5">
                <span className="text-sm font-semibold text-ink">{category.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingId(category.id)} className="rounded-lg p-1.5 text-muted hover:text-ink">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="rounded-lg p-1.5 text-muted hover:text-danger">
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
