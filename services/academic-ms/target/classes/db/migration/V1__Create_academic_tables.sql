-- Create academic tables for academic-ms microservice

CREATE TABLE classrooms (
    classroom_id SERIAL PRIMARY KEY,
    classroom_code VARCHAR(10) UNIQUE NOT NULL,
    capacity INTEGER
);

CREATE TABLE study_plans (
    plan_id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL
);

CREATE TABLE school_days (
    day_id SERIAL PRIMARY KEY,
    day_name VARCHAR(50) NOT NULL
);

CREATE TABLE academic_cycles (
    cycle_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE careers (
    career_id SERIAL PRIMARY KEY,
    career_name VARCHAR(100) NOT NULL
);

CREATE TABLE grades (
    grade_id SERIAL PRIMARY KEY,
    grade_name VARCHAR(50) NOT NULL,
    career_id INTEGER REFERENCES careers(career_id)
);

CREATE TABLE sections (
    section_id SERIAL PRIMARY KEY,
    section_name CHAR(1) NOT NULL
);

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(10) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL
);

CREATE TABLE academic_units (
    unit_id SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_grades_career_id ON grades(career_id);
CREATE INDEX idx_academic_cycles_status ON academic_cycles(status);
CREATE INDEX idx_classrooms_code ON classrooms(classroom_code);
CREATE INDEX idx_courses_code ON courses(course_code);
