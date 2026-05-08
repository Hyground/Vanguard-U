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
    @Column(name = "grade_id")
    private Long id;
    
    @Column(name = "grade_name", nullable = false, length = 50)
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "career_id", nullable = false)
    private Career career;
    
    public Grade() {}
    
    public Grade(String name, Career career) {
        this.name = name;
        this.career = career;
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
    
    public Career getCareer() {
        return career;
    }
    
    public void setCareer(Career career) {
        this.career = career;
    }
}
