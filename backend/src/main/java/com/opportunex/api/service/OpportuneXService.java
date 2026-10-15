package com.opportunex.api.service;

import com.opportunex.api.exception.ApiException;
import com.opportunex.api.security.JwtService;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Reads use plain SELECTs. Every write goes through a MySQL stored procedure
 * (see /database/02_procedures.sql) so the business rules live in the database.
 */
@Service
public class OpportuneXService {

    private static final String EVENT_SELECT = """
            SELECT e.event_id, e.organizer_id, e.title, e.category, e.event_date, e.date_label, e.event_time,
                   e.venue, e.online_flag, e.capacity, e.registered_count, e.free_flag, e.description, e.banner,
                   u.name AS organizer_name, u.college AS organizer_college,
                   CASE WHEN r.registration_id IS NOT NULL AND r.status = 'REGISTERED' THEN 1 ELSE 0 END AS attending
              FROM ox_events e
              JOIN ox_users u ON u.user_id = e.organizer_id
              LEFT JOIN ox_registrations r ON r.event_id = e.event_id AND r.user_id = ?
             WHERE e.status = 'ACTIVE'
            """;

    private final JdbcTemplate jdbc;
    private final JwtService jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public OpportuneXService(JdbcTemplate jdbc, JwtService jwt) {
        this.jdbc = jdbc;
        this.jwt = jwt;
    }

    // ---------------------------------------------------------------- users
    private Map<String, Object> userRow(Long id) {
        try {
            return jdbc.queryForObject(
                    "SELECT user_id, name, email, college, program, year_of_study, avatar FROM ox_users WHERE user_id = ?",
                    (rs, n) -> {
                        Map<String, Object> u = new LinkedHashMap<>();
                        u.put("id", rs.getLong("user_id"));
                        u.put("name", rs.getString("name"));
                        u.put("email", rs.getString("email"));
                        u.put("college", rs.getString("college"));
                        u.put("program", rs.getString("program"));
                        u.put("year", rs.getString("year_of_study"));
                        u.put("avatar", rs.getString("avatar"));
                        return u;
                    }, id);
        } catch (EmptyResultDataAccessException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User not found");
        }
    }

    private Map<String, Object> buildUser(Long id) {
        Map<String, Object> u = userRow(id);
        int joined = count("SELECT COUNT(*) FROM ox_registrations WHERE user_id = ? AND status = 'REGISTERED'", id);
        int hosted = count("SELECT COUNT(*) FROM ox_events WHERE organizer_id = ? AND status = 'ACTIVE'", id);
        int badges = count("SELECT COUNT(*) FROM ox_user_badges WHERE user_id = ?", id);
        int xp = count("SELECT COALESCE(SUM(xp_points), 0) FROM ox_user_badges WHERE user_id = ?", id);
        u.put("stats", Map.of("eventsJoined", joined, "eventsHosted", hosted, "badgesEarned", badges, "xpPoints", xp));
        u.put("interests", jdbc.query("SELECT interest FROM ox_interests WHERE user_id = ? ORDER BY interest",
                (rs, n) -> rs.getString(1), id));
        u.put("badges", jdbc.query("""
                SELECT b.badge_id, b.title, b.subtitle, b.emoji, b.type, b.event_name, b.date_earned, b.has_certificate
                  FROM ox_user_badges ub JOIN ox_badges b ON b.badge_id = ub.badge_id
                 WHERE ub.user_id = ? ORDER BY ub.date_created DESC, b.badge_id
                """, (rs, n) -> {
            Map<String, Object> b = new LinkedHashMap<>();
            b.put("id", rs.getLong("badge_id"));
            b.put("title", rs.getString("title"));
            b.put("subtitle", rs.getString("subtitle"));
            b.put("emoji", rs.getString("emoji"));
            b.put("type", rs.getString("type"));
            b.put("event", rs.getString("event_name"));
            b.put("dateEarned", rs.getString("date_earned"));
            b.put("hasCertificate", "Y".equals(rs.getString("has_certificate")));
            return b;
        }, id));
        return u;
    }

    private int count(String sql, Object... args) {
        Integer n = jdbc.queryForObject(sql, Integer.class, args);
        return n == null ? 0 : n;
    }

