import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../context/AuthContext'
import './Upload.css'

const CATEGORIES = [
  'Handwerk & DIY', 'Kochen & Backen', 'Technik & Software',
  'Business', 'Fitness & Gesundheit', 'Garten', 'Finanzen', 'Kreativität'
]

const COVER_COLORS = [
  { color: '#f0d4c2', label: 'Pfirsich' },
  { color: '#d8f3dc', label: 'Mint' },
  { color: '#e6f1fb', label: 'Blau' },
  { color: '#faeeda', label: 'Gelb' },
  { color: '#fbeaf0', label: 'Rosa' },
  { color: '#eeedfe', label: 'Lila' },
]

const ICONS = ['📄', '📚', '🍞', '🪚', '📊', '💼', '💪', '🥕', '💰', '🎨', '🔧', '🏠', '🌱', '✂️', '🎯']

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', longDescription: '',
    category: '', price: '', tags: '',
    coverColor: '#f0d4c2', icon: '📄',
    coverType: 'color'
  })
  const [file, setFile] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => { if (!user) navigate('/login', { state: { from: '/upload' } }) }, [user])
  if (!user) return null

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleCoverImage = (e) => {
    const img = e.target.files[0]
    if (img) {
      setCoverImage(img)
      setCoverPreview(URL.createObjectURL(img))
      set('coverType', 'image')
    }
  }

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
      // 1. PDF/DOCX hochladen
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('guides').upload(fileName, file)
      if (uploadError) throw uploadError

      // 2. Cover-Bild hochladen (falls vorhanden)
      let coverImagePath = null
      if (coverImage && form.coverType === 'image') {
        const imgExt = coverImage.name.split('.').pop()
        const imgName = `covers/${user.id}/${Date.now()}.${imgExt}`
        const { error: imgError } = await supabase.storage.from('guides').upload(imgName, coverImage)
        if (!imgError) coverImagePath = imgName
      }

      // 3. In Datenbank speichern
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const { error: dbError } = await supabase.from('guides').insert({
        title: form.title,
        description: form.description,
        long_description: form.longDescription,
        category: form.category,
        price: parseFloat(form.price),
        tags: tagsArray,
        author_id: user.id,
        author_name: user.name,
        format: fileExt.toUpperCase(),
        cover_color: form.coverColor,
        cover_image_path: coverImagePath,
        icon: form.icon,
        file_path: fileName,
        active: false
      })
      if (dbError) throw dbError

      setSuccess(true)
    } catch (err) {
      console.error('Upload Fehler:', err)
      setErrors({ submit: 'Fehler: ' + err.message })
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
        <p>Deine Anleitung wird innerhalb von 24h geprüft. Du erhältst eine E-Mail sobald sie live ist.</p>
        <div style={{display:'flex', gap:12, justifyContent:'center'}}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Dashboard öffnen</button>
          <button className="btn btn-outline" onClick={() => {
            setSuccess(false)
            setForm({ title:'', description:'', longDescription:'', category:'', price:'', tags:'', coverColor:'#f0d4c2', icon:'📄', coverType:'color' })
            setFile(null); setCoverImage(null); setCoverPreview(null); setStep(1)
          }}>Weitere hochladen</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="upload-page">
      <div className="container-narrow">
        <div className="upload-header">
          <h1>Anleitung hochladen</h1>
          <p className="text-muted">Du verdienst 85% jedes Verkaufs.</p>
        </div>

        <div className="upload-steps">
          {['Details', 'Cover & Datei', 'Preis & Vorschau'].map((s, i) => (
            <div key={s} className={`upload-step ${step === i+1 ? 'active' : ''} ${step > i+1 ? 'done' : ''}`}>
              <span className="step-num">{step > i+1 ? '✓' : i+1}</span>
              <span className="step-label">{s}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="upload-form">

          {/* Schritt 1: Details */}
          {step === 1 && (
            <div className="upload-section fade-in">
              <div className="form-group">
                <label>Titel *</label>
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
                  rows={5} value={form.longDescription} onChange={e => set('longDescription', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategorie *</label>
                  <select className={`input ${errors.category?'input-error':''}`}
                    value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Wählen…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="form-error">{errors.category}</p>}
                </div>
                <div className="form-group">
                  <label>Tags (kommagetrennt)</label>
                  <input className="input" type="text" placeholder="z.B. DIY, Holz"
                    value={form.tags} onChange={e => set('tags', e.target.value)} />
                </div>
              </div>
              <button type="button" className="btn btn-primary btn-full" onClick={() => {
                const e={}
                if(!form.title.trim()) e.title='Pflichtfeld'
                if(!form.description.trim()) e.description='Pflichtfeld'
                if(!form.category) e.category='Pflichtfeld'
                if(Object.keys(e).length){ setErrors(e) } else { setStep(2); setErrors({}) }
              }}>Weiter →</button>
            </div>
          )}

          {/* Schritt 2: Cover & Datei */}
          {step === 2 && (
            <div className="upload-section fade-in">
              <div className="form-group">
                <label>Cover-Bild für Käufer</label>
                <p style={{fontSize:'0.82rem', color:'var(--ink-faint)', marginBottom:12}}>
                  Das sehen Käufer als erstes — wähle ein eigenes Foto oder eine Farbe mit Icon.
                </p>

                {/* Cover Typ Auswahl */}
                <div className="cover-type-tabs">
                  <button type="button"
                    className={`cover-tab ${form.coverType === 'color' ? 'active' : ''}`}
                    onClick={() => set('coverType', 'color')}>
                    🎨 Farbe + Icon
                  </button>
                  <button type="button"
                    className={`cover-tab ${form.coverType === 'image' ? 'active' : ''}`}
                    onClick={() => set('coverType', 'image')}>
                    🖼️ Eigenes Foto
                  </button>
                </div>

                {form.coverType === 'color' && (
                  <div className="cover-designer">
                    <div className="cover-preview" style={{background: form.coverColor}}>
                      <span style={{fontSize:'3rem'}}>{form.icon}</span>
                    </div>
                    <div className="cover-options">
                      <div style={{marginBottom:12}}>
                        <label style={{fontSize:'0.8rem', marginBottom:6}}>Hintergrundfarbe</label>
                        <div className="color-picker">
                          {COVER_COLORS.map(c => (
                            <button type="button" key={c.color}
                              className={`color-dot ${form.coverColor === c.color ? 'selected' : ''}`}
                              style={{background: c.color}}
                              onClick={() => set('coverColor', c.color)}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{fontSize:'0.8rem', marginBottom:6}}>Icon</label>
                        <div className="icon-picker">
                          {ICONS.map(ic => (
                            <button type="button" key={ic}
                              className={`icon-btn ${form.icon === ic ? 'selected' : ''}`}
                              onClick={() => set('icon', ic)}>
                              {ic}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {form.coverType === 'image' && (
                  <div className="cover-image-upload">
                    {coverPreview ? (
                      <div className="cover-image-preview">
                        <img src={coverPreview} alt="Cover Vorschau" />
                        <button type="button" className="btn btn-ghost btn-sm"
                          onClick={() => { setCoverImage(null); setCoverPreview(null); set('coverType', 'color') }}>
                          Entfernen
                        </button>
                      </div>
                    ) : (
                      <label className="cover-image-dropzone" htmlFor="cover-input">
                        <div style={{fontSize:'2rem', marginBottom:8}}>🖼️</div>
                        <div style={{fontSize:'0.9rem', color:'var(--ink-muted)'}}>
                          Klicken um Bild auszuwählen
                        </div>
                        <div style={{fontSize:'0.78rem', color:'var(--ink-faint)', marginTop:4}}>
                          JPG, PNG · empfohlen 800×600px
                        </div>
                      </label>
                    )}
                    <input id="cover-input" type="file" accept="image/*" style={{display:'none'}}
                      onChange={handleCoverImage} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>PDF oder DOCX Datei *</label>
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
                      <button type="button" className="btn btn-ghost btn-sm"
                        onClick={e=>{e.stopPropagation();setFile(null)}}>Entfernen</button>
                    </>
                  ) : (
                    <>
                      <div className="dropzone-icon">⬆️</div>
                      <div>Datei hier ablegen oder <span style={{color:'var(--accent)'}}>klicken</span></div>
                      <div className="text-faint" style={{fontSize:'0.8rem'}}>PDF oder DOCX · max. 50 MB</div>
                    </>
                  )}
                </div>
                <input id="file-input" type="file" accept=".pdf,.docx" style={{display:'none'}}
                  onChange={e => setFile(e.target.files[0])} />
                {errors.file && <p className="form-error">{errors.file}</p>}
              </div>

              <div style={{display:'flex', gap:12}}>
                <button type="button" className="btn btn-outline" onClick={()=>setStep(1)}>← Zurück</button>
                <button type="button" className="btn btn-primary" style={{flex:1}} onClick={() => {
                  const e={}
                  if(!file) e.file='Datei hochladen'
                  if(Object.keys(e).length){ setErrors(e) } else { setStep(3); setErrors({}) }
                }}>Weiter →</button>
              </div>
            </div>
          )}

          {/* Schritt 3: Preis & Vorschau */}
          {step === 3 && (
            <div className="upload-section fade-in">
              <div className="form-row" style={{marginBottom:20}}>
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
                      ? `€${(+form.price * 0.85).toFixed(2).replace('.',',')} / Verkauf`
                      : '—'}
                  </div>
                  <p className="form-hint">85% Auszahlung · 15% Provision</p>
                </div>
              </div>

              {/* Vorschau */}
              <div style={{marginBottom:20}}>
                <label style={{marginBottom:10, display:'block'}}>Vorschau für Käufer</label>
                <div className="preview-card">
                  <div className="preview-cover" style={{background: form.coverColor, position:'relative', overflow:'hidden'}}>
                    {coverPreview && form.coverType === 'image' ? (
                      <img src={coverPreview} alt="Cover" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    ) : (
                      <span style={{fontSize:'3rem'}}>{form.icon}</span>
                    )}
                  </div>
                  <div className="preview-body">
                    <div className="badge badge-category" style={{marginBottom:8}}>{form.category}</div>
                    <h3 style={{marginBottom:8}}>{form.title || 'Titel deiner Anleitung'}</h3>
                    <p style={{fontSize:'0.875rem', color:'var(--ink-muted)', lineHeight:1.6}}>
                      {form.description || 'Beschreibung erscheint hier'}
                    </p>
                    {form.price && (
                      <div style={{marginTop:12}}>
                        <span className="price">€{(+form.price || 0).toFixed(2).replace('.',',')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                Nach dem Einreichen prüft unser Team deine Anleitung innerhalb von 24h.
              </div>

              {errors.submit && <div className="alert alert-error" style={{marginTop:12}}>{errors.submit}</div>}

              <div style={{display:'flex', gap:12, marginTop:16}}>
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
