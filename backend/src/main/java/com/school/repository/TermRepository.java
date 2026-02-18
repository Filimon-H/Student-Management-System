package com.school.repository;

import com.school.entity.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TermRepository extends JpaRepository<Term, Long> {
    List<Term> findByIsActiveTrue();
    Optional<Term> findFirstByIsActiveTrueOrderByStartDateDesc();
}
