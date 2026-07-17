package com.example.teddybearshop.configuration;


import com.example.teddybearshop.enums.Role;
import com.example.teddybearshop.model.User;
import com.example.teddybearshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class ApplicationInitConfig {

    private final PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            createUserIfNotExists(userRepository, "admin@gmail.com", "admin", "Admin", Role.ADMIN);
            createUserIfNotExists(userRepository, "staff@gmail.com", "staff", "Staff", Role.STAFF);
            createUserIfNotExists(userRepository, "customer@gmail.com", "customer", "Customer", Role.CUSTOMER);
        };
    }

    private void createUserIfNotExists(
            UserRepository userRepository,
            String email,
            String rawPassword,
            String fullName,
            Role role
    ) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .role(role)
                    .status(true)
                    .build();

            userRepository.save(user);
            log.warn("{} account has been created: {}", role, email);
        }
    }
}
