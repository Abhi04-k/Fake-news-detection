package com.fakenews.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news_history")
public class NewsHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    @Column(columnDefinition = "TEXT")
    private String text;

    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    private String prediction;
    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    private String confidence;
    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    @Column(columnDefinition = "TEXT")
    private String source;

    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    @Column(name = "sentence_breakdown", columnDefinition = "LONGTEXT")
    private String sentenceBreakdown;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSentenceBreakdown() { return sentenceBreakdown; }
    public void setSentenceBreakdown(String sentenceBreakdown) { this.sentenceBreakdown = sentenceBreakdown; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
