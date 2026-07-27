package com.fakenews.controller;

import com.fakenews.model.NewsHistory;
import com.fakenews.model.User;
import com.fakenews.repository.NewsHistoryRepository;
import com.fakenews.repository.UserRepository;
import com.fakenews.service.FakeNewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private FakeNewsService fakeNewsService;

    @Autowired
    private NewsHistoryRepository newsHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/detect")
    public ResponseEntity<?> detect(@RequestBody Map<String, Object> payload) {
        String text = (String) payload.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }
        
        Map<String, Object> result = fakeNewsService.detectFakeNews(text);
        
        // Save history if user is logged in
        if (payload.containsKey("userId") && payload.get("userId") != null) {
            try {
                Long userId = Long.valueOf(payload.get("userId").toString());
                Optional<User> userOpt = userRepository.findById(userId);
                
                if (userOpt.isPresent()) {
                    NewsHistory history = new NewsHistory();
                    history.setUser(userOpt.get());
                    history.setText(text);
                    history.setPrediction((String) result.get("prediction"));
                    history.setConfidence((String) result.get("confidence"));
                    history.setSource((String) result.get("source"));
                    
                    if (result.containsKey("sentence_breakdown")) {
                        ObjectMapper mapper = new ObjectMapper();
                        String breakdownJson = mapper.writeValueAsString(result.get("sentence_breakdown"));
                        history.setSentenceBreakdown(breakdownJson);
                    }
                    
                    newsHistoryRepository.save(history);
                }
            } catch (Exception e) {
                System.err.println("Failed to save news history: " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        List<NewsHistory> historyList = newsHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(historyList);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteHistoryItem(@PathVariable Long id) {
        if (newsHistoryRepository.existsById(id)) {
            newsHistoryRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "History item deleted"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "History item not found"));
    }

    @DeleteMapping("/history/all/{userId}")
    @Transactional
    public ResponseEntity<?> deleteAllHistory(@PathVariable Long userId) {
        newsHistoryRepository.deleteByUserId(userId);
        return ResponseEntity.ok().body(Map.of("message", "All history cleared"));
    }
}
