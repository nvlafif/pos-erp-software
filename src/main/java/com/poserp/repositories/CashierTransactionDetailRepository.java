package com.poserp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.poserp.models.entities.CashierTransactionDetail;

@Repository 
public interface CashierTransactionDetailRepository extends JpaRepository<CashierTransactionDetail, Long> {
    
}
