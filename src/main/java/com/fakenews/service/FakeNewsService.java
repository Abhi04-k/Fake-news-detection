package com.fakenews.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.HashMap;

@Service
public class FakeNewsService {
    
    public Map<String, Object> detectFakeNews(String text) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://localhost:5001/predict";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("text", text);
        
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            // Make an HTTP POST request to the Python Flask AI Service
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, request, (Class<Map<String, Object>>)(Class<?>)Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("Error calling Python AI model: " + e.getMessage());
            
            // Fallback response if the Python AI service is turned off or unreachable
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("prediction", "Connection Error");
            errorResult.put("confidence", "0.00");
            errorResult.put("error", "The backend AI service (Python Flask Model on port 5000) is currently offline. Please start it to use AI inference.");
            return errorResult;
        }
        
        return new HashMap<>();
    }
}
