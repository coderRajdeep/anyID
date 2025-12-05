package com.anyid.backend.dto;

import lombok.Data;

@Data
public class ComparisonRequest {
    private String image1Base64;
    private String image2Base64;
}
