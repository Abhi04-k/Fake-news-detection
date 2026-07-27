package com.fakenews.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@fakenews.com");
            message.setTo(toEmail);
            message.setSubject("OTP Verification - AI Fake News Detector");
            message.setText("Your OTP verification code is: " + otp);
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            // We just swallow it for local development if mail credentials aren't set
        }
    }

    public void sendPasswordResetEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@fakenews.com");
            message.setTo(toEmail);
            message.setSubject("Password Reset - AI Fake News Detector");
            message.setText("Your OTP verification code to reset your password is: " + otp + "\n\nIf you did not request this, please ignore this email.");
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }
    }
}
