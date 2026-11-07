-- ========================================================
-- Seed Data for Demonstrating CourierProof
-- ========================================================

-- Auth Service Seed (Passwords are BCrypt for 'demo1234')
USE courierproof_auth;
INSERT INTO users (email, password, role, created_at)
VALUES 
  ('customer@demo.com', '$2a$10$wT2O8f5mG6f8T2M3/sQywe2z6m4rS7I9u1mN0pQv4X8t6a1B8g9W', 'CUSTOMER', NOW()),
  ('courier@demo.com', '$2a$10$wT2O8f5mG6f8T2M3/sQywe2z6m4rS7I9u1mN0pQv4X8t6a1B8g9W', 'COURIER', NOW()),
  ('admin@demo.com', '$2a$10$wT2O8f5mG6f8T2M3/sQywe2z6m4rS7I9u1mN0pQv4X8t6a1B8g9W', 'ADMIN', NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Shipment Service Seed
USE courierproof_shipments;
INSERT INTO shipments (tracking_id, customer_id, courier_id, origin_address, destination_address, current_status, recipient_name, recipient_phone, created_at)
VALUES
  ('CP-2024-001', 1, 2, '123 Sender St, Mumbai, MH', '456 Receiver Ave, Delhi, DL', 'DELIVERED', 'Rahul Sharma', '9876543210', NOW()),
  ('CP-2024-002', 1, 2, '789 Shop Rd, Bangalore, KA', '456 Receiver Ave, Delhi, DL', 'IN_TRANSIT', 'Rahul Sharma', '9876543210', NOW()),
  ('CP-2024-003', 1, 2, '321 Warehouse, Chennai, TN', '456 Receiver Ave, Delhi, DL', 'OUT_FOR_DELIVERY', 'Rahul Sharma', '9876543210', NOW())
ON DUPLICATE KEY UPDATE tracking_id=tracking_id;

