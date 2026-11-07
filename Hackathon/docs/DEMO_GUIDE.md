# CourierProof End-to-End Demonstration Guide

## Step-by-Step Live Demo (5-Minute Hackathon Presentation)

### Step 1: Open Application & Track Shipment
1. Navigate to `http://localhost:5173/shipments`.
2. Enter tracking code `CP-2024-001` and click **Track**.
3. Point out the shipment status (`DELIVERED`) and the timeline showing history checkpoints.

### Step 2: Courier Evidence Upload (CO2 Proof)
1. Log in as `courier@demo.com` (Password: `demo1234`).
2. Navigate to **Delivery Evidence**.
3. Upload an image, input receiver name, and click **Submit Delivery Proof**.
4. Show the jury the resulting **SHA-256 Checksum** and UUID. Explain that this hash guarantees cryptographic evidence integrity.

### Step 3: Customer Raises Dispute (CO1 Orchestration)
1. Log in as `customer@demo.com` (Password: `demo1234`).
2. Go to **Disputes** and click **Raise Dispute**.
3. Submit tracking code `CP-2024-001`, select "Package Not Received", and submit.
4. Highlight that Dispute Service validated shipment existence with the Shipment Service before persisting the dispute record.

### Step 4: Admin Arbitration (CO2 RBAC & Business Flow)
1. Log in as `admin@demo.com` (Password: `demo1234`).
2. Open **Admin Review**.
3. Click the newly raised dispute.
4. Add an investigation note and click **Resolve Dispute**.
5. Show that the status transitions to `RESOLVED` and resolution notes are permanently saved.

### Step 5: Service Registry & Security Test (CO3 & CO4)
1. Open Eureka Dashboard at `http://localhost:8761` to show all microservices registered and active.
2. Visit **Security & Observability** in the frontend and trigger the **Unauthorized Request Test** to show the live `403 Forbidden` response.
3. Open **CO Mapping** to show complete syllabus alignment.

