package com.vanguard.studentenrollment.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_activity")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_teacher_assignment")
    private TeacherAssignment teacherAssignment;

    @Column(name = "id_unit")
    private Integer unitId;

    @Size(max = 100)
    @Column(name = "activity_name", length = 100)
    private String activityName;

    @DecimalMin(value = "0.00")
    @Digits(integer = 3, fraction = 2)
    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    public Activity() {
    }

    public Integer getId() {
        return id;
    }

    public TeacherAssignment getTeacherAssignment() {
        return teacherAssignment;
    }

    public void setTeacherAssignment(TeacherAssignment teacherAssignment) {
        this.teacherAssignment = teacherAssignment;
    }

    public Integer getUnitId() {
        return unitId;
    }

    public void setUnitId(Integer unitId) {
        this.unitId = unitId;
    }

    public String getActivityName() {
        return activityName;
    }

    public void setActivityName(String activityName) {
        this.activityName = activityName;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
}
