package com.poserp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.poserp.models.entities.User;

@Repository 
public interface UserRepository extends JpaRepository<User, Long> {
    
}
