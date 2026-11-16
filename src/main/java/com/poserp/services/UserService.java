package com.poserp.services;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.poserp.models.entities.Role;
import com.poserp.models.entities.User;
import com.poserp.repositories.RoleRepository;
import com.poserp.repositories.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found : " + id));
    }

    public User create(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already registered : " + user.getEmail());
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (user.getRole() != null && user.getRole().getId() != null) {
            Role role = roleRepository.findById(user.getRole().getId())
                    .orElseThrow(() -> new RuntimeException("Role not found : " + user.getRole().getId()));
            user.setRole(role);
        } else {
            throw new IllegalArgumentException("User role is required");
        }

        // Hash password menggunakan Argon2id sebelum disimpan ke PostgreSQL
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User update(Long id, User userDetails) {
        User existingUser = findById(id);

        if (!existingUser.getEmail().equals(userDetails.getEmail())
                && userRepository.existsByEmail(userDetails.getEmail())) {
            throw new IllegalArgumentException("Email already registered : " + userDetails.getEmail());
        }

        existingUser.setName(userDetails.getName());
        existingUser.setEmail(userDetails.getEmail());

        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        if (userDetails.getRole() != null && userDetails.getRole().getId() != null) {
            Role role = roleRepository.findById(userDetails.getRole().getId())
                    .orElseThrow(() -> new RuntimeException("Role not found : " + userDetails.getRole().getId()));
            existingUser.setRole(role);
        }

        return userRepository.save(existingUser);
    }

    public void delete(Long id) {
        User existingUser = findById(id);
        userRepository.delete(existingUser);
    }
}