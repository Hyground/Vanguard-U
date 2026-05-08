package com.vanguard.academic.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

@Entity
@Table(name = "grades")
public class Grade {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grade")
    private Long id;
    
    @Column(name = "grade_name", nullable = false, length = 50)
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "id_major")
    private Major major;
    
    public Grade() {}
    
    public Grade(String name, Major major) {
        this.name = name;
        this.major = major;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Major getMajor() {
        return major;
    }
    
    public void setMajor(Major major) {
        this.major = major;
    }
}
