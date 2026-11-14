package com.poserp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.poserp.models.entities.Role;

@Repository 
public interface RoleRepository extends JpaRepository<Role, Long> {
    
}
