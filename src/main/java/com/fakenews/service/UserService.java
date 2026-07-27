package com.fakenews.service;

import com.fakenews.model.User;
import com.fakenews.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Generate 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setVerified(false);
        
        User savedUser = userRepository.save(user);
        
        // Send OTP
        emailService.sendVerificationEmail(user.getEmail(), otp);
        
        return savedUser;
    }

    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email);
        if (user != null && user.getOtp() != null && user.getOtp().equals(otp)) {
            user.setVerified(true);
            user.setOtp(null); // Clear OTP after verification
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            if (!user.isVerified()) {
                throw new RuntimeException("Account not verified. Please verify your email with the OTP sent during registration.");
            }
            return user;
        }
        return null;
    }
    public void generatePasswordResetOtp(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("No account found with that email address.");
        }
        
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        userRepository.save(user);
        
        emailService.sendPasswordResetEmail(user.getEmail(), otp);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email);
        if (user == null || user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP or Email.");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null); 
        userRepository.save(user);
    }
}
