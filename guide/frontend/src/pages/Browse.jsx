import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GUIDES, CATEGORIES } from '../utils/data'
import GuideCard from '../components/GuideCard'
import './Browse.css'

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
  const activeCategory = searchParams.get('cat') || 'Alle'

  const setCategory = (cat) => {
    if (cat === 'Alle') { searchParams.delete('cat') } 
    else { searchParams.set('cat', cat) }
    setSearchParams(searchParams)
  }

  const filtered = useMemo(() => {
    let result = [...GUIDES]
    if (activeCategory !== 'Alle') result = result.filter(g => g.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.author.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    switch (sort) {
      case 'newest': return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      case 'price-asc': return result.sort((a, b) => a.price - b.price)
      case 'price-desc': return result.sort((a, b) => b.price - a.price)
      case 'rating': return result.sort((a, b) => b.rating - a.rating)
      default: return result.sort((a, b) => b.downloads - a.downloads)
    }
  }, [activeCategory, search, sort])

  return (
    <div className="browse-page">
      {/* Header */}
      <div className="browse-header">
        <div className="container">
          <h1>Anleitungen entdecken</h1>
          <p className="text-muted">{GUIDES.length} Anleitungen von verifizierten Experten</p>
        </div>
      </div>

      <div className="container">
        {/* Search & Sort */}
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

        {/* Categories */}
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

        {/* Results */}
        <div className="browse-results-header">
          <span className="text-muted" style={{fontSize: '0.875rem'}}>
            {filtered.length} Ergebnisse {activeCategory !== 'Alle' ? `in "${activeCategory}"` : ''}
            {search && ` für "${search}"`}
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid-4 browse-grid">
            {filtered.map(g => <GuideCard key={g.id} guide={g} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Keine Anleitungen gefunden</h3>
            <p>Versuch einen anderen Suchbegriff oder eine andere Kategorie.</p>
            <button className="btn btn-secondary" onClick={() => { setSearch(''); setCategory('Alle') }}>
              Filter zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
