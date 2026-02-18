package com.school.service;

import org.springframework.stereotype.Component;

@Component
public class GradingEngine {

    public String toLetter(double percentage) {
        if (percentage >= 90) return "A";
        if (percentage >= 80) return "B";
        if (percentage >= 70) return "C";
        if (percentage >= 60) return "D";
        return "F";
    }

    public double toGpaPoints(String letter) {
        return switch (letter) {
            case "A" -> 4.0;
            case "B" -> 3.0;
            case "C" -> 2.0;
            case "D" -> 1.0;
            default -> 0.0;
        };
    }

    public double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
