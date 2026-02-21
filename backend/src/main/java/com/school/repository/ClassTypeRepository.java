package com.school.repository;

import com.school.entity.ClassType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClassTypeRepository extends JpaRepository<ClassType, Long> {
    Optional<ClassType> findByCode(String code);
    boolean existsByName(String name);
    boolean existsByCode(String code);
}
