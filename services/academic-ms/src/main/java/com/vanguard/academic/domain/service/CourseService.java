package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.Course;
import com.vanguard.academic.domain.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {
    
    private final CourseRepository courseRepository;
    
    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }
    
    @Transactional(readOnly = true)
    public List<Course> findAll() {
        return courseRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Course> findById(Long id) {
        return courseRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Course> findByCode(String code) {
        return courseRepository.findByCode(code);
    }
    
    @Transactional(readOnly = true)
    public List<Course> findByNameContaining(String name) {
        return courseRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Course save(Course course) {
        if (courseRepository.existsByCode(course.getCode())) {
            throw new IllegalArgumentException("Course with code '" + course.getCode() + "' already exists");
        }
        return courseRepository.save(course);
    }
    
    public Course update(Long id, Course course) {
        return courseRepository.findById(id)
            .map(existingCourse -> {
                if (!existingCourse.getCode().equals(course.getCode()) && 
                    courseRepository.existsByCode(course.getCode())) {
                    throw new IllegalArgumentException("Course with code '" + course.getCode() + "' already exists");
                }
                existingCourse.setCode(course.getCode());
                existingCourse.setName(course.getName());
                return courseRepository.save(existingCourse);
            })
            .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));
    }
    
    public void deleteById(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new IllegalArgumentException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }
}
