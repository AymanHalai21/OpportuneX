-- =====================================================================
-- OpportuneX  |  04_triggers.sql
-- Safety nets at database level. The app works without them; if your host does
-- not allow CREATE TRIGGER (error 1419 on binary-logged servers) the Spring Boot
-- runner just logs a warning and continues.
-- =====================================================================

DELIMITER $$

-- A ticket code is always present, even when a row is inserted by hand.
DROP TRIGGER IF EXISTS ox_reg_ticket_trg$$
CREATE TRIGGER ox_reg_ticket_trg BEFORE INSERT ON ox_registrations
FOR EACH ROW
BEGIN
  IF NEW.ticket_code IS NULL THEN
    SET NEW.ticket_code = CONCAT('OPX-', NEW.event_id, '-', NEW.user_id, '-',
                                 DATE_FORMAT(NOW(3), '%Y%m%d%H%i%s%f'));
  END IF;
END$$

-- Capacity can never drop below the number of seats already taken.
DROP TRIGGER IF EXISTS ox_events_capacity_trg$$
CREATE TRIGGER ox_events_capacity_trg BEFORE UPDATE ON ox_events
FOR EACH ROW
BEGIN
  IF NEW.capacity < NEW.registered_count THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Capacity cannot be lower than registered seats.';
  END IF;
END$$

DELIMITER ;
