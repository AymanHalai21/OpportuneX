-- =====================================================================
-- OpportuneX  |  01_schema.sql   (MySQL 8.0+ / MariaDB 10.5+)
-- Tables only. Safe to run many times (CREATE TABLE IF NOT EXISTS).
-- Create the database first:
--   CREATE DATABASE opportunex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- =====================================================================

CREATE TABLE IF NOT EXISTS ox_users (
  user_id        BIGINT       NOT NULL AUTO_INCREMENT,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(180) NOT NULL,
  password_hash  VARCHAR(100) NOT NULL,
  college        VARCHAR(180) NULL,
  program        VARCHAR(120) NULL,
  year_of_study  VARCHAR(40)  NULL DEFAULT '3rd Year',
  avatar         VARCHAR(500) NULL,
  active         CHAR(1)      NOT NULL DEFAULT 'Y',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login     DATETIME     NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_ox_users_email (email),
  CONSTRAINT ck_ox_users_active CHECK (active IN ('Y','N'))
) ENGINE=InnoDB AUTO_INCREMENT=100;

CREATE TABLE IF NOT EXISTS ox_events (
  event_id          BIGINT       NOT NULL AUTO_INCREMENT,
  organizer_id      BIGINT       NOT NULL,
  title             VARCHAR(200) NOT NULL,
  category          VARCHAR(50)  NOT NULL,
  event_date        DATE         NOT NULL,
  date_label        VARCHAR(100) NOT NULL,
  event_time        VARCHAR(100) NOT NULL,
  venue             VARCHAR(250) NOT NULL,
  online_flag       CHAR(1)      NOT NULL DEFAULT 'N',
  capacity          INT          NOT NULL,
  registered_count  INT          NOT NULL DEFAULT 0,
  free_flag         CHAR(1)      NOT NULL DEFAULT 'Y',
  description       TEXT         NULL,
  banner            VARCHAR(500) NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  KEY ix_ox_events_date (event_date),
  KEY ix_ox_events_org (organizer_id),
  CONSTRAINT fk_ox_events_org FOREIGN KEY (organizer_id) REFERENCES ox_users (user_id),
  CONSTRAINT ck_ox_events_online CHECK (online_flag IN ('Y','N')),
  CONSTRAINT ck_ox_events_free CHECK (free_flag IN ('Y','N')),
  CONSTRAINT ck_ox_events_capacity CHECK (capacity >= 1),
  CONSTRAINT ck_ox_events_status CHECK (status IN ('ACTIVE','CANCELLED'))
) ENGINE=InnoDB AUTO_INCREMENT=2000;

CREATE TABLE IF NOT EXISTS ox_event_tags (
  tag_id    BIGINT      NOT NULL AUTO_INCREMENT,
  event_id  BIGINT      NOT NULL,
  tag       VARCHAR(80) NOT NULL,
  PRIMARY KEY (tag_id),
  UNIQUE KEY uq_ox_event_tag (event_id, tag),
  CONSTRAINT fk_ox_tags_event FOREIGN KEY (event_id) REFERENCES ox_events (event_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ox_registrations (
  registration_id  BIGINT       NOT NULL AUTO_INCREMENT,
  event_id         BIGINT       NOT NULL,
  user_id          BIGINT       NOT NULL,
  status           VARCHAR(20)  NOT NULL DEFAULT 'REGISTERED',
  checked_in       CHAR(1)      NOT NULL DEFAULT 'N',
  ticket_code      VARCHAR(100) NULL,
  registered_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (registration_id),
  UNIQUE KEY uq_ox_reg_event_user (event_id, user_id),
  UNIQUE KEY uq_ox_reg_ticket (ticket_code),
  KEY ix_ox_reg_user (user_id),
  CONSTRAINT fk_ox_reg_event FOREIGN KEY (event_id) REFERENCES ox_events (event_id) ON DELETE CASCADE,
  CONSTRAINT fk_ox_reg_user FOREIGN KEY (user_id) REFERENCES ox_users (user_id) ON DELETE CASCADE,
  CONSTRAINT ck_ox_reg_status CHECK (status IN ('REGISTERED','CANCELLED')),
  CONSTRAINT ck_ox_reg_checked CHECK (checked_in IN ('Y','N'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ox_follows (
  follower_id   BIGINT   NOT NULL,
  organizer_id  BIGINT   NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, organizer_id),
  KEY ix_ox_follows_org (organizer_id),
  CONSTRAINT fk_ox_follows_follower FOREIGN KEY (follower_id) REFERENCES ox_users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_ox_follows_org FOREIGN KEY (organizer_id) REFERENCES ox_users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ox_interests (
  user_id     BIGINT       NOT NULL,
  interest    VARCHAR(100) NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, interest),
  CONSTRAINT fk_ox_interests_user FOREIGN KEY (user_id) REFERENCES ox_users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ox_badges (
  badge_id         BIGINT       NOT NULL AUTO_INCREMENT,
  title            VARCHAR(150) NOT NULL,
  subtitle         VARCHAR(250) NULL,
  emoji            VARCHAR(20)  NULL,
  type             VARCHAR(50)  NULL,
  event_name       VARCHAR(200) NULL,
  date_earned      VARCHAR(80)  NULL,
  has_certificate  CHAR(1)      NOT NULL DEFAULT 'N',
  PRIMARY KEY (badge_id),
  CONSTRAINT ck_ox_badges_cert CHECK (has_certificate IN ('Y','N'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ox_user_badges (
  user_id       BIGINT   NOT NULL,
  badge_id      BIGINT   NOT NULL,
  xp_points     INT      NOT NULL DEFAULT 0,
  date_created  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  KEY ix_ox_user_badges_badge (badge_id),
  CONSTRAINT fk_ox_ub_user FOREIGN KEY (user_id) REFERENCES ox_users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_ox_ub_badge FOREIGN KEY (badge_id) REFERENCES ox_badges (badge_id)
) ENGINE=InnoDB;
