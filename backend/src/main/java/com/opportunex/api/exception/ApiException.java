package com.opportunex.api.exception;

import org.springframework.http.HttpStatus;

/** An error the browser should see as JSON: {"error": "message"}. */
public class ApiException extends RuntimeException {
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
