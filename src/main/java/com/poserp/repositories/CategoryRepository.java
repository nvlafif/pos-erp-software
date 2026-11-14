package com.poserp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.poserp.models.entities.Category;

@Repository 
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
}
