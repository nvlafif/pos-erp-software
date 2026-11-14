package com.poserp.services;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.poserp.models.entities.Category;
import com.poserp.models.entities.Product;
import com.poserp.repositories.CategoryRepository;
import com.poserp.repositories.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produk tidak ditemukan dengan ID: " + id));
    }

    public Product create(Product product) {
        validateProduct(product);

        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category category = categoryRepository.findById(product.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Kategori tidak ditemukan dengan ID: " + product.getCategory().getId()));
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    public Product update(Long id, Product productDetails) {
        validateProduct(productDetails);
        Product existingProduct = findById(id);

        existingProduct.setName(productDetails.getName());
        existingProduct.setPrice(productDetails.getPrice());
        existingProduct.setStock(productDetails.getStock());
        existingProduct.setUnit(productDetails.getUnit());
        existingProduct.setImage(productDetails.getImage());

        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
            Category category = categoryRepository.findById(productDetails.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Kategori tidak ditemukan dengan ID: " + productDetails.getCategory().getId()));
            existingProduct.setCategory(category);
        }

        return productRepository.save(existingProduct);
    }

    public void delete(Long id) {
        Product existingProduct = findById(id);
        productRepository.delete(existingProduct);
    }

    private void validateProduct(Product product) {
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Harga produk tidak boleh kosong atau negatif");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Stok produk tidak boleh kosong atau negatif");
        }
    }
}