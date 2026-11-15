package com.identity.backend.user;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
