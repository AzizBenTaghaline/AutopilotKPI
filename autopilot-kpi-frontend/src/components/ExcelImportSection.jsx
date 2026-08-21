import { useRef, useState } from "react";
import { Upload, FileText, Check, X as XIcon, Clock } from "lucide-react";
import apiClient from "../api/client";
import "./ExcelImportSection.css";

export default function ExcelImportSection({ imports, onImportDone }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiClient.post("/imports/kpi-entries", formData, {
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

  return (
    <section className="import-section">
      <div className="import-columns">
        <div className="import-dropzone-col">
          <div className="import-header">
            <div>
              <h2>Importer données Excel</h2>
              <p className="import-subtitle">Fichiers KPI Commercial — ventes, devis, objectifs</p>
            </div>
            <span className="import-format-badge">
              <FileText size={14} /> Format Excel
            </span>
          </div>

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