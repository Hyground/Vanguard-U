package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.CourseDTO;
import com.vanguard.academic.domain.model.Course;
import com.vanguard.academic.domain.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {
    
    private final CourseService courseService;
    
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    
    @GetMapping
    @Cacheable(cacheNames = "academicCatalogs", key = "'courses:all'")
    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseService.findAll();
        return courses.stream()
            .map(this::toDTO)
            .toList();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return courseService.findById(id)
            .map(course -> ResponseEntity.ok(toDTO(course)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CourseDTO>> searchCourses(@RequestParam String name) {
        List<Course> courses = courseService.findByNameContaining(name);
        List<CourseDTO> courseDTOs = courses.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(courseDTOs);
    }
    
    @PostMapping
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<CourseDTO> createCourse(@Valid @RequestBody CourseDTO courseDTO) {
        Course course = toEntity(courseDTO);
        Course savedCourse = courseService.save(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedCourse));
    }
    
    @PutMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseDTO courseDTO) {
        Course course = toEntity(courseDTO);
        Course updatedCourse = courseService.update(id, course);
        return ResponseEntity.ok(toDTO(updatedCourse));
    }
    
    @DeleteMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private CourseDTO toDTO(Course course) {
        return new CourseDTO(course.getId(), course.getCode(), course.getName());
    }
    
    private Course toEntity(CourseDTO dto) {
        return new Course(dto.code(), dto.name());
    }
}
