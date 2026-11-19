package com.poserp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.poserp.models.entities.Role;
import com.poserp.models.entities.User;
import com.poserp.repositories.RoleRepository;
import com.poserp.repositories.UserRepository;

@SpringBootApplication
public class PosErpSoftware {

	public static void main(String[] args) {
		SpringApplication.run(PosErpSoftware.class, args);
	}

	@Bean
    CommandLineRunner initDefaultAccounts(RoleRepository roleRepo, UserRepository userRepo, PasswordEncoder encoder) {
        return args -> {
            if (userRepo.count() == 0) {
                Role ownerRole = roleRepo.findByName("Owner").orElseGet(() -> {
                    Role r = new Role();
                    r.setName("Owner");
                    return roleRepo.save(r);
                });
                Role gudangRole = roleRepo.findByName("Gudang").orElseGet(() -> {
                    Role r = new Role();
                    r.setName("Gudang");
                    return roleRepo.save(r);
                });
                Role kasirRole = roleRepo.findByName("Kasir").orElseGet(() -> {
                    Role r = new Role();
                    r.setName("Kasir");
                    return roleRepo.save(r);
                });

                User owner = new User();
                owner.setName("Budi Owner");
                owner.setEmail("owner@poserp.com");
                owner.setPassword(encoder.encode("owner123"));
                owner.setRole(ownerRole);
                userRepo.save(owner);

                User gudang = new User();
                gudang.setName("Andi Gudang");
                gudang.setEmail("gudang@poserp.com");
                gudang.setPassword(encoder.encode("gudang123"));
                gudang.setRole(gudangRole);
                userRepo.save(gudang);

                User kasir = new User();
                kasir.setName("Siti Kasir");
                kasir.setEmail("kasir@poserp.com");
                kasir.setPassword(encoder.encode("kasir123"));
                kasir.setRole(kasirRole);
                userRepo.save(kasir);
            }
        };
    }

}
