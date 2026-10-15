/**
 * Centralized, Neutral Default Avatar & Profile Picture System
 * 
 * Provides:
 * - A clean, professional WhatsApp-style vector default avatar (SVG data URI)
 * - Safe neutral avatar fallbacks
 * - Gender and context consistent curated avatars for demo users and college organizations
 */

// Universal neutral SVG profile silhouette (WhatsApp / Google standard style)
export const DEFAULT_NEUTRAL_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <rect width="128" height="128" fill="#cbd5e1"/>
  <circle cx="64" cy="44" r="24" fill="#64748b"/>
  <path d="M64 74 C40 74, 20 90, 16 114 C26 123, 44 128, 64 128 C84 128, 102 123, 112 114 C108 90, 88 74, 64 74 Z" fill="#64748b"/>
</svg>
`.trim())}`

// Neutral Dark-theme compatible silhouette
export const DEFAULT_ORGANIZER_CREST = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <rect width="128" height="128" fill="#e0e7ff"/>
  <path d="M64 20 L96 34 L96 66 C96 86 64 104 64 104 C64 104 32 86 32 66 L32 34 Z" fill="#3b82f6"/>
  <circle cx="64" cy="54" r="14" fill="#ffffff"/>
  <path d="M64 72 C52 72, 44 80, 42 90 C48 95, 56 97, 64 97 C72 97, 80 95, 86 90 C84 80, 76 72, 64 72 Z" fill="#ffffff"/>
</svg>
`.trim())}`

// Safe, professional neutral & gender-accurate demo student avatars
// Names:
// - Female names (Priya Menon, Sneha Iyer, Anjali Patel, Meera Nair, Ananya Das) -> female portraits
// - Male names (Rahul Verma, Karan Singh, Dev Agarwal, Ishaan Kapoor, Aditya Rao, Vikram Rao, Rohan Mehta) -> male portraits
const GENDER_ALIGNED_AVATARS = {
  // Female attendees
  priya: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  sneha: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&auto=format&fit=crop&q=80',
  anjali: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&auto=format&fit=crop&q=80',
  meera: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&auto=format&fit=crop&q=80',
  ananya: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  
  // Male attendees
  rahul: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
  karan: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
  dev: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&auto=format&fit=crop&q=80',
  ishaan: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&auto=format&fit=crop&q=80',
  aditya: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&auto=format&fit=crop&q=80',
  vikram: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&auto=format&fit=crop&q=80',
  rohan: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&auto=format&fit=crop&q=80'
}

/**
 * Returns current logged-in user avatar, defaulting to the clean neutral silhouette.
 */
export function getUserAvatar(user) {
  if (user?.avatar && user.avatar.trim() !== '') {
    return user.avatar
  }
  return DEFAULT_NEUTRAL_AVATAR
}

/**
 * Returns an accurate avatar for demo attendees by matching first names,
 * falling back to the neutral default avatar.
 */
export function getAttendeeAvatar(attendee, index = 0) {
  if (typeof attendee === 'string') {
    const firstName = attendee.trim().split(' ')[0].toLowerCase()
    if (GENDER_ALIGNED_AVATARS[firstName]) {
      return GENDER_ALIGNED_AVATARS[firstName]
    }
  } else if (attendee && typeof attendee === 'object' && attendee.name) {
    const firstName = attendee.name.trim().split(' ')[0].toLowerCase()
    if (GENDER_ALIGNED_AVATARS[firstName]) {
      return GENDER_ALIGNED_AVATARS[firstName]
    }
  }

  // If index is passed directly or attendee is index
  const safeIdx = typeof attendee === 'number' ? attendee : index
  const avatarKeys = Object.keys(GENDER_ALIGNED_AVATARS)
  return GENDER_ALIGNED_AVATARS[avatarKeys[safeIdx % avatarKeys.length]] || DEFAULT_NEUTRAL_AVATAR
}

/**
 * Returns organizer avatar or badge logo
 */
export function getOrganizerAvatar(organizer) {
  if (organizer?.avatar && organizer.avatar.trim() !== '') {
    return organizer.avatar
  }
  return DEFAULT_ORGANIZER_CREST
}
