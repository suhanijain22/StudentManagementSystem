-- Reference schema (PostgreSQL). Hibernate creates this automatically (ddl-auto=update);
-- run manually only if you prefer to manage the DB yourself (then set ddl-auto=validate).
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    password    VARCHAR(255) NOT NULL,                     -- BCrypt hash
    role        VARCHAR(20)  NOT NULL CHECK (role IN ('STUDENT','TEACHER')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE student_profiles (
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT  NOT NULL,
    points   INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    CONSTRAINT uk_student_user UNIQUE (user_id),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_student_points ON student_profiles (points);

-- Ranking (points DESC, id ASC as deterministic tie-break):
-- SELECT s.id, u.name, s.points, ROW_NUMBER() OVER (ORDER BY s.points DESC, s.id ASC) AS rank
-- FROM student_profiles s JOIN users u ON u.id = s.user_id;
