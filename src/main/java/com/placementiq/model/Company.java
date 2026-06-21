package com.placementiq.model;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private Double minCgpa;
    
    @Column(columnDefinition = "TEXT")
    private String requiredSkills; 

    private Integer requiredProjects;
    
    @Column(columnDefinition = "TEXT")
    private String description;
}
