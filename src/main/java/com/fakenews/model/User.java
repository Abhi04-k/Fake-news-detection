package com.fakenews.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    private String name;
    
    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    @Column(columnDefinition = "TEXT")
    private String email;

    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    @Column(columnDefinition = "TEXT")
    private String password;

    private boolean verified = false;

    @Convert(converter = com.fakenews.util.EncryptionUtil.class)
    private String otp;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
