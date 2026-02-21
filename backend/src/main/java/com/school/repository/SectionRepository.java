package com.school.repository;

import com.school.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findBySchoolClassId(Long classId);
    List<Section> findBySchoolClassIdAndActiveTrue(Long classId);
    boolean existsByNameAndSchoolClassId(String name, Long classId);
}
