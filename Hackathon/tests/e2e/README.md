# End-to-End (E2E) Workflow Guide

The complete 5-step dispute demonstration workflow:
1. Courier logs in (`courier@demo.com`) -> uploads delivery evidence with photo and receiver signature.
2. Evidence service generates SHA-256 hash preventing modification.
3. Customer logs in (`customer@demo.com`) -> searches tracking ID (`CP-2024-001`) -> creates dispute: "Package Not Received".
4. Admin logs in (`admin@demo.com`) -> opens Dispute Investigation Center -> verifies delivery notes -> resolves dispute with mandatory justification.
5. All actions are appended to `courierproof_audit` and visualized live in the frontend.

