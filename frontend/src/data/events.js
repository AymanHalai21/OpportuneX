// Mock data layer — swap for real API calls later.

export const CATEGORIES = ['All', 'Hackathon', 'Workshop', 'Seminar', 'Cultural', 'Competition']

export const events = [
  {
    id: 'hacksphere-2025',
    title: 'HackSphere 2025',
    category: 'Hackathon',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    dateLabel: 'Sep 14–15, 2025',
    date: '2025-09-14',
    time: '9:00 AM',
    venue: 'IIT Delhi, Main Auditorium',
    online: false,
    registered: 253,
    seatsLeft: 47,
    capacity: 300,
    free: true,
    attending: false,
    organizer: {
      name: 'Tech Club, IIT Delhi',
      subtitle: 'Verified College Organization',
      avatarSeed: 'techclub'
    },
    description:
      "HackSphere is IIT Delhi's flagship 36-hour hackathon with a ₹5L prize pool. Build solutions across AI, FinTech, Climate, and Health tracks. Open to all college students across India. Network with 500+ developers, designers, and product thinkers.",
    tags: ['AI/ML', 'FinTech', 'Climate', 'Open Source'],
    hostedByMe: true,
    dashboard: {
      checkedIn: 97,
      checkInRate: 38,
      daysUntil: 26,
      attendees: [
        { name: 'Priya Menon', college: 'NSUT Delhi', registeredLabel: '9:12 AM', status: 'Checked In' },
        { name: 'Rahul Verma', college: 'DTU Delhi', registeredLabel: 'Yesterday', status: 'Registered' },
        { name: 'Sneha Iyer', college: 'IIT Delhi', registeredLabel: '9:05 AM', status: 'Checked In' },
        { name: 'Karan Singh', college: 'BITS Pilani', registeredLabel: '2 days ago', status: 'Registered' },
        { name: 'Anjali Patel', college: 'VIT Vellore', registeredLabel: '2 days ago', status: 'Registered' },
        { name: 'Dev Agarwal', college: 'IIT Bombay', registeredLabel: '9:18 AM', status: 'Checked In' }
      ],
      collegeBreakdown: [
        { college: 'IIT Delhi', count: 45 },
        { college: 'DTU', count: 38 },
        { college: 'NSUT', count: 31 },
        { college: 'BITS Pilani', count: 24 },
        { college: 'Other', count: 115 }
      ]
    }
  },
  {
    id: 'deep-learning-workshop',
    title: 'Deep Learning Workshop',
    category: 'Workshop',
    banner: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200',
    dateLabel: 'Aug 28, 2025',
    date: '2025-08-28',
    time: '10:00 AM',
    venue: 'NSUT, Room 204',
    online: false,
    registered: 48,
    seatsLeft: 12,
    capacity: 60,
    free: true,
    attending: false,
    organizer: { name: 'AI Society, NSUT', subtitle: 'Verified College Organization', avatarSeed: 'aisociety' },
    description:
      'A hands-on workshop covering neural network fundamentals, CNNs, and transfer learning. Bring a laptop — all exercises run in Google Colab. Best suited for students with basic Python experience.',
    tags: ['AI/ML', 'Python', 'Deep Learning'],
    hostedByMe: false
  },
  {
    id: 'tedx-bits-pilani',
    title: 'TEDx BITS Pilani',
    category: 'Seminar',
    banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200',
    dateLabel: 'Oct 4, 2025',
    date: '2025-10-04',
    time: '2:00 PM',
    venue: 'BITS Pilani, Amphitheatre',
    online: false,
    registered: 366,
    seatsLeft: 134,
    capacity: 500,
    free: true,
    attending: true,
    organizer: { name: 'TEDx Committee, BITS Pilani', subtitle: 'Verified College Organization', avatarSeed: 'tedx' },
    description:
      'An afternoon of ideas worth spreading — a lineup of researchers, founders, and artists sharing stories from their fields. Open to students from all colleges.',
    tags: ['Ideas', 'Talks', 'Community'],
    hostedByMe: false
  },
  {
    id: 'culturama-2025',
    title: 'Culturama 2025',
    category: 'Cultural',
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
    dateLabel: 'Nov 1–3, 2025',
    date: '2025-11-01',
    time: '6:00 PM',
    venue: 'DTU, Open-air Stage',
    online: false,
    registered: 1109,
    seatsLeft: 891,
    capacity: 2000,
    free: true,
    attending: false,
    organizer: { name: 'Cultural Council, DTU', subtitle: 'Verified College Organization', avatarSeed: 'culturama' },
    description:
      "DTU's annual three-day cultural fest — live music, dance battles, street theatre, and pro-night performances. Open-air stage, all three evenings.",
    tags: ['Music', 'Dance', 'Fest'],
    hostedByMe: true,
    dashboard: {
      checkedIn: 512,
      checkInRate: 46,
      daysUntil: 70,
      percentFullOverride: 55,
      attendees: [
        { name: 'Ishaan Kapoor', college: 'DTU', registeredLabel: '2 days ago', status: 'Registered' },
        { name: 'Meera Nair', college: 'IIT Delhi', registeredLabel: '3 days ago', status: 'Registered' },
        { name: 'Aditya Rao', college: 'NSUT', registeredLabel: 'Yesterday', status: 'Registered' }
      ],
      collegeBreakdown: [
        { college: 'DTU', count: 420 },
        { college: 'IIT Delhi', count: 210 },
        { college: 'NSUT', count: 160 },
        { college: 'Other', count: 319 }
      ]
    }
  },
  {
    id: 'icpc-regionals',
    title: 'ICPC Regionals',
    category: 'Competition',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
    dateLabel: 'Sep 22, 2025',
    date: '2025-09-22',
    time: '8:00 AM',
    venue: 'Online + NIT Trichy',
    online: true,
    registered: 317,
    seatsLeft: 83,
    capacity: 400,
    free: true,
    attending: false,
    organizer: { name: 'ACM Chapter, NIT Trichy', subtitle: 'Verified College Organization', avatarSeed: 'icpc' },
    description:
      'Regional qualifiers for the ICPC — competitive programming across algorithms, data structures, and math. Teams of 3. Onsite finalists compete at NIT Trichy; others compete online.',
    tags: ['Competitive Programming', 'Algorithms', 'Teams'],
    hostedByMe: true,
    dashboard: {
      checkedIn: 201,
      checkInRate: 63,
      daysUntil: 30,
      percentFullOverride: 79,
      attendees: [
        { name: 'Vikram Rao', college: 'NIT Trichy', registeredLabel: 'Today', status: 'Checked In' },
        { name: 'Ananya Das', college: 'IIT Madras', registeredLabel: 'Yesterday', status: 'Registered' },
        { name: 'Rohan Mehta', college: 'BITS Pilani', registeredLabel: '2 days ago', status: 'Registered' }
      ],
      collegeBreakdown: [
        { college: 'NIT Trichy', count: 140 },
        { college: 'IIT Madras', count: 70 },
        { college: 'BITS Pilani', count: 50 },
        { college: 'Other', count: 57 }
      ]
    }
  },
  {
    id: 'product-management-bootcamp',
    title: 'Product Management Bootcamp',
    category: 'Workshop',
    banner: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200',
    dateLabel: 'Sep 5–6, 2025',
    date: '2025-09-05',
    time: '9:00 AM',
    venue: 'Online (Zoom)',
    online: true,
    registered: 121,
    seatsLeft: 29,
    capacity: 150,
    free: true,
    attending: false,
    organizer: { name: 'Product Guild', subtitle: 'Verified College Organization', avatarSeed: 'pmguild' },
    description:
      'A two-day intensive on product thinking — problem framing, roadmapping, and stakeholder communication, taught by student PM leads and industry mentors.',
    tags: ['Product Design', 'Strategy', 'Case Studies'],
    hostedByMe: false
  },
  {
    id: 'open-source-sprint',
    title: 'Open Source Contribution Sprint',
    category: 'Hackathon',
    banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    dateLabel: 'Aug 30, 2025',
    date: '2025-08-30',
    time: '11:00 AM',
    venue: 'Online (Discord)',
    online: true,
    registered: 190,
    seatsLeft: 310,
    capacity: 500,
    free: true,
    attending: false,
    organizer: { name: 'Open Source Cell', subtitle: 'Verified College Organization', avatarSeed: 'oss' },
    description:
      'A day-long sprint to land your first pull request. Mentors on standby across web, ML, and systems projects. Great for first-time contributors.',
    tags: ['Open Source', 'Git', 'Mentorship'],
    hostedByMe: false
  },
  {
    id: 'entrepreneurship-summit',
    title: 'Entrepreneurship Summit',
    category: 'Seminar',
    banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    dateLabel: 'Oct 18, 2025',
    date: '2025-10-18',
    time: '10:00 AM',
    venue: 'IIM Ahmedabad',
    online: false,
    registered: 570,
    seatsLeft: 230,
    capacity: 800,
    free: true,
    attending: false,
    organizer: { name: 'E-Cell, IIM Ahmedabad', subtitle: 'Verified College Organization', avatarSeed: 'ecell' },
    description:
      'Founders, VCs, and early operators share how they built and funded their companies, followed by a pitch showcase from student startups.',
    tags: ['Startups', 'Funding', 'Networking'],
    hostedByMe: false
  }
]

export const getEventById = (id) => events.find((e) => e.id === id)
export const getJoinedEvents = () => events.filter((e) => e.attending)
export const getHostedEvents = () => events.filter((e) => e.hostedByMe)
export const getFeaturedEvents = () => events.slice(0, 3)
