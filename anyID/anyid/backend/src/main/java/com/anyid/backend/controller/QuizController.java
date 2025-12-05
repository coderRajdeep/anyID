package com.anyid.backend.controller;

import com.anyid.backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final GeminiService geminiService;

    public QuizController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateQuiz(@RequestBody Map<String, String> request) {
        String category = request.get("category");
        if (category == null || category.isEmpty()) {
            return ResponseEntity.badRequest().body("Category is required");
        }
        String language = request.get("language");
        String quizType = request.get("quizType"); // "text" or "image"
        try {
            String quizJson = geminiService.generateQuiz(category, language, quizType);
            return ResponseEntity.ok(quizJson);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating quiz: " + e.getMessage());
        }
    }
}
