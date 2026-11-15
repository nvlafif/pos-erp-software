package com.poserp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.poserp.models.entities.CashierTransaction;

public interface CashierTransactionRepository extends JpaRepository<CashierTransaction, Long> {
    
}
