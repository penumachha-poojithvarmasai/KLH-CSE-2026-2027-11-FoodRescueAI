-- ========================================================
-- CourierProof Enterprise Microservices Schema Init
-- ========================================================

CREATE DATABASE IF NOT EXISTS courierproof_auth;
CREATE DATABASE IF NOT EXISTS courierproof_shipments;
CREATE DATABASE IF NOT EXISTS courierproof_evidence;
CREATE DATABASE IF NOT EXISTS courierproof_disputes;
CREATE DATABASE IF NOT EXISTS courierproof_audit;
CREATE DATABASE IF NOT EXISTS courierproof_notifications;

-- Optional: Create unified service account if needed
-- GRANT ALL PRIVILEGES ON courierproof_*.* TO 'root'@'%';
-- FLUSH PRIVILEGES;

