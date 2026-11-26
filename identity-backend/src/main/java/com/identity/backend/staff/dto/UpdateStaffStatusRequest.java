package com.identity.backend.staff.dto;

import com.identity.backend.user.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStaffStatusRequest(

        @NotNull(message = "Account status is required")
        AccountStatus status

) {
}