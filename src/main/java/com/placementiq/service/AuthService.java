package com.placementiq.service;

import com.placementiq.model.Role;
import com.placementiq.model.StudentProfile;
import com.placementiq.model.User;
import com.placementiq.repository.StudentProfileRepository;
import com.placementiq.repository.UserRepository;
import com.placementiq.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public Map<String, Object> register(String username, String password, String email, String roleStr) {
        Map<String, Object> response = new HashMap<>();
        if (userRepository.existsByUsername(username)) {
            response.put("error", "Username already exists");
            return response;
        }
        if (userRepository.existsByEmail(email)) {
            response.put("error", "Email already exists");
            return response;
        }

        Role role = Role.STUDENT;
        if (roleStr != null && roleStr.equalsIgnoreCase("ADMIN")) {
            role = Role.ADMIN;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(role);
        User savedUser = userRepository.save(user);

        if (role == Role.STUDENT) {
            StudentProfile profile = new StudentProfile();
            profile.setUser(savedUser);
            studentProfileRepository.save(profile);
        }

        response.put("message", "User registered successfully");
        response.put("username", username);
        return response;
    }

    public Map<String, Object> login(String username, String password) {
        Map<String, Object> response = new HashMap<>();
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (Exception e) {
            response.put("error", "Invalid username or password");
            return response;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String token = jwtUtil.generateToken(userDetails);
        
        User user = userRepository.findByUsername(username).orElseThrow();

        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        return response;
    }

    public Map<String, Object> forgotPassword(String username, String email, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("error", "Username not found");
            return response;
        }
        User user = userOpt.get();
        if (!user.getEmail().equalsIgnoreCase(email)) {
            response.put("error", "Email address does not match this username");
            return response;
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        response.put("message", "Password reset successfully");
        return response;
    }
}
