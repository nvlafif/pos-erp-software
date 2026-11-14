package com.poserp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.poserp.models.entities.CashierTransaction;

@Repository 
public interface CashierTransactionRepository extends JpaRepository<CashierTransaction, Long> {
    
}
