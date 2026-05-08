-- Create academic tables for academic-ms microservice

CREATE TABLE classrooms (
    id_classroom SERIAL PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    capacity INTEGER
);

CREATE TABLE study_plans (
    id_plan SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL
);

CREATE TABLE shifts (
    id_shift SERIAL PRIMARY KEY,
    shift_name VARCHAR(50) NOT NULL
);

CREATE TABLE school_cycle (
    id_cycle SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE majors (
    id_major SERIAL PRIMARY KEY,
    major_name VARCHAR(100) NOT NULL
);

CREATE TABLE grades (
    id_grade SERIAL PRIMARY KEY,
    grade_name VARCHAR(50) NOT NULL,
    id_major INTEGER REFERENCES majors(id_major)
);

CREATE TABLE sections (
    id_section SERIAL PRIMARY KEY,
    section_name CHAR(1) NOT NULL
);

CREATE TABLE courses (
    id_course SERIAL PRIMARY KEY,
    course_code VARCHAR(10) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL
);

CREATE TABLE teachers (
    id_teacher SERIAL PRIMARY KEY,
    cui CHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    id_user INTEGER NOT NULL REFERENCES users(id_user)
);

CREATE TABLE bimonthly_units (
    id_unit SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_grades_id_major ON grades(id_major);
CREATE INDEX idx_school_cycle_status ON school_cycle(status);
CREATE INDEX idx_classrooms_code ON classrooms(room_code);
CREATE INDEX idx_courses_code ON courses(course_code);
