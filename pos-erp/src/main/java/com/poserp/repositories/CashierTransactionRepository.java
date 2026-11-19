package com.poserp.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import com.poserp.models.entities.CashierTransaction;

public interface CashierTransactionRepository extends JpaRepository<CashierTransaction, Long> {

    @Query("SELECT COUNT(t), SUM(t.totalAmount) FROM CashierTransaction t " +
           "WHERE t.transactionTime >= :start AND t.transactionTime < :endExclusive")
    List<Object[]> getSalesSummary(
            @Param("start") LocalDateTime start,
            @Param("endExclusive") LocalDateTime endExclusive);
}