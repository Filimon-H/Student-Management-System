package com.school.service;

import org.springframework.stereotype.Component;

@Component
public class GradingEngine {

    public String toLetter(double total) {
        if (total >= 70) return "A";
        if (total >= 60) return "B";
        if (total >= 50) return "C";
        if (total >= 45) return "D";
        if (total >= 40) return "E";
        return "F";
    }

    public String toRemark(double total) {
        if (total >= 70) return "Excellent";
        if (total >= 60) return "Very Good";
        if (total >= 50) return "Good";
        if (total >= 45) return "Pass";
        if (total >= 40) return "Poor";
        return "Fail";
    }

    public double toGpaPoints(String letter) {
        return switch (letter) {
            case "A" -> 4.0;
            case "B" -> 3.0;
            case "C" -> 2.0;
            case "D" -> 1.5;
            case "E" -> 1.0;
            default -> 0.0;
        };
    }

    public String getSuffix(int position) {
        if (position % 100 >= 11 && position % 100 <= 13) return position + "th";
        return switch (position % 10) {
            case 1 -> position + "st";
            case 2 -> position + "nd";
            case 3 -> position + "rd";
            default -> position + "th";
        };
    }

    public double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
