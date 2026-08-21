import { supabase } from "./supabaseClient.js";

const STATUS = {
  Apprise: { fg: "#2F5C33", bg: "#E1EDDE" },
  "En cours": { fg: "#8A5E12", bg: "#F6E7C9" },
  "À apprendre": { fg: "#7A2E3A", bg: "#F3DEE1" },
};

let songs = [];
let selectedId = null;
let mode = "loading"; // loading | view | edit | empty
let editingDraft = null; // draft object while mode === "edit"
let filterStatus = "Toutes";
let searchTerm = "";
let session = null;
let authPanelOpen = false;
let authError = "";

const root = document.getElementById("app");

function emptySong() {
  return {
    title: "",
    key: "",
    tempo: "",
    style: "",
    origin: "",
    status: "À apprendre",
    sections: [{ name: "Couplet 1", lines: [{ lyrics: "", chords: "", notes: "" }] }],
    indications: "",
  };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function isAdmin() {
  return !!session;
}

// ---------- Data layer (Supabase) ----------

async function loadSongs() {
  const { data, error } = await supabase.from("songs").select("*").order("title", { ascending: true });
  if (error) {
    console.error("Erreur de chargement", error);
    songs = [];
    return;
  }
  songs = data || [];
}

async function createSong(draft) {
  const { id, ...payload } = draft;
  const { data, error } = await supabase.from("songs").insert([payload]).select().single();
  if (error) throw error;
  return data;
}

async function updateSong(id, draft) {
  const { id: _drop, ...payload } = draft;
  const { data, error } = await supabase.from("songs").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

async function deleteSong(id) {
  const { error } = await supabase.from("songs").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Layout shell ----------

function buildShell() {
  root.innerHTML = `
    <div id="gospel-app">
      <div style="background: #4B2545; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div>
          <div class="serif" style="color: #F3E9D2; font-size: 24px; font-weight: 700; letter-spacing: 0.3px;">Répertoire gospel</div>
          <div style="color: #C9A9C4; font-size: 13px; margin-top: 2px;">Paroles, accords et notes du groupe</div>
        </div>
        <div id="gs-header-actions" style="display:flex; gap:10px; align-items:center;"></div>
      </div>
      <div id="gs-auth-panel"></div>
      <div id="gs-body" style="display: flex; min-height: 420px; flex-wrap: wrap;">
        <div style="width: 260px; border-right: 1px solid #E6DCC4; background: #F5EFDE; padding: 16px; flex-shrink: 0;">
          <input id="gs-search" type="text" placeholder="Rechercher une chanson..." style="width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #DCCFA8; font-size: 13px; margin-bottom: 12px; background: #FFFDF7;" />
          <div id="gs-filters" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;"></div>
          <div id="gs-list" style="display: flex; flex-direction: column; gap: 6px;"></div>
        </div>
        <div id="gs-main" style="flex: 1; padding: 26px 30px; min-width: 280px;"></div>
      </div>
    </div>`;

  document.getElementById("gs-search").oninput = (e) => {
    searchTerm = e.target.value;
    renderList();
  };
}

// ---------- Header / auth ----------

function renderHeaderActions() {
  const el = document.getElementById("gs-header-actions");
  el.innerHTML = "";

  if (isAdmin()) {
    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Nouvelle chanson";
    addBtn.style.cssText = "background: #B8892B; color: #2A2118; border: none; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 700;";
    addBtn.onclick = () => {
      editingDraft = emptySong();
      selectedId = null;
      mode = "edit";
      render();
    };
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Déconnexion";
    logoutBtn.style.cssText = "background: transparent; color: #F3E9D2; border: 1px solid #C9A9C4; padding: 9px 16px; border-radius: 8px; font-size: 13px;";
    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
    };
    el.appendChild(addBtn);
    el.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Connexion admin";
    loginBtn.style.cssText = "background: transparent; color: #F3E9D2; border: 1px solid #C9A9C4; padding: 9px 16px; border-radius: 8px; font-size: 13px;";
    loginBtn.onclick = () => {
      authPanelOpen = !authPanelOpen;
      renderAuthPanel();
    };
    el.appendChild(loginBtn);
  }
}

function renderAuthPanel() {
  const el = document.getElementById("gs-auth-panel");
  if (!authPanelOpen || isAdmin()) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `
    <div style="background:#F5EFDE; border-bottom:1px solid #E6DCC4; padding:14px 28px; display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
      <div>
        <label style="display:block; font-size:11px; font-weight:700; color:#5B5342; margin-bottom:3px;">Email</label>
        <input id="gs-auth-email" type="email" style="padding:7px 10px; border-radius:6px; border:1px solid #DCCFA8; font-size:13px; background:#FFFDF7;" />
      </div>
      <div>
        <label style="display:block; font-size:11px; font-weight:700; color:#5B5342; margin-bottom:3px;">Mot de passe</label>
        <input id="gs-auth-password" type="password" style="padding:7px 10px; border-radius:6px; border:1px solid #DCCFA8; font-size:13px; background:#FFFDF7;" />
      </div>
      <button id="gs-auth-submit" style="background:#4B2545; color:#F3E9D2; border:none; padding:8px 16px; border-radius:6px; font-size:13px; font-weight:700;">Se connecter</button>
      ${authError ? `<div style="color:#7A2E3A; font-size:12px;">${escapeHtml(authError)}</div>` : ""}
    </div>`;

  const submitBtn = document.getElementById("gs-auth-submit");
  submitBtn.onclick = async () => {
    const email = document.getElementById("gs-auth-email").value.trim();
    const password = document.getElementById("gs-auth-password").value;
    authError = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Connexion...";
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        authError = error.message;
        renderAuthPanel();
        return;
      }
      authPanelOpen = false;
    } catch (e) {
      console.error("Erreur de connexion", e);
      authError = "Erreur réseau : " + e.message;
      renderAuthPanel();
    }
  };
}