    public Map<String, Object> login(String email, String password) {
        if (isBlank(email) || isBlank(password)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please enter your email and password");
        }
        Map<String, Object> row;
        try {
            row = jdbc.queryForMap(
                    "SELECT user_id, password_hash FROM ox_users WHERE email = LOWER(TRIM(?)) AND active = 'Y'", email);
        } catch (EmptyResultDataAccessException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        Long id = ((Number) row.get("user_id")).longValue();
        if (!encoder.matches(password, (String) row.get("password_hash"))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        jdbc.update("UPDATE ox_users SET last_login = NOW() WHERE user_id = ?", id);
        return Map.of("token", jwt.generate(id, email.trim().toLowerCase()), "user", buildUser(id));
    }

    public Map<String, Object> signup(String name, String email, String password, String college) {
        if (isBlank(name) || isBlank(email)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Name and email are required");
        }
        if (password == null || password.length() < 6) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters long");
        }
        String hash = encoder.encode(password);
        Long id = call("{call ox_create_user(?,?,?,?,?)}", cs -> {
            cs.setString(1, name);
            cs.setString(2, email);
            cs.setString(3, hash);
            cs.setString(4, college);
            cs.registerOutParameter(5, Types.BIGINT);
        }, cs -> cs.getLong(5));
        return Map.of("token", jwt.generate(id, email.trim().toLowerCase()), "user", buildUser(id));
    }

    public Map<String, Object> getMe(Long id) {
        return buildUser(id);
    }

    // --------------------------------------------------------------- events
    public List<Map<String, Object>> events(Long userId) {
        Map<Long, List<String>> tags = tagsByEvent(null);
        return jdbc.query(EVENT_SELECT + " ORDER BY e.event_date ASC, e.event_id DESC",
                (rs, n) -> eventMap(rs, userId, tags), userId);
    }

    public Map<String, Object> event(Long userId, Long eventId) {
        Map<Long, List<String>> tags = tagsByEvent(eventId);
        List<Map<String, Object>> rows = jdbc.query(EVENT_SELECT + " AND e.event_id = ?",
                (rs, n) -> eventMap(rs, userId, tags), userId, eventId);
        if (rows.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Event not found");
        }
        return rows.get(0);
    }

    private Map<Long, List<String>> tagsByEvent(Long onlyEvent) {
        Map<Long, List<String>> map = new LinkedHashMap<>();
        String sql = onlyEvent == null
                ? "SELECT event_id, tag FROM ox_event_tags ORDER BY tag_id"
                : "SELECT event_id, tag FROM ox_event_tags WHERE event_id = ? ORDER BY tag_id";
        RowHandler handler = new RowHandler(map);
        if (onlyEvent == null) {
            jdbc.query(sql, handler);
        } else {
            jdbc.query(sql, handler, onlyEvent);
        }
        return map;
    }

    private static final class RowHandler implements org.springframework.jdbc.core.RowCallbackHandler {
        private final Map<Long, List<String>> target;

        RowHandler(Map<Long, List<String>> target) {
            this.target = target;
        }

        @Override
        public void processRow(ResultSet rs) throws SQLException {
            target.computeIfAbsent(rs.getLong("event_id"), k -> new ArrayList<>()).add(rs.getString("tag"));
        }
    }

    private Map<String, Object> eventMap(ResultSet rs, Long currentUserId, Map<Long, List<String>> tags) throws SQLException {
        Map<String, Object> e = new LinkedHashMap<>();
        long id = rs.getLong("event_id");
        int capacity = rs.getInt("capacity");
        int registered = rs.getInt("registered_count");
        String college = rs.getString("organizer_college");
        e.put("id", String.valueOf(id));
        e.put("dbId", id);
        e.put("title", rs.getString("title"));
        e.put("category", rs.getString("category"));
        e.put("date", rs.getDate("event_date").toLocalDate().toString());
        e.put("dateLabel", rs.getString("date_label"));
        e.put("time", rs.getString("event_time"));
        e.put("venue", rs.getString("venue"));
        e.put("online", "Y".equals(rs.getString("online_flag")));
        e.put("registered", registered);
        e.put("capacity", capacity);
        e.put("seatsLeft", Math.max(capacity - registered, 0));
        e.put("free", "Y".equals(rs.getString("free_flag")));
        e.put("description", rs.getString("description"));
        e.put("banner", rs.getString("banner"));
        e.put("image", rs.getString("banner"));
        e.put("tags", tags.getOrDefault(id, List.of()));
        Map<String, Object> org = new LinkedHashMap<>();
        org.put("name", rs.getString("organizer_name"));
        org.put("subtitle", (college == null ? "Campus" : college) + " Verified Organizer");
        org.put("avatarSeed", "organizer-" + id);
        e.put("organizer", org);
        e.put("attending", rs.getInt("attending") == 1);
        e.put("hostedByMe", Objects.equals(rs.getLong("organizer_id"), currentUserId));
        return e;
    }

    public void join(Long userId, Long eventId) {
        call("{call ox_toggle_registration(?,?,?)}", cs -> {
            cs.setLong(1, userId);
            cs.setLong(2, eventId);
            cs.registerOutParameter(3, Types.VARCHAR);
        }, cs -> cs.getString(3));
    }

    public List<String> follows(Long userId) {
        return jdbc.query(
                "SELECT u.name FROM ox_follows f JOIN ox_users u ON u.user_id = f.organizer_id WHERE f.follower_id = ? ORDER BY u.name",
                (rs, n) -> rs.getString(1), userId);
    }

    public void follow(Long userId, String organizer) {
        List<Long> ids = jdbc.query("SELECT user_id FROM ox_users WHERE name = ? ORDER BY user_id LIMIT 1",
                (rs, n) -> rs.getLong(1), organizer);
        if (ids.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Organizer not found");
        }
        Long organizerId = ids.get(0);
        call("{call ox_toggle_follow(?,?,?)}", cs -> {
            cs.setLong(1, userId);
            cs.setLong(2, organizerId);
            cs.registerOutParameter(3, Types.VARCHAR);
        }, cs -> cs.getString(3));
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> createEvent(Long userId, Map<String, Object> body) {
        String title = str(body.get("title"));
        String category = str(body.get("category"));
        LocalDate date = parseDate(str(body.get("date")), LocalDate.now().plusDays(14));
        String dateLabel = str(body.get("dateLabel"));
        String time = str(body.get("time"));
        String venue = str(body.get("venue"));
        int capacity = intOf(body.get("capacity"), 100);
        boolean free = !Boolean.FALSE.equals(body.get("free"));
        boolean online = Boolean.TRUE.equals(body.get("online"));
        String description = str(body.get("description"));
        List<String> tagList = body.get("tags") instanceof List<?> l ? (List<String>) l : List.of();
        String tags = String.join(",", tagList);

        Long id = call("{call ox_create_event(?,?,?,?,?,?,?,?,?,?,?,?,?)}", cs -> {
            cs.setLong(1, userId);
            cs.setString(2, title);
            cs.setString(3, category);
            cs.setDate(4, java.sql.Date.valueOf(date));
            cs.setString(5, dateLabel);
            cs.setString(6, time);
            cs.setString(7, venue);
            cs.setString(8, online ? "Y" : "N");
            cs.setInt(9, capacity);
            cs.setString(10, free ? "Y" : "N");
            cs.setString(11, description);
            cs.setString(12, tags);
            cs.registerOutParameter(13, Types.BIGINT);
        }, cs -> cs.getLong(13));
        return event(userId, id);
    }

    @SuppressWarnings("unchecked")
    public void updateEvent(Long userId, Long eventId, Map<String, Object> b) {
        String dateText = str(b.get("date"));
        LocalDate date = isBlank(dateText) ? null : parseDate(dateText, null);
        Integer capacity = b.get("capacity") == null ? null : intOf(b.get("capacity"), 0);
        // tags are only replaced when the request actually contains a tags list
        String tags = b.get("tags") instanceof List<?> l ? String.join(",", (List<String>) l) : null;

        call("{call ox_update_event(?,?,?,?,?,?,?,?,?,?,?)}", cs -> {
            cs.setLong(1, eventId);
            cs.setLong(2, userId);
            cs.setString(3, str(b.get("title")));
            cs.setString(4, str(b.get("category")));
            if (date == null) {
                cs.setNull(5, Types.DATE);
            } else {
                cs.setDate(5, java.sql.Date.valueOf(date));
            }
            cs.setString(6, str(b.get("dateLabel")));
            cs.setString(7, str(b.get("time")));
            cs.setString(8, str(b.get("venue")));
            if (capacity == null) {
                cs.setNull(9, Types.INTEGER);
            } else {
                cs.setInt(9, capacity);
            }
            cs.setString(10, str(b.get("description")));
            cs.setString(11, tags);
        }, cs -> null);
    }

    public void cancelEvent(Long userId, Long eventId) {
        call("{call ox_cancel_event(?,?)}", cs -> {
            cs.setLong(1, eventId);
            cs.setLong(2, userId);
        }, cs -> null);
    }

    public void updateProfile(Long userId, Map<String, Object> b) {
        call("{call ox_update_profile(?,?,?,?,?,?)}", cs -> {
            cs.setLong(1, userId);
            cs.setString(2, str(b.get("name")));
            cs.setString(3, str(b.get("email")));
            cs.setString(4, str(b.get("college")));
            cs.setString(5, str(b.get("program")));
            cs.setString(6, str(b.get("year")));
        }, cs -> null);
    }

    public void addInterest(Long userId, String interest) {
        call("{call ox_add_interest(?,?)}", cs -> {
            cs.setLong(1, userId);
            cs.setString(2, interest);
        }, cs -> null);
    }

    public void removeInterest(Long userId, String interest) {
        call("{call ox_remove_interest(?,?)}", cs -> {
            cs.setLong(1, userId);
            cs.setString(2, interest);
        }, cs -> null);
    }

    public void checkIn(Long userId, Long eventId, String studentName, String ticketCode) {
        call("{call ox_checkin_ticket(?,?,?,?)}", cs -> {
            cs.setLong(1, userId);
            cs.setLong(2, eventId);
            cs.setString(3, studentName);
            cs.setString(4, ticketCode);
        }, cs -> null);
    }

    public void toggleAttendee(Long userId, Long eventId, String studentName) {
        call("{call ox_toggle_attendee(?,?,?)}", cs -> {
            cs.setLong(1, userId);
            cs.setLong(2, eventId);
            cs.setString(3, studentName);
        }, cs -> null);
    }

    public Map<String, Object> dashboard(Long userId, Long eventId) {
        Map<String, Object> e = event(userId, eventId);
        if (!Boolean.TRUE.equals(e.get("hostedByMe"))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the event organizer can open the dashboard");
        }
        List<Map<String, Object>> attendees = jdbc.query("""
                SELECT u.name, u.college,
                       DATE_FORMAT(r.registered_at, '%b %d, %Y %h:%i %p') AS registered_label,
                       CASE WHEN r.checked_in = 'Y' THEN 'Checked In' ELSE 'Registered' END AS status
                  FROM ox_registrations r JOIN ox_users u ON u.user_id = r.user_id
                 WHERE r.event_id = ? AND r.status = 'REGISTERED'
                 ORDER BY r.registered_at DESC, r.registration_id DESC
                """, (rs, n) -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("name", rs.getString("name"));
            a.put("college", rs.getString("college"));
            a.put("registeredLabel", rs.getString("registered_label"));
            a.put("status", rs.getString("status"));
            return a;
        }, eventId);
        int checked = (int) attendees.stream().filter(a -> "Checked In".equals(a.get("status"))).count();
        Map<String, Integer> breakdown = new LinkedHashMap<>();
        attendees.forEach(a -> breakdown.merge(String.valueOf(a.get("college")), 1, Integer::sum));
        List<Map<String, Object>> college = new ArrayList<>();
        breakdown.forEach((name, cnt) -> college.add(Map.<String, Object>of("college", name, "count", cnt)));
        Map<String, Object> dash = new LinkedHashMap<>();
        dash.put("attendees", attendees);
        dash.put("checkedIn", checked);
        dash.put("checkInRate", attendees.isEmpty() ? 0 : Math.round(checked * 100f / attendees.size()));
        dash.put("collegeBreakdown", college);
        e.put("dashboard", dash);
        return e;
    }

    // -------------------------------------------------------------- helpers
    @FunctionalInterface
    private interface Binder {
        void bind(CallableStatement cs) throws SQLException;
    }

    @FunctionalInterface
    private interface Reader<T> {
        T read(CallableStatement cs) throws SQLException;
    }

    /** Calls a stored procedure: bind IN/OUT parameters, execute, then read OUT values. */
    private <T> T call(String sql, Binder binder, Reader<T> reader) {
        return jdbc.execute((ConnectionCallback<T>) con -> {
            try (CallableStatement cs = con.prepareCall(sql)) {
                binder.bind(cs);
                cs.execute();
                return reader.read(cs);
            }
        });
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static int intOf(Object o, int fallback) {
        if (o instanceof Number n) {
            return n.intValue();
        }
        try {
            return o == null ? fallback : Integer.parseInt(String.valueOf(o).trim());
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Capacity must be a number");
        }
    }

    private static LocalDate parseDate(String text, LocalDate fallback) {
        if (isBlank(text)) {
            return fallback;
        }
        try {
            return LocalDate.parse(text.trim().substring(0, Math.min(10, text.trim().length())));
        } catch (DateTimeParseException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Date must be in YYYY-MM-DD format");
        }
    }
}
