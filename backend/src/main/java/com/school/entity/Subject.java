package com.school.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String code;

    private String description;

    @Builder.Default
    private Integer credits = 3;

    @ManyToMany(mappedBy = "subjects", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Teacher> teachers = new HashSet<>();
}