// ---------- Sidebar ----------

function filteredSongs() {
  return songs.filter((s) => {
    const matchStatus = filterStatus === "Toutes" || s.status === filterStatus;
    const matchSearch = !searchTerm || (s.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });
}

function renderFilters() {
  const $filters = document.getElementById("gs-filters");
  const statuses = ["Toutes", "Apprise", "En cours", "À apprendre"];
  $filters.innerHTML = "";
  statuses.forEach((st) => {
    const btn = document.createElement("button");
    const active = filterStatus === st;
    btn.textContent = st;
    btn.style.cssText = `padding: 5px 10px; border-radius: 999px; font-size: 12px; border: 1px solid ${active ? "#4B2545" : "#DCCFA8"}; background: ${active ? "#4B2545" : "#FFFDF7"}; color: ${active ? "#F3E9D2" : "#5B5342"}; font-weight: ${active ? "700" : "400"};`;
    btn.onclick = () => {
      filterStatus = st;
      renderFilters();
      renderList();
    };
    $filters.appendChild(btn);
  });
}

function renderList() {
  const $list = document.getElementById("gs-list");
  $list.innerHTML = "";
  const items = filteredSongs();
  if (items.length === 0) {
    const p = document.createElement("div");
    p.style.cssText = "font-size: 13px; color: #8A8062; padding: 10px 4px;";
    p.textContent = songs.length === 0 ? "Aucune chanson pour l'instant." : "Aucun résultat.";
    $list.appendChild(p);
    return;
  }
  items.forEach((s) => {
    const row = document.createElement("div");
    const active = s.id === selectedId && mode !== "edit";
    const st = STATUS[s.status] || STATUS["À apprendre"];
    row.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; background: ${active ? "#EADFF2" : "transparent"}; border-left: 3px solid ${active ? "#B8892B" : "transparent"};`;
    row.innerHTML = `
      <div style="font-size: 14px; font-weight: ${active ? 700 : 500}; color: #2A2118;">${escapeHtml(s.title || "(sans titre)")}</div>
      <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
        <span style="font-size: 11px; color: #8A8062;">${escapeHtml(s.key || "")}</span>
        <span style="font-size: 10px; padding: 1px 7px; border-radius: 999px; background:${st.bg}; color:${st.fg}; font-weight:700;">${s.status}</span>
      </div>`;
    row.onclick = () => {
      selectedId = s.id;
      mode = "view";
      render();
    };
    $list.appendChild(row);
  });
}

// ---------- Main panel ----------

function renderMain() {
  const $main = document.getElementById("gs-main");
  $main.innerHTML = "";

  if (mode === "loading") {
    $main.innerHTML = '<div style="padding:40px; text-align:center; color:#8A8062;">Chargement du répertoire...</div>';
    return;
  }

  if (mode === "edit" && editingDraft) {
    renderEdit($main);
    return;
  }

  const song = songs.find((s) => s.id === selectedId);
  if (!song) {
    $main.innerHTML = `
      <div style="text-align:center; padding: 60px 20px; color:#8A8062;">
        <div class="serif" style="font-size: 20px; color:#4B2545; margin-bottom:8px;">Bienvenue dans le répertoire</div>
        <div style="font-size:14px;">Sélectionnez une chanson à gauche${isAdmin() ? ", ou créez-en une nouvelle." : "."}</div>
      </div>`;
    return;
  }
  renderView($main, song);
}

function renderView(wrap, song) {
  const st = STATUS[song.status] || STATUS["À apprendre"];

  const header = document.createElement("div");
  header.style.cssText = "display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #B8892B; padding-bottom: 14px; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;";
  header.innerHTML = `
    <div>
      <div class="serif" style="font-size:28px; font-weight:700; color:#4B2545;">${escapeHtml(song.title || "(sans titre)")}</div>
      <div style="margin-top:6px; font-size:13px; color:#8A8062; font-style:italic;">${escapeHtml(song.origin || "")}</div>
    </div>
    <div style="display:flex; gap:8px; align-items:flex-start;">
      <span style="font-size: 12px; padding: 4px 12px; border-radius: 999px; background:${st.bg}; color:${st.fg}; font-weight:700; white-space:nowrap;">${song.status}</span>
      ${isAdmin() ? `
      <button id="gs-edit-btn" style="border: 1px solid #DCCFA8; background:#FFFDF7; padding: 7px 14px; border-radius: 7px; font-size: 13px; color:#4B2545; font-weight:600;">Modifier</button>
      <button id="gs-del-btn" style="border: 1px solid #E3B9BE; background:#FFFDF7; padding: 7px 14px; border-radius: 7px; font-size: 13px; color:#7A2E3A; font-weight:600;">Supprimer</button>` : ""}
    </div>`;
  wrap.appendChild(header);

  const badges = document.createElement("div");
  badges.style.cssText = "display:flex; gap:12px; margin-bottom: 20px; flex-wrap:wrap;";
  [["Tonalité", song.key], ["Tempo", song.tempo], ["Style", song.style]].forEach(([label, val]) => {
    const b = document.createElement("div");
    b.style.cssText = "background:#F5EFDE; border-radius:8px; padding:9px 16px; min-width:120px;";
    b.innerHTML = `<div style="font-size:10px; letter-spacing:0.5px; color:#8A8062; font-weight:700; text-transform:uppercase;">${label}</div><div style="font-size:15px; font-weight:700; color:#2A2118; margin-top:2px;">${escapeHtml(val || "—")}</div>`;
    badges.appendChild(b);
  });
  wrap.appendChild(badges);

  (song.sections || []).forEach((sec) => {
    const secHead = document.createElement("div");
    secHead.style.cssText = "background:#4B2545; color:#F3E9D2; padding:8px 14px; border-radius:7px; font-weight:700; font-size:14px; margin: 18px 0 10px;";
    secHead.textContent = sec.name;
    wrap.appendChild(secHead);

    (sec.lines || []).forEach((line) => {
      const card = document.createElement("div");
      card.style.cssText = "background:#FBF3E0; border-left:4px solid #B8892B; border-radius: 0 8px 8px 0; padding:10px 16px; margin-bottom:10px;";
      card.innerHTML = `
        <div style="font-size:16px; font-weight:700; color:#2A2118;">${escapeHtml(line.lyrics || "")}</div>
        <div style="font-size:13px; margin-top:4px;"><span style="color:#8A8062; font-style:italic;">Accords </span><span style="color:#8A5E12; font-weight:700;">${escapeHtml(line.chords || "")}</span></div>
        <div style="font-size:13px; margin-top:2px;"><span style="color:#8A8062; font-style:italic;">Notes </span><span style="color:#2F5C33; font-weight:700; font-style:italic;">${escapeHtml(line.notes || "")}</span></div>`;
      wrap.appendChild(card);
    });
  });

  if (song.indications) {
    const indHead = document.createElement("div");
    indHead.style.cssText = "background:#7A2E3A; color:#F3E9D2; padding:8px 14px; border-radius:7px; font-weight:700; font-size:14px; margin: 18px 0 10px;";
    indHead.textContent = "Indications d'interprétation";
    wrap.appendChild(indHead);
    const indBody = document.createElement("div");
    indBody.style.cssText = "background:#F3DEE1; border-left:4px solid #7A2E3A; border-radius:0 8px 8px 0; padding:10px 16px; font-size:14px; font-style:italic; color:#2A2118;";
    indBody.textContent = song.indications;
    wrap.appendChild(indBody);
  }

  if (isAdmin()) {
    document.getElementById("gs-edit-btn").onclick = () => {
      editingDraft = JSON.parse(JSON.stringify(song));
      mode = "edit";
      render();
    };
    document.getElementById("gs-del-btn").onclick = async () => {
      if (confirm("Supprimer définitivement « " + (song.title || "cette chanson") + " » ?")) {
        try {
          await deleteSong(song.id);
          songs = songs.filter((s) => s.id !== song.id);
          selectedId = null;
          mode = "empty";
          render();
        } catch (e) {
          alert("Erreur lors de la suppression : " + e.message);
        }
      }
    };
  }
}

function renderEdit(wrap) {
  const draft = editingDraft;
  const isNew = !draft.id;

  const title = document.createElement("div");
  title.className = "serif";
  title.style.cssText = "font-size:20px; font-weight:700; color:#4B2545; margin-bottom:16px;";
  title.textContent = isNew ? "Nouvelle chanson" : "Modifier la chanson";
  wrap.appendChild(title);

  function fieldRow(labelText, value, key, placeholder) {
    const box = document.createElement("div");
    box.style.cssText = "margin-bottom:10px;";
    const label = document.createElement("label");
    label.style.cssText = "display:block; font-size:12px; font-weight:700; color:#5B5342; margin-bottom:4px;";
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "text";
    input.value = value || "";
    input.placeholder = placeholder || "";
    input.style.cssText = "width:100%; padding:9px 12px; border-radius:7px; border:1px solid #DCCFA8; font-size:14px; background:#FFFDF7;";
    input.oninput = () => { draft[key] = input.value; };
    box.appendChild(label); box.appendChild(input);
    return box;
  }

  const rowTop = document.createElement("div");
  rowTop.style.cssText = "display:grid; grid-template-columns: 1fr 1fr; gap:12px;";
  rowTop.appendChild(fieldRow("Titre", draft.title, "title", "ex : Oh Happy Day"));
  const statusBox = document.createElement("div");
  statusBox.style.cssText = "margin-bottom:10px;";
  statusBox.innerHTML = `<label style="display:block; font-size:12px; font-weight:700; color:#5B5342; margin-bottom:4px;">Statut</label>`;
  const sel = document.createElement("select");
  sel.style.cssText = "width:100%; padding:9px 12px; border-radius:7px; border:1px solid #DCCFA8; font-size:14px; background:#FFFDF7;";
  ["Apprise", "En cours", "À apprendre"].forEach((opt) => {
    const o = document.createElement("option"); o.value = opt; o.textContent = opt;
    if (draft.status === opt) o.selected = true;
    sel.appendChild(o);
  });
  sel.onchange = () => { draft.status = sel.value; };
  statusBox.appendChild(sel);
  rowTop.appendChild(statusBox);
  wrap.appendChild(rowTop);

  const rowInfo = document.createElement("div");
  rowInfo.style.cssText = "display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;";
  rowInfo.appendChild(fieldRow("Tonalité", draft.key, "key", "ex : Sol majeur (G)"));
  rowInfo.appendChild(fieldRow("Tempo", draft.tempo, "tempo", "ex : 96 bpm"));
  rowInfo.appendChild(fieldRow("Style", draft.style, "style", "ex : Gospel traditionnel"));
  wrap.appendChild(rowInfo);

  wrap.appendChild(fieldRow("Origine / compositeur", draft.origin, "origin", "ex : Traditionnel"));

  const secLabel = document.createElement("div");
  secLabel.style.cssText = "font-size:14px; font-weight:700; color:#4B2545; margin:18px 0 8px;";
  secLabel.textContent = "Sections";
  wrap.appendChild(secLabel);

  const secContainer = document.createElement("div");
  wrap.appendChild(secContainer);

  function renderSections() {
    secContainer.innerHTML = "";
    draft.sections.forEach((sec, si) => {
      const secBox = document.createElement("div");
      secBox.style.cssText = "background:#F5EFDE; border-radius:8px; padding:12px; margin-bottom:12px;";

      const secTop = document.createElement("div");
      secTop.style.cssText = "display:flex; gap:8px; align-items:center; margin-bottom:8px;";
      const secNameInput = document.createElement("input");
      secNameInput.type = "text"; secNameInput.value = sec.name;
      secNameInput.placeholder = "Nom de la section (Couplet 1, Refrain...)";
      secNameInput.style.cssText = "flex:1; padding:7px 10px; border-radius:6px; border:1px solid #DCCFA8; font-size:13px; font-weight:700; background:#FFFDF7;";
      secNameInput.oninput = () => { sec.name = secNameInput.value; };
      const rmSecBtn = document.createElement("button");
      rmSecBtn.textContent = "Retirer la section";
      rmSecBtn.style.cssText = "border:1px solid #E3B9BE; background:#FFFDF7; color:#7A2E3A; font-size:11px; padding:6px 10px; border-radius:6px;";
      rmSecBtn.onclick = () => { draft.sections.splice(si, 1); renderSections(); };
      secTop.appendChild(secNameInput); secTop.appendChild(rmSecBtn);
      secBox.appendChild(secTop);

      sec.lines.forEach((line, li) => {
        const lineRow = document.createElement("div");
        lineRow.style.cssText = "display:grid; grid-template-columns: 2fr 1fr 1fr auto; gap:6px; margin-bottom:6px;";
        const lyrEl = document.createElement("input"); lyrEl.type = "text"; lyrEl.placeholder = "Paroles"; lyrEl.value = line.lyrics;
        const chEl = document.createElement("input"); chEl.type = "text"; chEl.placeholder = "Accords (ex: C G Am)"; chEl.value = line.chords;
        const noEl = document.createElement("input"); noEl.type = "text"; noEl.placeholder = "Notes (ex: do sol la)"; noEl.value = line.notes;
        [lyrEl, chEl, noEl].forEach((el) => { el.style.cssText = "padding:7px 9px; border-radius:6px; border:1px solid #DCCFA8; font-size:13px; background:#FFFDF7;"; });
        lyrEl.oninput = () => { line.lyrics = lyrEl.value; };
        chEl.oninput = () => { line.chords = chEl.value; };
        noEl.oninput = () => { line.notes = noEl.value; };
        const rmLineBtn = document.createElement("button");
        rmLineBtn.textContent = "✕";
        rmLineBtn.title = "Supprimer cette ligne";
        rmLineBtn.style.cssText = "border:1px solid #DCCFA8; background:#FFFDF7; color:#7A2E3A; font-size:13px; padding:0 10px; border-radius:6px;";
        rmLineBtn.onclick = () => { sec.lines.splice(li, 1); renderSections(); };
        lineRow.appendChild(lyrEl); lineRow.appendChild(chEl); lineRow.appendChild(noEl); lineRow.appendChild(rmLineBtn);
        secBox.appendChild(lineRow);
      });

      const addLineBtn = document.createElement("button");
      addLineBtn.textContent = "+ Ajouter une ligne";
      addLineBtn.style.cssText = "margin-top:4px; border:1px dashed #B8892B; background:transparent; color:#8A5E12; font-size:12px; padding:6px 10px; border-radius:6px;";
      addLineBtn.onclick = () => { sec.lines.push({ lyrics: "", chords: "", notes: "" }); renderSections(); };
      secBox.appendChild(addLineBtn);

      secContainer.appendChild(secBox);
    });
  }
  renderSections();

  const addSecBtn = document.createElement("button");
  addSecBtn.textContent = "+ Ajouter une section";
  addSecBtn.style.cssText = "border:1px solid #4B2545; background:#FFFDF7; color:#4B2545; font-size:13px; font-weight:700; padding:8px 14px; border-radius:7px; margin-bottom:16px;";
  addSecBtn.onclick = () => { draft.sections.push({ name: "Nouvelle section", lines: [{ lyrics: "", chords: "", notes: "" }] }); renderSections(); };
  wrap.appendChild(addSecBtn);

  const indLabel = document.createElement("label");
  indLabel.style.cssText = "display:block; font-size:12px; font-weight:700; color:#5B5342; margin-bottom:4px;";
  indLabel.textContent = "Indications d'interprétation";
  wrap.appendChild(indLabel);
  const indArea = document.createElement("textarea");
  indArea.rows = 3;
  indArea.value = draft.indications || "";
  indArea.placeholder = "Nuances, respirations, ad-libs...";
  indArea.style.cssText = "width:100%; padding:9px 12px; border-radius:7px; border:1px solid #DCCFA8; font-size:14px; background:#FFFDF7; margin-bottom:18px; resize:vertical;";
  indArea.oninput = () => { draft.indications = indArea.value; };
  wrap.appendChild(indArea);

  const errorMsg = document.createElement("div");
  errorMsg.style.cssText = "color:#7A2E3A; font-size:13px; margin-bottom:10px; display:none;";
  wrap.appendChild(errorMsg);

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex; gap:10px;";
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Enregistrer";
  saveBtn.style.cssText = "background:#B8892B; color:#2A2118; border:none; padding:10px 20px; border-radius:7px; font-size:14px; font-weight:700;";
  saveBtn.onclick = async () => {
    if (!draft.title || !draft.title.trim()) {
      errorMsg.textContent = "Le titre est obligatoire.";
      errorMsg.style.display = "block";
      return;
    }
    saveBtn.disabled = true;
    saveBtn.textContent = "Enregistrement...";
    try {
      if (isNew) {
        const created = await createSong(draft);
        songs.push(created);
        selectedId = created.id;
      } else {
        const updated = await updateSong(draft.id, draft);
        const idx = songs.findIndex((s) => s.id === draft.id);
        if (idx >= 0) songs[idx] = updated;
        selectedId = updated.id;
      }
      songs.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      editingDraft = null;
      mode = "view";
      render();
    } catch (e) {
      errorMsg.textContent = "Erreur lors de l'enregistrement : " + e.message;
      errorMsg.style.display = "block";
      saveBtn.disabled = false;
      saveBtn.textContent = "Enregistrer";
    }
  };
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Annuler";
  cancelBtn.style.cssText = "border:1px solid #DCCFA8; background:#FFFDF7; padding:10px 20px; border-radius:7px; font-size:14px; color:#5B5342;";
  cancelBtn.onclick = () => {
    editingDraft = null;
    mode = selectedId ? "view" : "empty";
    render();
  };
  actions.appendChild(saveBtn); actions.appendChild(cancelBtn);
  wrap.appendChild(actions);
}

// ---------- Root render ----------

function render() {
  renderHeaderActions();
  renderAuthPanel();
  renderFilters();
  renderList();
  renderMain();
}

// ---------- Init ----------

async function init() {
  buildShell();
  render();

  const { data: { session: initialSession } } = await supabase.auth.getSession();
  session = initialSession;

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session = newSession;
    authPanelOpen = false;
    // Non-admin viewers get kicked out of the edit form if their session drops.
    if (!isAdmin() && mode === "edit") {
      editingDraft = null;
      mode = selectedId ? "view" : "empty";
    }
    render();
  });

  await loadSongs();
  selectedId = songs[0] ? songs[0].id : null;
  mode = selectedId ? "view" : "empty";
  render();
}

init();
