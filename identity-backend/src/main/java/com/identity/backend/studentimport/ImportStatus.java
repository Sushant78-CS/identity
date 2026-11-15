package com.identity.backend.studentimport;

public enum ImportStatus {
    UPLOADED,
    VALIDATING,
    READY_FOR_CONFIRMATION,
    PROCESSING,
    COMPLETED,
    COMPLETED_WITH_ERRORS,
    FAILED
}
