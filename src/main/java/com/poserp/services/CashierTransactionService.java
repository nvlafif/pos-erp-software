package com.poserp.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

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
        return transactionRepository.findAll();
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

        User cashier = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found : " + request.getUserId()));

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
}