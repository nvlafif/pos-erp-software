package com.poserp.services;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.poserp.models.entities.Category;
import com.poserp.models.entities.Product;
import com.poserp.models.entities.Unit;
import com.poserp.repositories.CategoryRepository;
import com.poserp.repositories.ProductRepository;
import com.poserp.repositories.UnitRepository;

import com.poserp.models.dto.ExpirationAlertResponse;
import com.poserp.models.dto.ExpirationAlertResponse.ExpiringProductItem;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            UnitRepository unitRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.unitRepository = unitRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found : " + id));
    }

    public Product create(Product product) {
        validateProduct(product);
        validateAndNormalizeExpiration(product);

        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category category = categoryRepository.findById(product.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found : " + product.getCategory().getId()));
            product.setCategory(category);
        }

        if (product.getUnit() != null && product.getUnit().getId() != null) {
            Unit unit = unitRepository.findById(product.getUnit().getId())
                    .orElseThrow(() -> new RuntimeException("Unit not found : " + product.getUnit().getId()));
            product.setUnit(unit);
        }

        return productRepository.save(product);
    }

    public Product update(Long id, Product productDetails) {
        validateProduct(productDetails);
        Product existingProduct = findById(id);

        existingProduct.setName(productDetails.getName());
        existingProduct.setPrice(productDetails.getPrice());
        existingProduct.setStock(productDetails.getStock());
        existingProduct.setImage(productDetails.getImage());

        existingProduct.setHasExpiration(productDetails.getHasExpiration());
        existingProduct.setExpirationDate(productDetails.getExpirationDate());
        validateAndNormalizeExpiration(existingProduct);

        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
            Category category = categoryRepository.findById(productDetails.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found : " + productDetails.getCategory().getId()));
            existingProduct.setCategory(category);
        }

        if (productDetails.getUnit() != null && productDetails.getUnit().getId() != null) {
            Unit unit = unitRepository.findById(productDetails.getUnit().getId())
                    .orElseThrow(() -> new RuntimeException("Unit not found : " + productDetails.getUnit().getId()));
            existingProduct.setUnit(unit);
        }

        return productRepository.save(existingProduct);
    }

    public void delete(Long id) {
        Product existingProduct = findById(id);
        productRepository.delete(existingProduct);
    }

    private void validateProduct(Product product) {
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Product price cannot be null or negative");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Product stock cannot be null or negative");
        }
    }

    public List<Product> getLowStockProducts(Double threshold) {
        if (threshold == null || threshold < 0) {
            throw new IllegalArgumentException("Threshold stok minimum tidak boleh bernilai negatif");
        }
        return productRepository.findByStockLessThanEqualOrderByStockAsc(threshold);
    }

    private void validateAndNormalizeExpiration(Product product) {
        boolean hasExp = Boolean.TRUE.equals(product.getHasExpiration());
        product.setHasExpiration(hasExp);

        if (hasExp) {
            if (product.getExpirationDate() == null) {
                throw new IllegalArgumentException(
                        "Tanggal expired wajib diisi jika produk dikonfirmasi memiliki masa kedaluwarsa."
                );
            }
        } else {
            // Otomatis bersihkan tanggal expired menjadi null jika produk tidak memiliki expired
            product.setExpirationDate(null);
        }
    }

    public ExpirationAlertResponse getExpiringProducts(Integer days) {
        if (days == null || days < 0) {
            throw new IllegalArgumentException("Parameter 'days' tidak boleh bernilai negatif.");
        }

        LocalDate today = LocalDate.now();
        LocalDate thresholdDate = today.plusDays(days);

        List<Product> products = productRepository
                .findByHasExpirationTrueAndExpirationDateLessThanEqualOrderByExpirationDateAsc(thresholdDate);

        List<ExpiringProductItem> items = products.stream()
                .map(product -> {
                    long daysRemaining = ChronoUnit.DAYS.between(today, product.getExpirationDate());
                    String status = daysRemaining < 0 ? "EXPIRED" : "EXPIRING_SOON";
                    return new ExpiringProductItem(product, daysRemaining, status);
                })
                .toList();

        boolean hasAlert = !items.isEmpty();
        String message = hasAlert
                ? "Peringatan: Terdapat " + items.size() + " produk yang akan kedaluwarsa dalam " + days + " hari ke depan atau sudah kedaluwarsa."
                : "Tidak ada produk yang mendekati kedaluwarsa dalam " + days + " hari ke depan.";

        return new ExpirationAlertResponse(hasAlert, days, items.size(), message, items);
    }

}