package com.example.teddybearshop.repository;

import com.example.teddybearshop.enums.Role;
import com.example.teddybearshop.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByStatus(Boolean status, Pageable pageable);

    Page<User> findByRoleAndStatus(Role role, Boolean status, Pageable pageable);

    long countByRole(Role role);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "u.phone LIKE CONCAT('%', :keyword, '%')")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
}
