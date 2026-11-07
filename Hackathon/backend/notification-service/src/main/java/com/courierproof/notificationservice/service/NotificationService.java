package com.courierproof.notificationservice.service;

import com.courierproof.notificationservice.dto.CreateNotificationRequest;
import com.courierproof.notificationservice.model.Notification;
import com.courierproof.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(CreateNotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .email(request.getEmail())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}

