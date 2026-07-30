import React, { useEffect, useState } from "react";
import { api, downloadResumePdf } from "../services/api";

const emptyEducation = { degree: "", field: "", institution: "", startYear: "", endYear: "" };
const emptyProject = { title: "", description: "", link: "", techUsed: "" };

export default function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", location: "", linkedin: "", headline: "", summary: "",
    skills: "", education: [emptyEducation], experience: [], projects: [emptyProject],
  });
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState("");
  const [suggestingSummary, setSuggestingSummary] = useState(false);

  useEffect(() => {
    api.getResume().then((r) => {
      if (r) {
        setForm({
          ...r,
          skills: (r.skills || []).join(", "),
          education: r.education?.length ? r.education : [emptyEducation],
          experience: r.experience || [],
          projects: r.projects?.length
            ? r.projects.map((p) => ({ ...p, techUsed: (p.techUsed || []).join(", ") }))
            : [emptyProject],
        });
      }
    });
  }, []);

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateListItem = (listKey, index, field, value) => {
    setForm((f) => {
      const list = [...f[listKey]];
      list[index] = { ...list[index], [field]: value };
      return { ...f, [listKey]: list };
    });
  };
  const addListItem = (listKey, empty) => setForm((f) => ({ ...f, [listKey]: [...f[listKey], empty] }));
  const removeListItem = (listKey, index) => setForm((f) => ({ ...f, [listKey]: f[listKey].filter((_, i) => i !== index) }));

  const handleSuggestSummary = async () => {
    setSuggestingSummary(true);
    try {
      const res = await api.suggestSummary({
        headline: form.headline,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        yearsExperience: form.experience.length,
        projectCount: form.projects.filter((p) => p.title).length,
      });
      updateField("summary", res.summary);
    } finally { setSuggestingSummary(false); }
  };

  const handleSuggestBullets = async (index) => {
    const proj = form.projects[index];
    const techUsed = proj.techUsed.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await api.suggestBullets(techUsed);
    updateListItem("projects", index, "description", res.bullets.map((b) => `• ${b}`).join("\n"));
  };

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        projects: form.projects.map((p) => ({ ...p, techUsed: p.techUsed.split(",").map((t) => t.trim()).filter(Boolean) })),
      };
      await api.saveResume(payload);
      setMsg("✅ Resume saved!");
    } finally { setSaving(false); }
  };

  const handleDownload = async () => {
    setDownloading(true); setMsg("");
    try {
      await handleSave();
      await downloadResumePdf();
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally { setDownloading(false); }
  };

  return (
    <div className="page-container max-w-3xl">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">📄 AI Resume Builder</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Fill in your details — InterviewOS suggests professional wording, and formats it into an ATS-friendly, MNC-ready PDF.
      </p>

      {msg && <p className="text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 mb-4">{msg}</p>}

      <div className="card mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Basic Info</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          <input className="input" placeholder="Location" value={form.location} onChange={(e) => updateField("location", e.target.value)} />
          <input className="input sm:col-span-2" placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} />
          <input className="input sm:col-span-2" placeholder="Headline (e.g. Aspiring Full Stack Developer)" value={form.headline} onChange={(e) => updateField("headline", e.target.value)} />
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Summary</h3>
          <button onClick={handleSuggestSummary} disabled={suggestingSummary} className="btn-secondary !py-1.5 !px-3 !text-xs">
            {suggestingSummary ? "Generating..." : "✨ Suggest Summary"}
          </button>
        </div>
        <textarea className="input h-24" value={form.summary} onChange={(e) => updateField("summary", e.target.value)}
          placeholder="Click 'Suggest Summary' or write your own — a 2-3 sentence professional overview." />
      </div>

      <div className="card mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Skills</h3>
        <input className="input" placeholder="Comma separated, e.g. React, Node.js, MongoDB" value={form.skills} onChange={(e) => updateField("skills", e.target.value)} />
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Projects</h3>
          <button onClick={() => addListItem("projects", emptyProject)} className="text-xs text-primary-600 font-semibold">+ Add project</button>
        </div>
        {form.projects.map((p, i) => (
          <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 mb-2 space-y-2">
            <div className="flex gap-2">
              <input className="input" placeholder="Project title" value={p.title} onChange={(e) => updateListItem("projects", i, "title", e.target.value)} />
              <button onClick={() => removeListItem("projects", i)} className="text-red-500 text-xs px-2">✕</button>
            </div>
            <input className="input" placeholder="Tech used (comma separated, e.g. React, Node)" value={p.techUsed} onChange={(e) => updateListItem("projects", i, "techUsed", e.target.value)} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Description / bullet points</span>
              <button onClick={() => handleSuggestBullets(i)} className="text-xs text-primary-600 font-semibold">✨ Suggest bullets</button>
            </div>
            <textarea className="input h-20" value={p.description} onChange={(e) => updateListItem("projects", i, "description", e.target.value)} />
            <input className="input" placeholder="Link (optional)" value={p.link} onChange={(e) => updateListItem("projects", i, "link", e.target.value)} />
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Education</h3>
          <button onClick={() => addListItem("education", emptyEducation)} className="text-xs text-primary-600 font-semibold">+ Add education</button>
        </div>
        {form.education.map((edu, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-2 border border-gray-100 dark:border-gray-800 rounded-lg p-3 mb-2">
            <input className="input" placeholder="Degree (e.g. B.Tech)" value={edu.degree} onChange={(e) => updateListItem("education", i, "degree", e.target.value)} />
            <input className="input" placeholder="Field (e.g. Computer Science)" value={edu.field} onChange={(e) => updateListItem("education", i, "field", e.target.value)} />
            <input className="input sm:col-span-2" placeholder="Institution" value={edu.institution} onChange={(e) => updateListItem("education", i, "institution", e.target.value)} />
            <input className="input" placeholder="Start year" value={edu.startYear} onChange={(e) => updateListItem("education", i, "startYear", e.target.value)} />
            <input className="input" placeholder="End year" value={edu.endYear} onChange={(e) => updateListItem("education", i, "endYear", e.target.value)} />
          </div>
        ))}
      </div>

      <div className="flex gap-2 sticky bottom-4">
        <button onClick={handleSave} disabled={saving} className="btn-secondary flex-1">{saving ? "Saving..." : "Save Draft"}</button>
        <button onClick={handleDownload} disabled={downloading} className="btn-primary flex-1">
          {downloading ? "Generating PDF..." : "⬇️ Download MNC-Ready PDF"}
        </button>
      </div>
    </div>
  );
}
