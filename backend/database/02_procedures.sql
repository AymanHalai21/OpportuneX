-- =====================================================================
-- OpportuneX  |  02_procedures.sql   (MySQL stored procedures = the "PL/SQL" layer)
-- All business rules live here; Spring Boot only calls these procedures.
--
-- Errors are raised with SIGNAL.  SQLSTATE tells Spring which HTTP code to send:
--   45001 not found (404) | 45002 conflict (409) | 45003 invalid input (400)
--   45004 forbidden (403) | 45005 event full (409)
--
-- Works in the mysql client, MySQL Workbench and the Spring Boot start-up runner.
-- =====================================================================

DELIMITER $$

-- ---------------------------------------------------------------- tags helper
DROP PROCEDURE IF EXISTS ox_save_tags$$
CREATE PROCEDURE ox_save_tags(IN p_event BIGINT, IN p_tags TEXT)
BEGIN
  DECLARE v_rest TEXT;
  DECLARE v_tag  VARCHAR(255);
  DECLARE v_pos  INT;

  DELETE FROM ox_event_tags WHERE event_id = p_event;

  SET v_rest = CONCAT(IFNULL(p_tags, ''), ',');
  SET v_pos  = LOCATE(',', v_rest);
  WHILE v_pos > 0 DO
    SET v_tag  = TRIM(SUBSTRING(v_rest, 1, v_pos - 1));
    SET v_rest = SUBSTRING(v_rest, v_pos + 1);
    IF v_tag <> '' THEN
      INSERT IGNORE INTO ox_event_tags (event_id, tag) VALUES (p_event, LEFT(v_tag, 80));
    END IF;
    SET v_pos = LOCATE(',', v_rest);
  END WHILE;
END$$

-- ---------------------------------------------------------------- users
DROP PROCEDURE IF EXISTS ox_create_user$$
CREATE PROCEDURE ox_create_user(IN p_name VARCHAR(120), IN p_email VARCHAR(180),
                                IN p_hash VARCHAR(100), IN p_college VARCHAR(180),
                                OUT p_id BIGINT)
BEGIN
  DECLARE EXIT HANDLER FOR 1062
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'An account with this email already exists.';

  IF p_name IS NULL OR TRIM(p_name) = '' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Full name is required.';
  END IF;
  IF p_email IS NULL OR LOCATE('@', p_email) = 0 THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Please enter a valid email address.';
  END IF;
  IF p_hash IS NULL OR p_hash = '' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Password is required.';
  END IF;

  INSERT INTO ox_users (name, email, password_hash, college)
  VALUES (TRIM(p_name), LOWER(TRIM(p_email)), p_hash, NULLIF(TRIM(p_college), ''));
  SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS ox_update_profile$$
CREATE PROCEDURE ox_update_profile(IN p_user BIGINT, IN p_name VARCHAR(120), IN p_email VARCHAR(180),
                                   IN p_college VARCHAR(180), IN p_program VARCHAR(120),
                                   IN p_year VARCHAR(40))
BEGIN
  DECLARE v_count INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR 1062
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'That email is already in use.';

  SELECT COUNT(*) INTO v_count FROM ox_users WHERE user_id = p_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'User not found.';
  END IF;
  IF p_email IS NOT NULL AND TRIM(p_email) <> '' AND LOCATE('@', p_email) = 0 THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Please enter a valid email address.';
  END IF;

  UPDATE ox_users
     SET name          = COALESCE(NULLIF(TRIM(p_name), ''), name),
         email         = COALESCE(NULLIF(LOWER(TRIM(p_email)), ''), email),
         college       = COALESCE(NULLIF(TRIM(p_college), ''), college),
         program       = COALESCE(NULLIF(TRIM(p_program), ''), program),
         year_of_study = COALESCE(NULLIF(TRIM(p_year), ''), year_of_study)
   WHERE user_id = p_user;
END$$

DROP PROCEDURE IF EXISTS ox_add_interest$$
CREATE PROCEDURE ox_add_interest(IN p_user BIGINT, IN p_interest VARCHAR(100))
BEGIN
  DECLARE EXIT HANDLER FOR 1452
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'User not found.';

  IF p_interest IS NULL OR TRIM(p_interest) = '' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Interest cannot be empty.';
  END IF;
  INSERT IGNORE INTO ox_interests (user_id, interest) VALUES (p_user, LEFT(TRIM(p_interest), 100));
END$$

DROP PROCEDURE IF EXISTS ox_remove_interest$$
CREATE PROCEDURE ox_remove_interest(IN p_user BIGINT, IN p_interest VARCHAR(100))
BEGIN
  DELETE FROM ox_interests WHERE user_id = p_user AND interest = TRIM(p_interest);
END$$

DROP PROCEDURE IF EXISTS ox_toggle_follow$$
CREATE PROCEDURE ox_toggle_follow(IN p_user BIGINT, IN p_org BIGINT, OUT p_status VARCHAR(20))
BEGIN
  DECLARE v_count INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR 1452
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'User or organizer not found.';

  SELECT COUNT(*) INTO v_count FROM ox_follows WHERE follower_id = p_user AND organizer_id = p_org;
  IF v_count > 0 THEN
    DELETE FROM ox_follows WHERE follower_id = p_user AND organizer_id = p_org;
    SET p_status = 'UNFOLLOWED';
  ELSE
    INSERT INTO ox_follows (follower_id, organizer_id) VALUES (p_user, p_org);
    SET p_status = 'FOLLOWED';
  END IF;
