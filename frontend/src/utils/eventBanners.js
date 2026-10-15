/**
 * Event Banner & Category Imagery System
 * 
 * Provides:
 * - Curated realistic photography banners matching exact event categories
 * - Dedicated banners for demo events (HackSphere, Deep Learning Workshop, TEDx, Culturama, ICPC, etc.)
 * - Reliable category fallback imagery and local vector fallback support
 */

// Category-level default photographic banners (High-resolution, curated, realistic)
export const CATEGORY_DEFAULT_BANNERS = {
  Hackathon:
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
  Workshop:
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200',
  Seminar:
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200',
  Cultural:
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
  Competition:
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200'
}

// Dedicated individual demo event banners
export const DEMO_EVENT_BANNERS = {
  'hacksphere-2025':
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
  'deep-learning-workshop':
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200',
  'tedx-bits-pilani':
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200',
  'culturama-2025':
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
  'icpc-regionals':
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
  'product-management-bootcamp':
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200',
  'open-source-sprint':
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
  'entrepreneurship-summit':
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200'
}

/**
 * Returns the resolved banner URL for an event, with fallback to category default.
 */
export function getEventBanner(event) {
  if (!event) return CATEGORY_DEFAULT_BANNERS.Hackathon

  if (event.banner && event.banner.trim()) return event.banner
  if (event.image && event.image.trim()) return event.image

  if (event.id && DEMO_EVENT_BANNERS[event.id]) {
    return DEMO_EVENT_BANNERS[event.id]
  }

  const cat = event.category || 'Hackathon'
  return CATEGORY_DEFAULT_BANNERS[cat] || CATEGORY_DEFAULT_BANNERS.Hackathon
}
