package com.poserp.models.dto;

import java.util.List;

import com.poserp.models.entities.Product;

public class ExpirationAlertResponse {

    private boolean alert;
    private int alertWindowDays;
    private int totalItems;
    private String message;
    private List<ExpiringProductItem> items;

    public ExpirationAlertResponse() {
    }

    public ExpirationAlertResponse(boolean alert, int alertWindowDays, int totalItems,
                                   String message, List<ExpiringProductItem> items) {
        this.alert = alert;
        this.alertWindowDays = alertWindowDays;
        this.totalItems = totalItems;
        this.message = message;
        this.items = items;
    }

    public boolean isAlert() {
        return alert;
    }

    public void setAlert(boolean alert) {
        this.alert = alert;
    }

    public int getAlertWindowDays() {
        return alertWindowDays;
    }

    public void setAlertWindowDays(int alertWindowDays) {
        this.alertWindowDays = alertWindowDays;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ExpiringProductItem> getItems() {
        return items;
    }

    public void setItems(List<ExpiringProductItem> items) {
        this.items = items;
    }

    public static class ExpiringProductItem {
        private Product product;
        private long daysRemaining;
        private String status;

        public ExpiringProductItem() {
        }

        public ExpiringProductItem(Product product, long daysRemaining, String status) {
            this.product = product;
            this.daysRemaining = daysRemaining;
            this.status = status;
        }

        public Product getProduct() {
            return product;
        }

        public void setProduct(Product product) {
            this.product = product;
        }

        public long getDaysRemaining() {
            return daysRemaining;
        }

        public void setDaysRemaining(long daysRemaining) {
            this.daysRemaining = daysRemaining;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}