END$$

-- ---------------------------------------------------------------- events
DROP PROCEDURE IF EXISTS ox_create_event$$
CREATE PROCEDURE ox_create_event(IN p_org BIGINT, IN p_title VARCHAR(200), IN p_category VARCHAR(50),
                                 IN p_date DATE, IN p_date_label VARCHAR(100), IN p_time VARCHAR(100),
                                 IN p_venue VARCHAR(250), IN p_online CHAR(1), IN p_capacity INT,
                                 IN p_free CHAR(1), IN p_description TEXT, IN p_tags TEXT,
                                 OUT p_id BIGINT)
BEGIN
  DECLARE EXIT HANDLER FOR 1452
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Organizer account not found.';
  END;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  IF p_title IS NULL OR TRIM(p_title) = '' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Event title is required.';
  END IF;
  IF p_date IS NULL THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Event date is required.';
  END IF;
  IF p_capacity IS NULL OR p_capacity < 1 THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Capacity must be at least 1.';
  END IF;

  START TRANSACTION;
  INSERT INTO ox_events (organizer_id, title, category, event_date, date_label, event_time, venue,
                         online_flag, capacity, free_flag, description)
  VALUES (p_org, TRIM(p_title), COALESCE(NULLIF(TRIM(p_category), ''), 'Hackathon'), p_date,
          COALESCE(NULLIF(TRIM(p_date_label), ''), DATE_FORMAT(p_date, '%b %e, %Y')),
          COALESCE(NULLIF(TRIM(p_time), ''), '10:00 AM'),
          COALESCE(NULLIF(TRIM(p_venue), ''), 'Campus Auditorium'),
          IF(p_online = 'Y', 'Y', 'N'), p_capacity, IF(p_free = 'N', 'N', 'Y'),
          COALESCE(NULLIF(TRIM(p_description), ''), 'No description provided.'));
  SET p_id = LAST_INSERT_ID();
  CALL ox_save_tags(p_id, p_tags);
  COMMIT;
END$$

DROP PROCEDURE IF EXISTS ox_update_event$$
CREATE PROCEDURE ox_update_event(IN p_event BIGINT, IN p_org BIGINT, IN p_title VARCHAR(200),
                                 IN p_category VARCHAR(50), IN p_date DATE, IN p_date_label VARCHAR(100),
                                 IN p_time VARCHAR(100), IN p_venue VARCHAR(250), IN p_capacity INT,
                                 IN p_description TEXT, IN p_tags TEXT)
BEGIN
  DECLARE v_count      INT DEFAULT 0;
  DECLARE v_registered INT DEFAULT 0;
  DECLARE v_msg        VARCHAR(200);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  SELECT COUNT(*), IFNULL(MAX(registered_count), 0) INTO v_count, v_registered
    FROM ox_events
   WHERE event_id = p_event AND organizer_id = p_org AND status = 'ACTIVE'
     FOR UPDATE;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'Event not found or you are not the organizer.';
  END IF;
  IF p_capacity IS NOT NULL AND p_capacity < 1 THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Capacity must be at least 1.';
  END IF;
  IF p_capacity IS NOT NULL AND p_capacity < v_registered THEN
    SET v_msg = CONCAT('Capacity cannot be lower than the ', v_registered, ' people already registered.');
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = v_msg;
  END IF;

  UPDATE ox_events
     SET title       = COALESCE(NULLIF(TRIM(p_title), ''), title),
         category    = COALESCE(NULLIF(TRIM(p_category), ''), category),
         date_label  = COALESCE(NULLIF(TRIM(p_date_label), ''),
                                IF(p_date IS NOT NULL AND p_date <> event_date,
                                   DATE_FORMAT(p_date, '%b %e, %Y'), date_label)),
         event_date  = COALESCE(p_date, event_date),
         event_time  = COALESCE(NULLIF(TRIM(p_time), ''), event_time),
         venue       = COALESCE(NULLIF(TRIM(p_venue), ''), venue),
         capacity    = COALESCE(p_capacity, capacity),
         description = COALESCE(p_description, description)
   WHERE event_id = p_event;

  IF p_tags IS NOT NULL THEN
    CALL ox_save_tags(p_event, p_tags);
  END IF;
  COMMIT;
END$$

DROP PROCEDURE IF EXISTS ox_cancel_event$$
CREATE PROCEDURE ox_cancel_event(IN p_event BIGINT, IN p_org BIGINT)
BEGIN
  DECLARE v_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_count
    FROM ox_events WHERE event_id = p_event AND organizer_id = p_org AND status = 'ACTIVE';
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'Event not found or you are not the organizer.';
  END IF;
  UPDATE ox_events SET status = 'CANCELLED' WHERE event_id = p_event;
END$$

