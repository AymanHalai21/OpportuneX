-- =====================================================================
-- OpportuneX  |  03_seed.sql   (demo data; safe to run again)
-- Demo login:   arjun@iitd.ac.in   /   password123
-- =====================================================================

INSERT IGNORE INTO ox_users (user_id, name, email, password_hash, college, program, year_of_study) VALUES
  (1, 'Arjun Sharma', 'arjun@iitd.ac.in',
   '$2b$10$v.dlCgHF0WzWQ88Ag8BPo.qD.jJeub7Xi8P/yBwblZP5OPjQby12u',
   'IIT Delhi', 'B.Tech Computer Science', '3rd Year'),
  (2, 'Campus Events Team', 'events@opportunex.local',
   '$2b$10$v.dlCgHF0WzWQ88Ag8BPo.qD.jJeub7Xi8P/yBwblZP5OPjQby12u',
   'IIT Delhi', 'Student Affairs', 'Graduate');

INSERT IGNORE INTO ox_badges (badge_id, title, subtitle, emoji, type, event_name, date_earned, has_certificate) VALUES
  (1, 'Hackathon Finisher', 'Completed a campus hackathon', '🏆', 'Achievement', 'HackSphere', 'Sep 2026', 'Y'),
  (2, 'Event Explorer', 'Joined multiple student events', '🧭', 'Milestone', 'OpportuneX', 'Sep 2026', 'N'),
  (3, 'Community Builder', 'Contributed to campus community', '🤝', 'Community', 'Campus Meet', 'Aug 2026', 'Y');

INSERT IGNORE INTO ox_user_badges (user_id, badge_id, xp_points) VALUES (1, 1, 250), (1, 2, 100), (1, 3, 150);

INSERT IGNORE INTO ox_events (event_id, organizer_id, title, category, event_date, date_label, event_time, venue,
                              online_flag, capacity, free_flag, description) VALUES
  (1000, 1, 'HackSphere 2026 - National AI Hackathon', 'Hackathon', '2026-10-12', 'Oct 12–13, 2026',
   '9:00 AM - 6:00 PM', 'IIT Delhi, Dogra Hall', 'N', 500, 'Y',
   'Build practical AI solutions with student teams from across India.'),
  (1001, 2, 'Google Solution Challenge Workshop', 'Workshop', '2026-10-18', 'Oct 18, 2026',
   '10:00 AM - 2:00 PM', 'Online - Google Meet', 'Y', 300, 'Y',
   'Learn how to turn a campus problem into a solution challenge project.'),
  (1002, 2, 'FinTech Build Sprint', 'Competition', '2026-10-25', 'Oct 25, 2026',
   '9:30 AM - 7:00 PM', 'BITS Pilani, Hyderabad Campus', 'N', 250, 'Y',
   'A rapid build competition focused on payments, finance and inclusion.'),
  (1003, 2, 'Design & UI/UX Masterclass', 'Seminar', '2026-11-02', 'Nov 2, 2026',
   '4:00 PM - 6:00 PM', 'VIT Vellore, Design Studio', 'N', 150, 'Y',
   'Hands-on session covering product thinking, accessibility and interface systems.'),
  (1004, 2, 'Microsoft Imagine Cup Prep Day', 'Workshop', '2026-11-08', 'Nov 8, 2026',
   '11:00 AM - 3:00 PM', 'Online - Teams', 'Y', 500, 'Y',
   'Prepare your problem statement, prototype and pitch for Imagine Cup.'),
  (1005, 2, 'Campus Cultural Fest', 'Cultural', '2026-11-15', 'Nov 15, 2026',
   '10:00 AM - 9:00 PM', 'NSUT Delhi, Main Ground', 'N', 1200, 'Y',
   'Music, art, clubs and student performances from partner colleges.');

INSERT IGNORE INTO ox_event_tags (event_id, tag) VALUES
  (1000, 'Hackathon'), (1000, 'AI/ML'), (1000, 'Cash Prizes'), (1000, 'Open Source'),
  (1001, 'Workshop'), (1001, 'Google'), (1001, 'Beginner Friendly'), (1001, 'Cloud Computing'),
  (1002, 'FinTech'), (1002, 'Competition'), (1002, 'Cash Prizes'), (1002, 'Networking'),
  (1003, 'Design & UI'), (1003, 'Seminar'), (1003, 'Beginner Friendly'),
  (1004, 'Microsoft'), (1004, 'Workshop'), (1004, 'AI/ML'), (1004, 'Open Source'),
  (1005, 'Cultural'), (1005, 'Networking'), (1005, 'Campus');

INSERT IGNORE INTO ox_registrations (event_id, user_id, ticket_code) VALUES
  (1000, 2, 'OPX-1000-2-SEED'),
  (1001, 1, 'OPX-1001-1-SEED');

UPDATE ox_events e
   SET registered_count = (SELECT COUNT(*) FROM ox_registrations r
                            WHERE r.event_id = e.event_id AND r.status = 'REGISTERED');
