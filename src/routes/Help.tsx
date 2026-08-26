import { LifeBuoy, Mail } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const SECTIONS = [
  {
    title: "Trouver une chanson",
    items: [
      "La barre de recherche en haut de l'écran cherche par titre ou artiste et t'emmène directement dans le répertoire filtré.",
      "Dans « Répertoire », affine avec les filtres : artiste, catégorie, langue, tonalité, difficulté, année, présence d'accords ou de vidéo.",
      "« Explorer » propose un aperçu par nouveautés, artistes et catégories.",
    ],
  },
  {
    title: "Éditer une chanson",
    items: [
      "Depuis la fiche d'une chanson, le bouton « Éditer » ouvre l'éditeur par sections et mesures.",
      "Raccourcis clavier dans l'éditeur : Ctrl/Cmd+Z (annuler), Ctrl/Cmd+Maj+Z (rétablir), Ctrl/Cmd+D (dupliquer la section sélectionnée), Suppr (vider la mesure sélectionnée).",
      "La sauvegarde est automatique — le statut s'affiche en haut de l'éditeur.",
    ],
  },
  {
    title: "Assignations et suivi",
    items: [
      "Un chef de chœur assigne une section, une mesure ou une chanson entière à un membre ou un groupe depuis l'onglet « Assignations » de la fiche chanson.",
      "Chaque membre suit ses tâches dans « Mon espace » (dashboard), avec un statut à faire / en cours / terminé / à revoir.",
      "Le Mode Apprentissage guide un membre à travers sa partie assignée, avec les commentaires du chef.",
    ],
  },
  {
    title: "Modes de répétition",
    items: [
      "Mode Répétition : navigue mesure par mesure avec lecture automatique optionnelle.",
      "Mode Présentation : plein écran, grand texte, pensé pour être projeté pendant une répétition ou un culte.",
    ],
  },
];

export function Help() {
  useDocumentTitle("Aide");
  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <LifeBuoy size={22} className="text-accent-ink" />
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Aide</h1>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="p-4">
            <h2 className="mb-2 font-serif text-base font-semibold text-ink">{section.title}</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-4 flex items-center gap-2 p-4 text-sm text-muted">
        <Mail size={16} className="text-accent-ink" />
        Une question qui n'est pas couverte ici ? Contacte le responsable de ton groupe.
      </Card>
    </div>
  );
}
