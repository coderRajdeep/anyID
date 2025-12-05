package com.anyid.backend.service;

import com.anyid.backend.dto.ComparisonRequest;
import com.anyid.backend.dto.IdentificationRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String identify(IdentificationRequest request) {
        String prompt = createIdentificationPrompt(request.getCategory(), request.getLanguage());
        return callGeminiApi(prompt, request.getImageBase64(), "image/jpeg"); // Assuming jpeg for simplicity, or
                                                                              // extract from base64
    }

    public String compare(ComparisonRequest request) {
        String prompt = createComparisonPrompt();
        return callGeminiApiWithTwoImages(prompt, request.getImage1Base64(), request.getImage2Base64());
    }

    public String chat(String message, String context) {
        // Simple chat implementation
        String prompt = "Context: " + context + "\n\nUser Question: " + message;
        return callGeminiApiTextOnly(prompt);
    }

    private String callGeminiApi(String prompt, String base64Image, String mimeType) {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();

        // Text Part
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);

        // Image Part
        if (base64Image != null && !base64Image.isEmpty()) {
            Map<String, Object> imagePart = new HashMap<>();
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", mimeType);
            // Remove header if present (data:image/png;base64,)
            String cleanBase64 = base64Image.contains(",") ? base64Image.split(",")[1] : base64Image;
            inlineData.put("data", cleanBase64);
            imagePart.put("inline_data", inlineData);
            parts.add(imagePart);
        }

        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        return executeRequest(requestBody);
    }

    private String callGeminiApiWithTwoImages(String prompt, String base64Image1, String base64Image2) {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();

        // Text Part
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);

        // Image 1
        addInlineImage(parts, base64Image1);
        // Image 2
        addInlineImage(parts, base64Image2);

        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        return executeRequest(requestBody);
    }

    private void addInlineImage(List<Map<String, Object>> parts, String base64Image) {
        if (base64Image != null && !base64Image.isEmpty()) {
            Map<String, Object> imagePart = new HashMap<>();
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", "image/jpeg"); // Defaulting to jpeg
            String cleanBase64 = base64Image.contains(",") ? base64Image.split(",")[1] : base64Image;
            inlineData.put("data", cleanBase64);
            imagePart.put("inline_data", inlineData);
            parts.add(imagePart);
        }
    }

    private String callGeminiApiTextOnly(String prompt) {
        return callGeminiApi(prompt, null, null);
    }

    private String executeRequest(Map<String, Object> requestBody) {
        try {
            String url = apiUrl + "?key=" + apiKey;
            String response = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Parse response to get text
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText();
                    // Clean markdown json
                    return text.replace("```json", "").replace("```", "").trim();
                }
            }
            return "{}";
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage());
        }
    }

    private String createIdentificationPrompt(String category, String language) {
        String languagePrompt = (language == null || language.isEmpty()) ? "in English" : "in " + language;
        return "Identify the main subject in this image (Category: " + category + "). " +
                "Provide the response strictly as a valid JSON object " + languagePrompt + ". " +
                "The JSON structure must be: " +
                "{ " +
                "  \"name\": \"Name of the identified subject\", " +
                "  \"description\": \"A brief, engaging description (2-3 sentences).\", " +
                "  \"details\": { \"Key Label 1\": \"Value 1\" }, " +
                "  \"searchQuery\": \"A search query to find more information\" " +
                "} " +
                "Instructions for 'details': Provide 5-7 most relevant facts. " +
                "Do NOT use generic fields. Make keys human-readable. Ensure all values are strings. " +
                "Do not include markdown formatting.";
    }

    private String createComparisonPrompt() {
        return "Compare these two images in detail. " +
                "Provide the response strictly as a valid JSON object. " +
                "The JSON structure must be: " +
                "{ " +
                "  \"comparison\": [ " +
                "    { \"feature\": \"Subject/Identity\", \"image1\": \"...\", \"image2\": \"...\" }, " +
                "    { \"feature\": \"Category\", \"image1\": \"...\", \"image2\": \"...\" }, " +
                "    { \"feature\": \"Visual Style\", \"image1\": \"...\", \"image2\": \"...\" }, " +
                "    { \"feature\": \"Color Palette\", \"image1\": \"...\", \"image2\": \"...\" }, " +
                "    { \"feature\": \"Key Differences\", \"image1\": \"...\", \"image2\": \"...\" } " +
                "  ], " +
                "  \"conclusion\": \"A brief paragraph summarizing the comparison.\" " +
                "} " +
                "Do not include markdown formatting.";
    }
}
