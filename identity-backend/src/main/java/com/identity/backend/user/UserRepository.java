package com.identity.backend.user;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    List<User> findAllByCollegeId(Long collegeId);

    List<User> findAllByCollegeIdAndRole(
            Long collegeId,
            UserRole role
    );

    boolean existsByEmailAndCollegeId(
            String email,
            Long collegeId
    );


    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    List<User> findAllByEmailInIgnoreCase(Collection<String> emails);

    List<User> findAllByPhoneNumberIn(Collection<String> phoneNumbers);

    boolean existsByRole(UserRole role);

    long countByCollegeIdAndRole(
            Long collegeId,
            UserRole role
    );

    long countByCollegeIdAndRoleAndStatus(
            Long collegeId,
            UserRole role,
            AccountStatus status
    );

    @Query("""
    SELECT u FROM User u
    WHERE u.college.id = :collegeId
      AND u.role = :role
      AND (:status IS NULL OR u.status = :status)
      AND (
          CAST(:search AS string) IS NULL
          OR LOWER(u.fullName) LIKE LOWER(
              CONCAT('%', CAST(:search AS string), '%')
          )
          OR LOWER(u.email) LIKE LOWER(
              CONCAT('%', CAST(:search AS string), '%')
          )
          OR LOWER(COALESCE(u.phoneNumber, '')) LIKE LOWER(
              CONCAT('%', CAST(:search AS string), '%')
          )
      )
    """)
    Page<User> searchStaff(
            @Param("collegeId") Long collegeId,
            @Param("role") UserRole role,
            @Param("status") AccountStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    Optional<User> findByIdAndCollegeIdAndRole(
            Long id,
            Long collegeId,
            UserRole role
    );

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long id);
}
