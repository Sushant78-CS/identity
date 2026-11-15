package com.identity.backend.auth.activation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ActivationEmailRecoveryService {

    private static final Logger log =
            LoggerFactory.getLogger(ActivationEmailRecoveryService.class);

    private static final int PROCESSING_TIMEOUT_MINUTES = 10;

    private final ActivationEmailOutboxRepository outboxRepository;

    public ActivationEmailRecoveryService(
            ActivationEmailOutboxRepository outboxRepository
    ) {
        this.outboxRepository = outboxRepository;
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void recoverStaleEmails() {

        LocalDateTime cutoff = LocalDateTime.now()
                .minusMinutes(PROCESSING_TIMEOUT_MINUTES);

        int recovered = outboxRepository
                .recoverStaleProcessingEmails(cutoff);

        if (recovered > 0) {
            log.warn(
                    "Recovered {} abandoned activation emails",
                    recovered
            );
        }
    }
}
