package com.poserp.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.poserp.models.entities.Category;
import com.poserp.repositories.CategoryRepository;

@Service 
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found : " + id));
    }

    public Category create(Category category) {
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category categoryDetails) {
        Category existingCategory = findById(id);
        existingCategory.setName(categoryDetails.getName());
        return categoryRepository.save(existingCategory);
    }

    public void delete(Long id) {
        Category existingCategory = findById(id);
        categoryRepository.delete(existingCategory);
    }

}
