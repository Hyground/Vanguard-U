package com.vanguard.studentenrollment.infrastructure.web.controller;

import com.vanguard.studentenrollment.application.dto.TutorRequest;
import com.vanguard.studentenrollment.application.dto.TutorResponse;
import com.vanguard.studentenrollment.application.service.TutorService;
import jakarta.validation.Valid;
import java.net.URI;
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
@RequestMapping("/api/v1/tutors")
public class TutorController {

    private final TutorService tutorService;

    public TutorController(TutorService tutorService) {
        this.tutorService = tutorService;
    }

    @GetMapping
    public ResponseEntity<Page<TutorResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(tutorService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TutorResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(tutorService.findById(id));
    }

    @GetMapping("/cui/{cui}")
    public ResponseEntity<TutorResponse> findByCui(@PathVariable String cui) {
        return ResponseEntity.ok(tutorService.findByCui(cui));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<TutorResponse> findByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(tutorService.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<TutorResponse> create(@Valid @RequestBody TutorRequest request) {
        TutorResponse response = tutorService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TutorResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody TutorRequest request
    ) {
        return ResponseEntity.ok(tutorService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        tutorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
