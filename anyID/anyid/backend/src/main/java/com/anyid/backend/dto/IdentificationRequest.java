package com.anyid.backend.dto;

import lombok.Data;

@Data
public class IdentificationRequest {
    private String imageBase64;
    private String category;
    private String language;
}
