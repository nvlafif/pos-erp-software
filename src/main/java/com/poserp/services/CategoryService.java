package com.poserp.services;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poserp.models.entities.Category;
import com.poserp.repositories.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAll() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found : " + id));
    }

    @Transactional
    public Category create(Category category) {
        String cleanName = validateAndTrimName(category.getName());

        if (categoryRepository.existsByNameIgnoreCase(cleanName)) {
            throw new IllegalArgumentException("Category already exists : " + cleanName);
        }

        categoryRepository.resetSequence();
        category.setName(cleanName);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(Long id, Category categoryDetails) {
        Category existingCategory = findById(id);
        String cleanName = validateAndTrimName(categoryDetails.getName());

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(cleanName, id)) {
            throw new IllegalArgumentException("Category already exists : " + cleanName);
        }

        existingCategory.setName(cleanName);
        return categoryRepository.save(existingCategory);
    }

    @Transactional
    public void delete(Long id) {
        Category existingCategory = findById(id);
        categoryRepository.delete(existingCategory);
        categoryRepository.flush();
        categoryRepository.resetSequence();
    }

    private String validateAndTrimName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        return name.trim();
    }
}