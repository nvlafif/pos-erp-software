package com.poserp.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


import com.poserp.models.entities.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStockLessThanEqualOrderByStockAsc(Double threshold);
}