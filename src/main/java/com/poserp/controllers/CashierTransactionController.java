package com.poserp.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poserp.models.dto.TransactionRequest;
import com.poserp.models.entities.CashierTransaction;
import com.poserp.models.entities.CashierTransactionDetail;
import com.poserp.services.CashierTransactionService;

@RestController
@RequestMapping("/api/transactions")
public class CashierTransactionController {

    private final CashierTransactionService transactionService;

    public CashierTransactionController(CashierTransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<CashierTransaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CashierTransaction> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findById(id));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<List<CashierTransactionDetail>> getTransactionDetails(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findDetailsByTransactionId(id));
    }

    @PostMapping("/checkout")
    public ResponseEntity<CashierTransaction> checkout(@RequestBody TransactionRequest request) {
        CashierTransaction saved = transactionService.checkout(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}