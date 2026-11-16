package com.poserp.services;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poserp.models.entities.Role;
import com.poserp.repositories.RoleRepository;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> findAll() {
        return roleRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Role findById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found : " + id));
    }

    @Transactional
    public Role create(Role role) {
        String cleanName = validateAndTrimName(role.getName());

        if (roleRepository.existsByNameIgnoreCase(cleanName)) {
            throw new IllegalArgumentException("Role already exists : " + cleanName);
        }

        roleRepository.resetSequence();
        role.setName(cleanName);
        return roleRepository.save(role);
    }

    @Transactional
    public Role update(Long id, Role roleDetails) {
        Role existingRole = findById(id);
        String cleanName = validateAndTrimName(roleDetails.getName());

        if (roleRepository.existsByNameIgnoreCaseAndIdNot(cleanName, id)) {
            throw new IllegalArgumentException("Role already exists : " + cleanName);
        }

        existingRole.setName(cleanName);
        return roleRepository.save(existingRole);
    }

    @Transactional
    public void delete(Long id) {
        Role existingRole = findById(id);
        roleRepository.delete(existingRole);
        roleRepository.flush();
        roleRepository.resetSequence();
    }

    private String validateAndTrimName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Role name cannot be empty");
        }
        return name.trim();
    }
}