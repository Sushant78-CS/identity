
package com.identity.backend.auth.activation;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ActivationEmailDispatcher {

    private static final Logger log =
            LoggerFactory.getLogger(ActivationEmailDispatcher.class);

    private final ActivationEmailClaimService claimService;
    private final JavaMailSender mailSender;

    @Scheduled(fixedDelay = 30000)
    public void dispatchPendingEmails() {

        var claimedEmails = claimService.claimPendingEmails();

        for (ClaimedActivationEmail claimed : claimedEmails) {
            dispatchEmail(claimed);
        }
    }

    private void dispatchEmail(ClaimedActivationEmail claimed) {

        Long emailId = claimed.emailId();
        String claimToken = claimed.claimToken();

        try {
            ActivationEmailOutbox email = claimService
                    .getClaimedEmail(emailId, claimToken)
                    .orElse(null);

            if (email == null) {
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email.getRecipient());
            message.setSubject(email.getSubject());
            message.setText(email.getBody());

            // SMTP executes outside the database transaction.
            mailSender.send(message);

            claimService.markAsSent(emailId, claimToken);

            log.info("Activation email sent. Outbox ID: {}", emailId);

        } catch (Exception exception) {

            log.error(
                    "Activation email delivery failed. Outbox ID: {}",
                    emailId,
                    exception
            );

            try {
                claimService.markAsFailed(
                        emailId,
                        claimToken,
                        exception.getMessage()
                );
            } catch (Exception updateException) {
                log.error(
                        "Could not update activation email status. Outbox ID: {}",
                        emailId,
                        updateException
                );
            }
        }
    }
}
