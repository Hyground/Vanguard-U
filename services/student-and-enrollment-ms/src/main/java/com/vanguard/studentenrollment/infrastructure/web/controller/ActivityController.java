package com.vanguard.studentenrollment.infrastructure.web.controller;

import com.vanguard.studentenrollment.application.dto.ActivityRequest;
import com.vanguard.studentenrollment.application.dto.ActivityResponse;
import com.vanguard.studentenrollment.application.service.ActivityService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<Page<ActivityResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(activityService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(activityService.findById(id));
    }

    @GetMapping("/teacher-assignment/{teacherAssignmentId}")
    public ResponseEntity<List<ActivityResponse>> findByTeacherAssignmentId(
            @PathVariable Integer teacherAssignmentId
    ) {
        return ResponseEntity.ok(activityService.findByTeacherAssignmentId(teacherAssignmentId));
    }

    @PostMapping
    public ResponseEntity<ActivityResponse> create(@Valid @RequestBody ActivityRequest request) {
        ActivityResponse response = activityService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody ActivityRequest request
    ) {
        return ResponseEntity.ok(activityService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        activityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
