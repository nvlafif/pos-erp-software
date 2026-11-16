package com.poserp.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poserp.models.dto.TransactionItemRequest;
import com.poserp.models.dto.TransactionRequest;
import com.poserp.models.entities.CashierTransaction;
import com.poserp.models.entities.CashierTransactionDetail;
import com.poserp.models.entities.Product;
import com.poserp.models.entities.User;
import com.poserp.repositories.CashierTransactionDetailRepository;
import com.poserp.repositories.CashierTransactionRepository;
import com.poserp.repositories.ProductRepository;
import com.poserp.repositories.UserRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import com.poserp.models.dto.SalesReportResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class CashierTransactionService {

    private final CashierTransactionRepository transactionRepository;
    private final CashierTransactionDetailRepository detailRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CashierTransactionService(
            CashierTransactionRepository transactionRepository,
            CashierTransactionDetailRepository detailRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.detailRepository = detailRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<CashierTransaction> findAll() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public CashierTransaction findById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found : " + id));
    }

    public List<CashierTransactionDetail> findDetailsByTransactionId(Long transactionId) {
        findById(transactionId); // Validasi bahwa ID transaksi benar-benar ada
        return detailRepository.findByCashierTransactionId(transactionId);
    }

    @Transactional
    public CashierTransaction checkout(TransactionRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Shopping cart cannot be empty");
        }

        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User cashier = userRepository.findByEmail(currentUserEmail)
        .orElseThrow(() -> new RuntimeException("Akun kasir yang sedang login tidak ditemukan: " + currentUserEmail));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<CashierTransactionDetail> transactionDetails = new ArrayList<>();

        // 1. Validasi stok, hitung subtotal, dan potong stok setiap item
        for (TransactionItemRequest item : request.getItems()) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero");
            }

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found : " + item.getProductId()));

            if (product.getStock() == null || product.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product : " + product.getName());
            }

            // Pemotongan stok otomatis
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);

            // Snapshot harga produk saat ini & hitung subtotal
            BigDecimal unitPrice = product.getPrice();
            BigDecimal quantityBd = BigDecimal.valueOf(item.getQuantity());
            BigDecimal subTotal = unitPrice.multiply(quantityBd).setScale(2, RoundingMode.HALF_UP);

            totalAmount = totalAmount.add(subTotal);

            CashierTransactionDetail detail = new CashierTransactionDetail();
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(unitPrice);
            detail.setSubTotal(subTotal);

            transactionDetails.add(detail);
        }

        // 2. Validasi kecukupan uang pembayaran
        if (request.getPayment() == null || request.getPayment().compareTo(totalAmount) < 0) {
            throw new IllegalArgumentException("Insufficient payment amount. Total required: " + totalAmount);
        }

        BigDecimal change = request.getPayment().subtract(totalAmount);

        // 3. Simpan Header Transaksi (Struk)
        CashierTransaction transaction = new CashierTransaction();
        transaction.setUser(cashier);
        transaction.setTotalAmount(totalAmount);
        transaction.setPayment(request.getPayment());
        transaction.setChange(change);

        CashierTransaction savedTransaction = transactionRepository.save(transaction);

        // 4. Tautkan setiap detail barang ke Struk yang baru dibuat lalu simpan
        for (CashierTransactionDetail detail : transactionDetails) {
            detail.setCashierTransaction(savedTransaction);
        }
        detailRepository.saveAll(transactionDetails);

        return savedTransaction;
    }

    public SalesReportResponse getSalesReport(String period,Integer year,Integer month,LocalDate startDate,LocalDate endDate) {
        LocalDate today = LocalDate.now();
        LocalDate resolvedStart;
        LocalDate resolvedEnd;
        String normalizedPeriod;

        // Jika period tidak diisi tetapi startDate & endDate dikirim, otomatis anggap CUSTOM
        if (period == null || period.isBlank()) {
            normalizedPeriod = (startDate != null && endDate != null) ? "CUSTOM" : "TODAY";
        } else {
            normalizedPeriod = period.trim().toUpperCase();
        }

        switch (normalizedPeriod) {
            case "TODAY":
                resolvedStart = today;
                resolvedEnd = today;
                break;

            case "THIS_WEEK":
                // Senin minggu ini sampai Minggu minggu ini
                resolvedStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                resolvedEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
                break;

            case "THIS_MONTH":
                resolvedStart = today.withDayOfMonth(1);
                resolvedEnd = today.with(TemporalAdjusters.lastDayOfMonth());
                break;

            case "THIS_YEAR":
                resolvedStart = today.withDayOfYear(1);
                resolvedEnd = today.with(TemporalAdjusters.lastDayOfYear());
                break;

            case "MONTH":
                if (month == null || month < 1 || month > 12) {
                    throw new IllegalArgumentException("Parameter 'month' wajib diisi antara 1 sampai 12");
                }
                int targetYear = (year != null) ? year : today.getYear();
                YearMonth yearMonth = YearMonth.of(targetYear, month);
                resolvedStart = yearMonth.atDay(1);
                resolvedEnd = yearMonth.atEndOfMonth();
                break;

            case "CUSTOM":
                if (startDate == null || endDate == null) {
                    throw new IllegalArgumentException("Parameter 'startDate' dan 'endDate' wajib diisi untuk rentang custom");
                }
                if (startDate.isAfter(endDate)) {
                    throw new IllegalArgumentException("'startDate' tidak boleh lebih besar dari 'endDate'");
                }
                resolvedStart = startDate;
                resolvedEnd = endDate;
                break;

            default:
                throw new IllegalArgumentException(
                        "Pilihan period tidak valid. Gunakan: TODAY, THIS_WEEK, THIS_MONTH, THIS_YEAR, MONTH, atau CUSTOM");
        }

        LocalDateTime startDateTime = resolvedStart.atStartOfDay();
        LocalDateTime endExclusiveDateTime = resolvedEnd.plusDays(1).atStartOfDay();

        List<Object[]> results = transactionRepository.getSalesSummary(startDateTime, endExclusiveDateTime);
        Object[] row = results.get(0);

        Long totalTransactions = row[0] != null ? ((Number) row[0]).longValue() : 0L;
        BigDecimal totalRevenue = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;

        return new SalesReportResponse(
                normalizedPeriod,
                resolvedStart,
                resolvedEnd,
                totalTransactions,
                totalRevenue
        );
            
    }
}