package com.poserp.models.dto;

import java.math.BigDecimal;
import java.util.List;

public class TransactionRequest {

    private BigDecimal payment;
    private List<TransactionItemRequest> items;

    public BigDecimal getPayment() {
        return payment;
    }

    public void setPayment(BigDecimal payment) {
        this.payment = payment;
    }

    public List<TransactionItemRequest> getItems() {
        return items;
    }

    public void setItems(List<TransactionItemRequest> items) {
        this.items = items;
    }
}