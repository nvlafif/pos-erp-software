package com.poserp.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.poserp.models.entities.Role;
import com.poserp.repositories.RoleRepository;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role findById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found : " + id));
    }

    public Role create(Role role) {
        return roleRepository.save(role);
    }

    public Role update(Long id, Role roleDetails) {
        Role existingRole = findById(id);
        existingRole.setName(roleDetails.getName());
        return roleRepository.save(existingRole);
    }

    public void delete(Long id) {
        Role existingRole = findById(id);
        roleRepository.delete(existingRole);
    }
}