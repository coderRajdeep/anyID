package com.anyid.backend.controller;

import com.anyid.backend.dto.ChatRequest;
import com.anyid.backend.dto.ComparisonRequest;
import com.anyid.backend.dto.IdentificationRequest;
import com.anyid.backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:3000") // Allow Next.js
public class ImageController {

    private final GeminiService geminiService;

    public ImageController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/identify")
    public ResponseEntity<String> identify(@RequestBody IdentificationRequest request) {
        String result = geminiService.identify(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/compare")
    public ResponseEntity<String> compare(@RequestBody ComparisonRequest request) {
        String result = geminiService.compare(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody ChatRequest request) {
        String result = geminiService.chat(request.getMessage(), request.getInitialDescription());
        return ResponseEntity.ok(result);
    }
}
