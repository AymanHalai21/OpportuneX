import { useState } from 'react'
import {
  Terminal,
  Code2,
  BookOpen,
  GraduationCap,
  Mic2,
  PartyPopper,
  Music,
  Trophy,
  Award,
  Sparkles
} from 'lucide-react'
import { CATEGORY_DEFAULT_BANNERS } from '../utils/eventBanners.js'
import './CategoryImage.css'

const CATEGORY_CONFIG = {
  Hackathon: {
    icon: Terminal,
    subIcon: Code2,
    tagline: 'Code · Build · Ship',
    classModifier: 'cat-hackathon',
    accentColor: '#3b82f6'
  },
  Workshop: {
    icon: BookOpen,
    subIcon: Sparkles,
    tagline: 'Learn · Practice · Master',
    classModifier: 'cat-workshop',
    accentColor: '#10b981'
  },
  Seminar: {
    icon: Mic2,
    subIcon: GraduationCap,
    tagline: 'Keynote · Insights · Dialogue',
    classModifier: 'cat-seminar',
    accentColor: '#8b5cf6'
  },
  Cultural: {
    icon: PartyPopper,
    subIcon: Music,
    tagline: 'Music · Arts · Celebration',
    classModifier: 'cat-cultural',
    accentColor: '#f43f5e'
  },
  Competition: {
    icon: Trophy,
    subIcon: Award,
    tagline: 'Compete · Excel · Win',
    classModifier: 'cat-competition',
    accentColor: '#f59e0b'
  }
}

export default function CategoryImage({ category, image, banner, title, className = '' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const safeCategory = category || 'Hackathon'
  const config = CATEGORY_CONFIG[safeCategory] || CATEGORY_CONFIG.Hackathon
  const Icon = config.icon
  const SubIcon = config.subIcon

  // Resolve banner candidate: explicit image/banner or category default photographic banner
  const candidateImage = banner || image || CATEGORY_DEFAULT_BANNERS[safeCategory]

  // If a valid custom/category image candidate exists and hasn't failed, render the image with subtle scrim
  if (candidateImage && !imageFailed) {
    return (
      <div className={`category-image custom-banner ${className}`}>
        <img
          src={candidateImage}
          alt={title || `${safeCategory} event banner`}
          className="custom-banner-img"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
        <div className="custom-banner-scrim" aria-hidden="true" />
      </div>
    )
  }

  // Otherwise, render the reliable local vector/CSS category fallback
  return (
    <div
      className={`category-image default-banner ${config.classModifier} ${className}`}
      data-category={safeCategory}
      aria-label={`${safeCategory} event banner`}
    >
      {/* Background Graphic Elements */}
      <div className="banner-bg-graphics" aria-hidden="true">
        <div className="banner-glow-orb" />
        <div className="banner-grid-pattern" />
        <div className="banner-geometric-shapes">
          <span className="shape shape--1" />
          <span className="shape shape--2" />
          <span className="shape shape--3" />
        </div>
      </div>

      {/* Main Banner Visual Badge */}
      <div className="banner-center-content">
        <div className="banner-icon-container">
          <Icon className="banner-primary-icon" size={32} />
          <span className="banner-sub-icon-badge">
            <SubIcon size={13} />
          </span>
        </div>
        <div className="banner-label-group">
          <span className="banner-category-name">{safeCategory}</span>
          <span className="banner-tagline">{config.tagline}</span>
        </div>
      </div>
    </div>
  )
}