-- ------------------------------------------------- registration / check-in
-- Joins the event, or leaves it when already registered. Seat limit is enforced
-- under a row lock so two students can never take the last seat together.
DROP PROCEDURE IF EXISTS ox_toggle_registration$$
CREATE PROCEDURE ox_toggle_registration(IN p_user BIGINT, IN p_event BIGINT, OUT p_status VARCHAR(20))
BEGIN
  DECLARE v_capacity   INT DEFAULT 0;
  DECLARE v_registered INT DEFAULT 0;
  DECLARE v_reg_id     BIGINT DEFAULT NULL;
  DECLARE v_reg_status VARCHAR(20) DEFAULT NULL;
  DECLARE v_found      INT DEFAULT 1;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_found = 0;
  DECLARE EXIT HANDLER FOR 1452
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'User not found.';
  END;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT capacity, registered_count INTO v_capacity, v_registered
    FROM ox_events
   WHERE event_id = p_event AND status = 'ACTIVE'
     FOR UPDATE;
  IF v_found = 0 THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Event not found.';
  END IF;

  SET v_found = 1;
  SELECT registration_id, status INTO v_reg_id, v_reg_status
    FROM ox_registrations
   WHERE event_id = p_event AND user_id = p_user
     FOR UPDATE;

  IF v_found = 1 AND v_reg_status = 'REGISTERED' THEN
    UPDATE ox_registrations SET status = 'CANCELLED', checked_in = 'N' WHERE registration_id = v_reg_id;
    UPDATE ox_events SET registered_count = GREATEST(registered_count - 1, 0) WHERE event_id = p_event;
    SET p_status = 'CANCELLED';
  ELSE
    IF v_registered >= v_capacity THEN
      SIGNAL SQLSTATE '45005' SET MESSAGE_TEXT = 'This event is full.';
    END IF;
    IF v_found = 1 THEN
      UPDATE ox_registrations
         SET status = 'REGISTERED', checked_in = 'N', registered_at = NOW()
       WHERE registration_id = v_reg_id;
    ELSE
      INSERT INTO ox_registrations (event_id, user_id, ticket_code)
      VALUES (p_event, p_user,
              CONCAT('OPX-', p_event, '-', p_user, '-', DATE_FORMAT(NOW(3), '%Y%m%d%H%i%s%f')));
    END IF;
    UPDATE ox_events SET registered_count = registered_count + 1 WHERE event_id = p_event;
    SET p_status = 'REGISTERED';
  END IF;

  COMMIT;
END$$

-- Scan a ticket code (or type the student's name) at the door.
DROP PROCEDURE IF EXISTS ox_checkin_ticket$$
CREATE PROCEDURE ox_checkin_ticket(IN p_org BIGINT, IN p_event BIGINT,
                                   IN p_student_name VARCHAR(120), IN p_ticket VARCHAR(100))
BEGIN
  DECLARE v_count INT DEFAULT 0;
  DECLARE v_reg   BIGINT DEFAULT NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_reg = NULL;

  SELECT COUNT(*) INTO v_count
    FROM ox_events WHERE event_id = p_event AND organizer_id = p_org AND status = 'ACTIVE';
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'Only the event organizer can check in attendees.';
  END IF;

  SELECT r.registration_id INTO v_reg
    FROM ox_registrations r
    JOIN ox_users u ON u.user_id = r.user_id
   WHERE r.event_id = p_event
     AND r.status = 'REGISTERED'
     AND ((p_ticket IS NOT NULL AND p_ticket <> '' AND r.ticket_code = p_ticket)
          OR (p_student_name IS NOT NULL AND LOWER(u.name) = LOWER(p_student_name)))
   ORDER BY IF(r.ticket_code = p_ticket, 0, 1)
   LIMIT 1;

  IF v_reg IS NULL THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'No matching registration found.';
  END IF;
  UPDATE ox_registrations SET checked_in = 'Y' WHERE registration_id = v_reg;
END$$

-- Organizer ticks / unticks one attendee in the dashboard table.
DROP PROCEDURE IF EXISTS ox_toggle_attendee$$
CREATE PROCEDURE ox_toggle_attendee(IN p_org BIGINT, IN p_event BIGINT, IN p_student_name VARCHAR(120))
BEGIN
  DECLARE v_count INT DEFAULT 0;
  DECLARE v_reg   BIGINT DEFAULT NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_reg = NULL;

  SELECT COUNT(*) INTO v_count
    FROM ox_events WHERE event_id = p_event AND organizer_id = p_org AND status = 'ACTIVE';
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'Only the event organizer can update check-in status.';
  END IF;

  SELECT r.registration_id INTO v_reg
    FROM ox_registrations r
    JOIN ox_users u ON u.user_id = r.user_id
   WHERE r.event_id = p_event
     AND r.status = 'REGISTERED'
     AND p_student_name IS NOT NULL
     AND LOWER(u.name) = LOWER(p_student_name)
   LIMIT 1;

  IF v_reg IS NULL THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Attendee not found.';
  END IF;
  UPDATE ox_registrations
     SET checked_in = IF(checked_in = 'Y', 'N', 'Y')
   WHERE registration_id = v_reg;
END$$

DELIMITER ;
