package com.courierproof.notificationservice.dto;

import lombok.Data;

@Data
public class CreateNotificationRequest {
    private Long userId;
    private String email;
    private String type;
    private String title;
    private String message;
}

