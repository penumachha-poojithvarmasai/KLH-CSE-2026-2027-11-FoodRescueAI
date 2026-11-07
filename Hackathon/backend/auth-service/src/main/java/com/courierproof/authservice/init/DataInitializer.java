package com.courierproof.authservice.init;

import com.courierproof.authservice.model.Role;
import com.courierproof.authservice.model.User;
import com.courierproof.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("customer@demo.com", "demo1234", Role.CUSTOMER);
        seedUser("courier@demo.com", "demo1234", Role.COURIER);
        seedUser("admin@demo.com", "demo1234", Role.ADMIN);
    }

    private void seedUser(String email, String password, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .build();
            userRepository.save(user);
            log.info("Seeded demo user: {} ({})", email, role.name());
        } else {
            log.info("Demo user already exists: {}", email);
        }
    }
}
