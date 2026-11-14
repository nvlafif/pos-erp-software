package com.poserp.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.poserp.models.entities.CashierTransactionDetail;

@Repository
public interface CashierTransactionDetailRepository extends JpaRepository<CashierTransactionDetail, Long> {
    List<CashierTransactionDetail> findByCashierTransactionId(Long transactionId);
}