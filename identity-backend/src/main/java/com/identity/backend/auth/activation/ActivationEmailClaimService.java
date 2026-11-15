
package com.identity.backend.auth.activation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivationEmailClaimService {

    private final ActivationEmailOutboxRepository outboxRepository;

    @Transactional
    public List<ClaimedActivationEmail> claimPendingEmails() {

        LocalDateTime now = LocalDateTime.now();

        List<ActivationEmailOutbox> emails =
                outboxRepository.claimPendingEmails(now);

        return emails.stream()
                .map(email -> {
                    String claimToken = UUID.randomUUID().toString();

                    email.setStatus("PROCESSING");
                    email.setClaimedAt(now);
                    email.setClaimToken(claimToken);

                    return new ClaimedActivationEmail(
                            email.getId(),
                            claimToken
                    );
                })
                .toList();
    }

    // NEW METHOD
    @Transactional
    public Optional<ActivationEmailOutbox> getClaimedEmail(
            Long emailId,
            String claimToken
    ) {
        return outboxRepository.findByIdAndClaimToken(
                emailId,
                claimToken
        );
    }

    @Transactional
    public void markAsSent(Long emailId, String claimToken) {

        ActivationEmailOutbox email = outboxRepository
                .findByIdAndClaimToken(emailId, claimToken)
                .orElse(null);

        if (email == null || !"PROCESSING".equals(email.getStatus())) {
            return;
        }

        email.setStatus("SENT");
        email.setSentAt(LocalDateTime.now());
        email.setLastError(null);
        email.setClaimedAt(null);
        email.setClaimToken(null);
        email.setNextAttemptAt(null);
    }

    @Transactional
    public void markAsFailed(
            Long emailId,
            String claimToken,
            String errorMessage
    ) {

        ActivationEmailOutbox email = outboxRepository
                .findByIdAndClaimToken(emailId, claimToken)
                .orElse(null);

        if (email == null || !"PROCESSING".equals(email.getStatus())) {
            return;
        }

        int attempts = email.getAttempts() + 1;

        email.setAttempts(attempts);
        email.setClaimedAt(null);
        email.setClaimToken(null);

        String safeError = errorMessage == null
                ? "Email delivery failed"
                : errorMessage.substring(
                0,
                Math.min(errorMessage.length(), 1000)
        );

        email.setLastError(safeError);

        if (attempts >= 5) {
            email.setStatus("FAILED");
            email.setNextAttemptAt(null);
        } else {
            long retryMinutes = 1L << (attempts - 1);

            email.setStatus("PENDING");
            email.setNextAttemptAt(
                    LocalDateTime.now().plusMinutes(retryMinutes)
            );
        }
    }
}
