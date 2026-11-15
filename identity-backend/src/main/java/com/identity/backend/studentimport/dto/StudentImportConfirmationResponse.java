package com.identity.backend.studentimport.dto;

public record StudentImportConfirmationResponse(

        Long importBatchId,

        int importedRows,

        int invalidRows,

        String status,

        String message

) {
}
