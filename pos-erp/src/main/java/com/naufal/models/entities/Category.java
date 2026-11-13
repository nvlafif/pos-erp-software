package com.naufal.models.entities;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories") 
public class Category implements Serializable {
    
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private Long id;
    private String name;
    public Category() {
    }

    public static long getSerialversionuid() {
        return serialVersionUID;
    }
    public Long getId_category() {
        return id;
    }
    public void setId_category(Long id_category) {
        this.id = id_category;
    }
    public String getName_category() {
        return name;
    }
    public void setName_category(String name_category) {
        this.name = name_category;
    }
    
    
}
