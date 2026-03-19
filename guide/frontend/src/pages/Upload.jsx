import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../context/AuthContext'
import { CATEGORIES } from '../utils/data'
import './Upload.css'

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', longDescription: '',
    category: '', price: '', tags: '', previewAllowed: true
  })
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => { if (!user) navigate('/login', { state: { from: '/upload' } }) }, [user])
  if (!user) return null

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Titel ist erforderlich'
    if (!form.description.trim()) e.description = 'Beschreibung ist erforderlich'
    if (!form.category) e.category = 'Kategorie wählen'
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = 'Gültigen Preis eingeben'
    if (!file) e.file = 'Bitte Datei hochladen'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      // 1. Datei in Supabase Storage hochladen
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Anleitung in Datenbank speichern
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)

      const { error: dbError } = await supabase
        .from('guides')
        .insert({
          title: form.title,
          description: form.description,
          long_description: form.longDescription,
          category: form.category,
          price: parseFloat(form.price),
          tags: tagsArray,
          author_id: user.id,
          author_name: user.name,
          format: fileExt.toUpperCase(),
          cover_color: '#f0d4c2',
          icon: '📄',
          active: false
        })

      if (dbError) throw dbError

      setSuccess(true)
    } catch (err) {
      console.error('Upload Fehler:', err)
      setErrors({ submit: 'Fehler beim Hochladen: ' + err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.docx'))) setFile(f)
    else setErrors(ev => ({...ev, file: 'Nur PDF oder DOCX erlaubt'}))
  }

  if (success) return (
    <div className="upload-success">
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h2>Anleitung eingereicht!</h2>
        <p>Deine Anleitung wird innerhalb von 24h von unserem Team geprüft. Du erhältst eine E-Mail sobald sie live ist.</p>
        <div style={{display:'flex', gap:12, justifyContent:'center'}}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Dashboard öffnen</button>
          <button className="btn btn-outline" onClick={() => { setSuccess(false); setForm({ title:'', description:'', longDescription:'', category:'', price:'', tags:'', previewAllowed:true }); setFile(null); setStep(1) }}>
            Weitere hochladen
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="upload-page">
      <div className="container-narrow">
        <div className="upload-header">
          <h1>Anleitung hochladen</h1>
          <p className="text-muted">Du verdienst 85% jedes Verkaufs — wir kümmern uns um den Rest.</p>
        </div>

        <div className="upload-steps">
          {['Details', 'Datei & Preis', 'Vorschau'].map((s, i) => (
            <div key={s} className={`upload-step ${step === i+1 ? 'active' : ''} ${step > i+1 ? 'done' : ''}`}>
              <span className="step-num">{step > i+1 ? '✓' : i+1}</span>
              <span className="step-label">{s}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {step === 1 && (
            <div className="upload-section fade-in">
              <div className="form-group">
                <label>Titel der Anleitung *</label>
                <input className={`input ${errors.title?'input-error':''}`} type="text"
                  placeholder="z.B. Holzregal selbst bauen — Komplettanleitung"
                  value={form.title} onChange={e => set('title', e.target.value)} />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>
              <div className="form-group">
                <label>Kurzbeschreibung *</label>
                <textarea className={`input textarea ${errors.description?'input-error':''}`}
                  placeholder="Was lernen Käufer? Was ist enthalten?"
                  rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>
              <div className="form-group">
                <label>Detaillierte Beschreibung (optional)</label>
                <textarea className="input textarea"
                  placeholder="Inhaltsverzeichnis, Kapitel, besondere Features…"
                  rows={6} value={form.longDescription} onChange={e => set('longDescription', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategorie *</label>
                  <select className={`input ${errors.category?'input-error':''}`}
                    value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Kategorie wählen…</option>
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="form-error">{errors.category}</p>}
                </div>
                <div className="form-group">
                  <label>Tags (kommagetrennt)</label>
                  <input className="input" type="text"
                    placeholder="z.B. DIY, Holz, Werkzeug"
                    value={form.tags} onChange={e => set('tags', e.target.value)} />
                </div>
              </div>
              <button type="button" className="btn btn-primary btn-full"
                onClick={() => {
                  const e={}
                  if(!form.title.trim()) e.title='Pflichtfeld'
                  if(!form.description.trim()) e.description='Pflichtfeld'
                  if(!form.category) e.category='Pflichtfeld'
                  if(Object.keys(e).length){ setErrors(e) } else { setStep(2); setErrors({}) }
                }}>
                Weiter →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="upload-section fade-in">
              <div className="form-group">
                <label>Datei hochladen (PDF oder DOCX) *</label>
                <div
                  className={`dropzone ${dragOver?'drag-over':''} ${file?'has-file':''} ${errors.file?'dropzone-error':''}`}
                  onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={()=>document.getElementById('file-input').click()}
                >
                  {file ? (
                    <>
                      <div className="file-icon">📄</div>
                      <div className="file-name">{file.name}</div>
                      <div className="text-faint" style={{fontSize:'0.8rem'}}>{(file.size/1024/1024).toFixed(2)} MB</div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setFile(null)}}>Entfernen</button>
                    </>
                  ) : (
                    <>
                      <div className="dropzone-icon">⬆️</div>
                      <div>Datei hier ablegen oder <span style={{color:'var(--accent)'}}>klicken zum Auswählen</span></div>
                      <div className="text-faint" style={{fontSize:'0.8rem'}}>PDF oder DOCX · max. 50 MB</div>
                    </>
                  )}
                </div>
                <input id="file-input" type="file" accept=".pdf,.docx" style={{display:'none'}}
                  onChange={e => setFile(e.target.files[0])} />
                {errors.file && <p className="form-error">{errors.file}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preis (€) *</label>
                  <div className="price-input-wrap">
                    <span className="price-prefix">€</span>
                    <input className={`input price-input ${errors.price?'input-error':''}`} type="number"
                      min="0.99" max="999" step="0.01" placeholder="14.90"
                      value={form.price} onChange={e => set('price', e.target.value)} />
                  </div>
                  {errors.price && <p className="form-error">{errors.price}</p>}
                </div>
                <div className="form-group">
                  <label>Deine Auszahlung</label>
                  <div className="payout-box">
                    {form.price && !isNaN(form.price) && +form.price > 0
                      ? `€${(+form.price * 0.85).toFixed(2).replace('.',',')} pro Verkauf`
                      : '—'}
                  </div>
                  <p className="form-hint">85% Auszahlung · 15% Provision</p>
                </div>
              </div>

              {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

              <div style={{display:'flex', gap:12}}>
                <button type="button" className="btn btn-outline" onClick={()=>setStep(1)}>← Zurück</button>
                <button type="button" className="btn btn-primary" style={{flex:1}}
                  onClick={()=>{
                    const e={}
                    if(!form.price||isNaN(form.price)||+form.price<=0) e.price='Gültigen Preis'
                    if(!file) e.file='Datei hochladen'
                    if(Object.keys(e).length){ setErrors(e) } else { setStep(3); setErrors({}) }
                  }}>
                  Weiter →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="upload-section fade-in">
              <div className="preview-card">
                <div className="preview-cover" style={{background:'var(--accent-light)'}}>
                  <span style={{fontSize:'3rem'}}>📄</span>
                </div>
                <div className="preview-body">
                  <div className="badge badge-category" style={{marginBottom:8}}>{form.category}</div>
                  <h3 style={{marginBottom:8}}>{form.title}</h3>
                  <p style={{fontSize:'0.875rem', color:'var(--ink-muted)', lineHeight:1.6}}>{form.description}</p>
                  <div style={{marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span className="price">€{(+form.price).toFixed(2).replace('.',',')}</span>
                    <span className="text-faint" style={{fontSize:'0.8rem'}}>{file?.name}</span>
                  </div>
                </div>
              </div>

              <div className="alert alert-info" style={{marginTop:20}}>
                Nach dem Einreichen prüft unser Team deine Anleitung innerhalb von 24h.
              </div>

              <div style={{display:'flex', gap:12, marginTop:20}}>
                <button type="button" className="btn btn-outline" onClick={()=>setStep(2)}>← Zurück</button>
                <button type="submit" className="btn btn-primary" style={{flex:1}} disabled={submitting}>
                  {submitting ? 'Wird hochgeladen…' : '🚀 Anleitung einreichen'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
