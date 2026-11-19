package com.poserp.models.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SalesReportResponse {

    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalTransactions;
    private BigDecimal totalRevenue;

    public SalesReportResponse() {
    }

    public SalesReportResponse(String period, LocalDate startDate, LocalDate endDate,
                               Long totalTransactions, BigDecimal totalRevenue) {
        this.period = period;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalTransactions = totalTransactions;
        this.totalRevenue = totalRevenue;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(Long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}