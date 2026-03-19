import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../context/AuthContext'
import GuideCard from '../components/GuideCard'
import './Browse.css'

const CATEGORIES = [
  'Alle', 'Handwerk & DIY', 'Kochen & Backen', 'Technik & Software',
  'Business', 'Fitness & Gesundheit', 'Garten', 'Finanzen', 'Kreativität'
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Beliebtheit' },
  { value: 'newest', label: 'Neueste' },
  { value: 'price-asc', label: 'Preis ↑' },
  { value: 'price-desc', label: 'Preis ↓' },
  { value: 'rating', label: 'Bewertung' },
]

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popular')
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const activeCategory = searchParams.get('cat') || 'Alle'

  useEffect(() => { loadGuides() }, [activeCategory, sort])

  const loadGuides = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('guides')
        .select('*')
        .eq('active', true)

      if (activeCategory !== 'Alle') {
        query = query.eq('category', activeCategory)
      }

      switch (sort) {
        case 'newest': query = query.order('created_at', { ascending: false }); break
        case 'price-asc': query = query.order('price', { ascending: true }); break
        case 'price-desc': query = query.order('price', { ascending: false }); break
        case 'rating': query = query.order('rating', { ascending: false }); break
        default: query = query.order('downloads', { ascending: false })
      }

      const { data, error } = await query
      if (error) throw error
      setGuides(data || [])
    } catch (err) {
      console.error('Fehler beim Laden:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = guides.filter(g => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      g.title?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.author_name?.toLowerCase().includes(q) ||
      g.tags?.some(t => t.toLowerCase().includes(q))
    )
  })

  const setCategory = (cat) => {
    if (cat === 'Alle') { searchParams.delete('cat') }
    else { searchParams.set('cat', cat) }
    setSearchParams(searchParams)
  }

  return (
    <div className="browse-page">
      <div className="browse-header">
        <div className="container">
          <h1>Anleitungen entdecken</h1>
          <p className="text-muted">Anleitungen von verifizierten Experten</p>
        </div>
      </div>

      <div className="container">
        <div className="browse-controls">
          <div className="search-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search" className="input search-input"
              placeholder="Anleitungen suchen…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="browse-cats">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="browse-results-header">
          <span className="text-muted" style={{fontSize: '0.875rem'}}>
            {loading ? 'Laden…' : `${filtered.length} Anleitungen`}
            {activeCategory !== 'Alle' ? ` in "${activeCategory}"` : ''}
            {search && ` für "${search}"`}
          </span>
        </div>

        {loading ? (
          <div className="grid-4 browse-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="card" style={{height: 320}}>
                <div className="skeleton" style={{height: 140}}></div>
                <div style={{padding: 18}}>
                  <div className="skeleton" style={{height: 16, marginBottom: 8, borderRadius: 4}}></div>
                  <div className="skeleton" style={{height: 12, marginBottom: 6, borderRadius: 4, width: '80%'}}></div>
                  <div className="skeleton" style={{height: 12, borderRadius: 4, width: '60%'}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid-4 browse-grid">
            {filtered.map(g => <GuideCard key={g.id} guide={g} isReal={true} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Keine Anleitungen gefunden</h3>
            <p>{guides.length === 0 ? 'Noch keine Anleitungen verfügbar. Sei der Erste und lade eine hoch!' : 'Versuch einen anderen Suchbegriff.'}</p>
            <button className="btn btn-secondary" onClick={() => { setSearch(''); setCategory('Alle') }}>
              Filter zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
