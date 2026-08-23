import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Check, X as XIcon, Clock, Download, Info } from "lucide-react";
import apiClient from "../api/client";
import "./ExcelImportSection.css";

export default function ExcelImportSection({ title, subtitle, importTypes, imports, onImportDone }) {
  const [selectedType, setSelectedType] = useState(importTypes[0].value);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [format, setFormat] = useState(null);
  const fileInputRef = useRef(null);

  const currentType = importTypes.find((t) => t.value === selectedType);

  useEffect(() => {
    async function loadFormat() {
      if (!currentType?.formatEndpoint) {
        setFormat(null);
        return;
      }
      try {
        const res = await apiClient.get(currentType.formatEndpoint);
        setFormat(res.data);
      } catch {
        setFormat(null);
      }
    }
    loadFormat();
  }, [selectedType]);

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiClient.post(currentType.endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onImportDone();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'import");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  async function handleDownloadTemplate() {
    if (!currentType?.templateEndpoint) return;
    const res = await apiClient.get(currentType.templateEndpoint, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "modele_import.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <section className="import-section">
      <div className="import-columns">
        <div className="import-dropzone-col">
          <div className="import-header">
            <div>
              <h2>{title}</h2>
              <p className="import-subtitle">{subtitle}</p>
            </div>
            <span className="import-format-badge">
              <FileText size={14} /> Format Excel
            </span>
          </div>

          {importTypes.length > 1 && (
            <div className="import-type-selector">
              {importTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`import-type-tab ${selectedType === t.value ? "active" : ""}`}
                  onClick={() => setSelectedType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {format && (
            <div className="import-format-info">
              <div className="import-format-info-header">
                <Info size={14} />
                <span>Colonnes attendues</span>
              </div>
              <div className="import-columns-tags">
                {format.colonnes.map((c) => (
                  <span key={c.nom} className={`import-column-tag ${c.obligatoire ? "required" : ""}`} title={c.description}>
                    {c.nom}{c.obligatoire ? "" : " (optionnel)"}
                  </span>
                ))}
              </div>

              {format.kpis_disponibles.length > 0 ? (
                <>
                  <p className="import-format-note">Noms de KPI acceptés pour votre rôle :</p>
                  <ul className="import-kpi-list">
                    {format.kpis_disponibles.map((k) => (
                      <li key={k.nom}>
                        <strong>{k.nom}</strong> — {k.unite}, saisie {k.periodicite}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="import-format-note">Aucun KPI disponible pour votre rôle actuellement.</p>
              )}
            </div>
          )}

          <div
            className={`import-dropzone ${dragActive ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="import-icon-circle">
              <Upload size={22} />
            </div>
            <p className="import-drop-text">
              {uploading ? "Import en cours..." : (
                <>Glissez votre fichier Excel ici ou <span className="import-link">cliquez pour parcourir</span></>
              )}
            </p>
            <p className="import-hint">Formats acceptés : .xlsx, .xls — Max 10 MB</p>
            <div className="import-format-tags">
              <span>.XLSX</span>
              <span>.XLS</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          {error && <p className="import-error">{error}</p>}
        </div>

        <div className="import-history-col">
          <h3>Historique imports</h3>
          {imports.length === 0 && <p className="import-empty">Aucun import pour l'instant.</p>}
          {imports.map((imp) => (
            <div className="import-history-item" key={imp.id}>
              <span className={`import-history-icon ${imp.statut === "success" ? "ok" : imp.statut === "failed" ? "err" : "partial"}`}>
                {imp.statut === "success" ? <Check size={16} /> : imp.statut === "failed" ? <XIcon size={16} /> : <Clock size={16} />}
              </span>
              <div className="import-history-info">
                <strong>{imp.nom_fichier}</strong>
                <p>{new Date(imp.created_at).toLocaleDateString("fr-FR")} — {imp.nb_lignes_succes}/{imp.nb_lignes} ligne(s)</p>
              </div>
              <span className={`import-history-badge ${imp.statut}`}>
                {imp.statut === "success" ? "OK" : imp.statut === "failed" ? "Err" : "Partiel"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}