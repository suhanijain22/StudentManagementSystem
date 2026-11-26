package com.example.sms.config;

import com.example.sms.entity.*;
import com.example.sms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.seed", havingValue = "true")
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UserRepository users;
    private final StudentProfileRepository students;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, StudentProfileRepository students, PasswordEncoder encoder) {
        this.users = users; this.students = students; this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) return;
        users.save(User.builder().name("Mrs. Sharma").email("teacher@school.com")
                .password(encoder.encode("password123")).role(Role.TEACHER).build());
        Object[][] data = {
                {"Aarav Patil", 120}, {"Diya Deshmukh", 95}, {"Rohan Kulkarni", 95}, {"Isha Joshi", 80},
                {"Kabir Singh", 60}, {"Meera Nair", 45}, {"Vihaan Gupta", 45}, {"Anaya Rao", 10}};
        int i = 1;
        for (Object[] row : data) {
            User u = users.save(User.builder().name((String) row[0]).email("student" + i++ + "@school.com")
                    .password(encoder.encode("password123")).role(Role.STUDENT).build());
            students.save(StudentProfile.builder().user(u).points((Integer) row[1]).build());
        }
        log.info("Seeded demo data: teacher@school.com and student1..8@school.com (password: password123)");
    }
}
