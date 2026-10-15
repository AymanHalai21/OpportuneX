import { Plus, Zap, GraduationCap, Mic2, PartyPopper, Award } from 'lucide-react'
import './CategoryFilter.css'

const ICONS = {
  All: Plus,
  Hackathon: Zap,
  Workshop: GraduationCap,
  Seminar: Mic2,
  Cultural: PartyPopper,
  Competition: Award
}

export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="category-filter">
      {categories.map((cat) => {
        const Icon = ICONS[cat] || Plus
        const isActive = active === cat
        return (
          <button
            key={cat}
            className={`category-filter-pill${isActive ? ' active' : ''}`}
            onClick={() => onChange(cat)}
          >
            <Icon size={14} />
            {cat}
          </button>
        )
      })}
    </div>
  )
}
