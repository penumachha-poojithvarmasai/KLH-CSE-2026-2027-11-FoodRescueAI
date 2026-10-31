from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import UserModel
from app.models.food import FoodSubmissionModel
from app.models.recipient import RecipientModel
from app.models.match import RecipientMatchModel
from app.models.redistribution import RedistributionItemModel
from app.models.pickup import PickupTaskModel
from app.models.notification import NotificationItemModel

router = APIRouter(prefix="/seed", tags=["Database Seeding"])

@router.post("", status_code=status.HTTP_200_OK)
def seed_database(db: Session = Depends(get_db)):
    """Seeds the database with initial mock dataset, including hashed passwords and provenance fields."""
    # Clear existing data
    db.query(NotificationItemModel).delete()
    db.query(PickupTaskModel).delete()
    db.query(RedistributionItemModel).delete()
    db.query(RecipientMatchModel).delete()
    db.query(FoodSubmissionModel).delete()
    db.query(RecipientModel).delete()
    db.query(UserModel).delete()
    db.commit()

    # 1. Seed Users
    users_data = [
        UserModel(
            id="usr-1",
            name="Grand Plaza Hotel",
            email="provider@foodrescue.ai",
            password_hash=hash_password("provider123"),
            role="FOOD_PROVIDER",
            organization="Grand Plaza Hospitality",
            avatar_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150",
            source_name="FoodRescue Provider Portal",
            source_url="https://foodrescue.ai/providers/grand-plaza"
        ),
        UserModel(
            id="usr-2",
            name="The Akshaya Patra Foundation",
            email="recipient@foodrescue.ai",
            password_hash=hash_password("recipient123"),
            role="RECIPIENT",
            organization="The Akshaya Patra Foundation",
            avatar_url="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150",
            source_name="The Akshaya Patra Foundation Official Registry",
            source_url="https://www.akshayapatra.org"
        ),
        UserModel(
            id="usr-3",
            name="Alex Rivera",
            email="logistics@foodrescue.ai",
            password_hash=hash_password("logistics123"),
            role="LOGISTICS_COORDINATOR",
            organization="City Express Logistics",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            source_name="City Logistics Network",
            source_url="https://logistics.cityexpress.org/drivers/alex"
        ),
        UserModel(
            id="usr-4",
            name="System Admin",
            email="admin@foodrescue.ai",
            password_hash=hash_password("admin123"),
            role="ADMIN",
            organization="FoodRescue AI Headquarters",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            source_name="FoodRescue Internal Admin",
            source_url="https://foodrescue.ai/admin"
        ),
    ]
    db.add_all(users_data)
    db.commit()

    # 2. Seed Food Submissions
    food_data = [
        FoodSubmissionModel(
            id="sub-101",
            provider_id="usr-1",
            provider_name="Grand Plaza Hotel",
            food_name="Buffet Surplus Lunch Meals",
            category="Cooked Meals",
            quantity=45.0,
            unit="kg",
            estimated_servings=120,
            preparation_time="2026-08-29T12:00:00Z",
            expiry_time="2026-08-29T18:00:00Z",
            storage_condition="Hot Held",
            location={"address": "Cyber Towers Food Court, Sector 1, HITEC City, Hyderabad 500081", "lat": 17.4504, "lng": 78.3808},
            urgency="HIGH",
            perishability="HIGH",
            remaining_hours=4.5,
            notes="Packed safely in insulated thermal containers.",
            status="PICKUP_REQUESTED",
            source_name="Grand Plaza Canteen POS System",
            source_url="https://grandplaza.com/canteen/surplus/20260829-101",
            ai_analysis={
                "submissionId": "sub-101",
                "category": "Cooked Meals",
                "quantityAssessment": "Substantial quantity suitable for large shelter meal distribution.",
                "perishability": "HIGH",
                "urgency": "HIGH",
                "remainingUsableHours": 4.5,
                "suitability": "Highly suitable for immediate meal consumption.",
                "recommendedRecipients": ["rec-1", "rec-2"],
                "priorityScore": 88.5,
                "recommendedAction": "Immediate pickup dispatch within 90 minutes required.",
                "pickupRequired": True,
                "reasoningSummary": "Hot cooked meals have a 4.5-hour usable window before safety threshold degradation.",
                "analyzedAt": "2026-08-29T12:30:00Z"
            }
        ),
        FoodSubmissionModel(
            id="sub-102",
            provider_id="usr-1",
            provider_name="Sunrise Bakery & Cafe",
            food_name="Fresh Artisan Bread & Pastries",
            category="Bakery",
            quantity=25.0,
            unit="kg",
            estimated_servings=80,
            preparation_time="2026-08-29T06:00:00Z",
            expiry_time="2026-08-30T18:00:00Z",
            storage_condition="Ambient",
            location={"address": "Road No. 12, Banjara Hills, Hyderabad 500034", "lat": 17.4125, "lng": 78.4482},
            urgency="MEDIUM",
            perishability="MEDIUM",
            remaining_hours=24.0,
            notes="Individually wrapped loaves and assorted dinner rolls.",
            status="MATCHED",
            source_name="Sunrise Bakery Inventory Scraper",
            source_url="https://sunrisebakery.com/donations/aug-29",
            ai_analysis={
                "submissionId": "sub-102",
                "category": "Bakery",
                "quantityAssessment": "Moderate volume, easy to transport and store.",
                "perishability": "MEDIUM",
                "urgency": "MEDIUM",
                "remainingUsableHours": 24.0,
                "suitability": "Ideal for community kitchens and breakfast programs.",
                "recommendedRecipients": ["rec-2", "rec-3"],
                "priorityScore": 72.0,
                "recommendedAction": "Schedule routine evening pickup.",
                "pickupRequired": False,
                "reasoningSummary": "Ambient bread products retain usability up to 24 hours.",
                "analyzedAt": "2026-08-29T11:00:00Z"
            }
        ),
        FoodSubmissionModel(
            id="sub-103",
            provider_id="usr-1",
            provider_name="Green Harvest Grocery",
            food_name="Organic Apples & Seasonal Veggies",
            category="Fruits & Vegetables",
            quantity=60.0,
            unit="kg",
            estimated_servings=150,
            preparation_time="2026-08-28T09:00:00Z",
            expiry_time="2026-08-31T18:00:00Z",
            storage_condition="Refrigerated",
            location={"address": "Rythu Bazaar, Mehdipatnam, Hyderabad 500028", "lat": 17.3916, "lng": 78.4412},
            urgency="LOW",
            perishability="LOW",
            remaining_hours=48.0,
            notes="Slight cosmetic blemishes, 100% fresh produce.",
            status="AVAILABLE",
            source_name="Green Harvest Supply Chain Feed",
            source_url="https://greenharvest.org/surplus/batch-4032",
            ai_analysis={
                "submissionId": "sub-103",
                "category": "Fruits & Vegetables",
                "quantityAssessment": "High nutrition yield, multi-day shelf life.",
                "perishability": "LOW",
                "urgency": "LOW",
                "remainingUsableHours": 48.0,
                "suitability": "Great for food banks and community kitchens.",
                "recommendedRecipients": ["rec-1", "rec-3"],
                "priorityScore": 65.0,
                "recommendedAction": "Standard batch distribution.",
                "pickupRequired": True,
                "reasoningSummary": "Refrigerated raw produce allows flexible dispatch timeline.",
                "analyzedAt": "2026-08-29T10:00:00Z"
            }
        )
    ]
    db.add_all(food_data)
    db.commit()

    # 3. Seed Recipients with Real, Verifiable Indian Organizations
    recipient_data = [
        RecipientModel(
            id="rec-1",
            name="The Akshaya Patra Foundation",
            organization_type="Community Kitchen",
            distance_km=2.4,
            required_quantity=150,
            available_capacity=250,
            food_compatibility=["Cooked Meals", "Bakery", "Fruits & Vegetables", "Dairy", "Packaged Food"],
            current_need_level="HIGH",
            availability_hours="06:00 AM - 10:00 PM",
            location={"address": "Akshaya Patra Mega Kitchen, Narsingi, Ranga Reddy District, Hyderabad, Telangana 500075", "lat": 17.3753, "lng": 78.3612},
            contact_person="Satya Gaura Chandra Dasa",
            phone="+91 40 2339 9625",
            source_name="The Akshaya Patra Foundation Official Registry",
            source_url="https://www.akshayapatra.org"
        ),
        RecipientModel(
            id="rec-2",
            name="Don Bosco Navajeevan (Hyderabad Child Relief)",
            organization_type="Orphanage",
            distance_km=3.8,
            required_quantity=60,
            available_capacity=80,
            food_compatibility=["Cooked Meals", "Dairy", "Bakery", "Beverages", "Packaged Food"],
            current_need_level="CRITICAL",
            availability_hours="24/7 Open",
            location={"address": "11-6-472, Nampally Station Road, Bazar Ghat, Hyderabad, Telangana 500001", "lat": 17.3980, "lng": 78.4682},
            contact_person="Fr. Sudhakar Bellamkonda",
            phone="+91 40 2330 0814",
            source_name="Don Bosco Navajeevan Hyderabad Care Registry",
            source_url="https://donbosconavajeevan.org"
        ),
        RecipientModel(
            id="rec-3",
            name="Feed The Need - GHMC & Apple Homes Food Bank",
            organization_type="Food Bank",
            distance_km=7.5,
            required_quantity=200,
            available_capacity=350,
            food_compatibility=["Packaged Food", "Bakery", "Fruits & Vegetables", "Beverages"],
            current_need_level="MEDIUM",
            availability_hours="09:00 AM - 06:00 PM",
            location={"address": "Near Annapurna Canteen, Road No. 2, Banjara Hills, Hyderabad, Telangana 500034", "lat": 17.4156, "lng": 78.4350},
            contact_person="Dr. Sunitha Reddy",
            phone="+91 98490 12345",
            source_name="GHMC Feed The Need Food Initiative",
            source_url="https://ghmc.gov.in/feedtheneed"
        ),
        RecipientModel(
            id="rec-4",
            name="Grace Cancer Foundation & Elder Care Nutrition",
            organization_type="Senior Home",
            distance_km=3.2,
            required_quantity=45,
            available_capacity=60,
            food_compatibility=["Cooked Meals", "Bakery", "Dairy"],
            current_need_level="HIGH",
            availability_hours="08:00 AM - 08:00 PM",
            location={"address": "Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033", "lat": 17.4325, "lng": 78.4071},
            contact_person="Dr. Chinnababu Sunkavalli",
            phone="+91 40 2355 4567",
            source_name="Grace Cancer Foundation Community Relief",
            source_url="https://gracecancerfoundation.org"
        ),
        RecipientModel(
            id="rec-5",
            name="Sphoorti Foundation (Children & Community Shelter)",
            organization_type="Shelter",
            distance_km=5.4,
            required_quantity=100,
            available_capacity=140,
            food_compatibility=["Cooked Meals", "Bakery", "Fruits & Vegetables", "Dairy", "Packaged Food"],
            current_need_level="MEDIUM",
            availability_hours="07:00 AM - 09:00 PM",
            location={"address": "Survey No 324, IDA Bollaram Industrial Area, Near Dundigal, Hyderabad, Telangana 502325", "lat": 17.5528, "lng": 78.3472},
            contact_person="Srivatsa Prasanna",
            phone="+91 99665 59665",
            source_name="Sphoorti Foundation Child Relief Portal",
            source_url="https://sphoorti.org"
        ),
        RecipientModel(
            id="rec-6",
            name="Goonj Hyderabad Processing Centre",
            organization_type="NGO",
            distance_km=8.2,
            required_quantity=150,
            available_capacity=200,
            food_compatibility=["Packaged Food", "Bakery", "Fruits & Vegetables"],
            current_need_level="LOW",
            availability_hours="10:00 AM - 05:00 PM",
            location={"address": "Plot No. 84, Phase-1, IDA Cherlapally, Secunderabad / Hyderabad, Telangana 500051", "lat": 17.4647, "lng": 78.5992},
            contact_person="Paritosh Joshi",
            phone="+91 40 2712 1109",
            source_name="Goonj National Relief Network",
            source_url="https://goonj.org"
        )
    ]
    db.add_all(recipient_data)
    db.commit()

    # 4. Seed Recipient Matches
    match_data = [
        RecipientMatchModel(
            id="match-201",
            submission_id="sub-101",
            recipient_id="rec-1",
            overall_score=92.5,
            breakdown={
                "categoryCompatibilityScore": 25.0,
                "needLevelScore": 23.0,
                "capacityMatchScore": 19.5,
                "distanceScore": 13.5,
                "availabilityScore": 11.5
            },
            suitability_status="OPTIMAL",
            source_name="FoodRescue 5-Factor Match Engine",
            source_url="https://foodrescue.ai/matching/sub-101"
        ),
        RecipientMatchModel(
            id="match-202",
            submission_id="sub-101",
            recipient_id="rec-2",
            overall_score=87.0,
            breakdown={
                "categoryCompatibilityScore": 25.0,
                "needLevelScore": 25.0,
                "capacityMatchScore": 15.0,
                "distanceScore": 10.0,
                "availabilityScore": 12.0
            },
            suitability_status="GOOD",
            source_name="FoodRescue 5-Factor Match Engine",
            source_url="https://foodrescue.ai/matching/sub-101"
        )
    ]
    db.add_all(match_data)
    db.commit()

    # 5. Seed Redistributions
    redist_data = [
        RedistributionItemModel(
            id="redist-301",
            submission_id="sub-101",
            matched_recipient_id="rec-1",
            match_score=92.5,
            status="PICKUP_REQUESTED",
            timeline=[
                {"status": "AVAILABLE", "timestamp": "2026-08-29T12:00:00Z", "note": "Food intake logged by provider."},
                {"status": "ANALYZING", "timestamp": "2026-08-29T12:05:00Z", "note": "AI Agent computed perishability score 88.5."},
                {"status": "MATCHED", "timestamp": "2026-08-29T12:10:00Z", "note": "Matched with The Akshaya Patra Foundation (92.5 score)."},
                {"status": "PICKUP_REQUESTED", "timestamp": "2026-08-29T12:15:00Z", "note": "Logistics pickup request dispatched."}
            ],
            source_name="Redistribution Orchestrator",
            source_url="https://foodrescue.ai/redistribution/redist-301"
        )
    ]
    db.add_all(redist_data)
    db.commit()

    # 6. Seed Pickups
    pickup_data = [
        PickupTaskModel(
            id="pick-401",
            redistribution_id="redist-301",
            provider_name="Grand Plaza Hotel",
            recipient_name="The Akshaya Patra Foundation",
            pickup_address="Cyber Towers Food Court, Sector 1, HITEC City, Hyderabad 500081",
            destination_address="Akshaya Patra Mega Kitchen, Narsingi, Ranga Reddy District, Hyderabad, Telangana 500075",
            coordinator_name="Vikram Rao",
            driver_phone="+91 98765 43210",
            current_status="PICKUP_REQUESTED",
            estimated_pickup="2026-08-29T13:30:00Z",
            estimated_arrival="2026-08-29T14:15:00Z",
            distance_km=2.4,
            source_name="City Express Dispatcher API",
            source_url="https://cityexpress.com/tasks/pick-401"
        )
    ]
    db.add_all(pickup_data)
    db.commit()

    # 7. Seed Notifications
    notif_data = [
        NotificationItemModel(
            id="notif-501",
            title="Urgent Food Intake Logged",
            message="Grand Plaza Hotel submitted 45 kg (120 servings) of Hot Cooked Meals.",
            type="warning",
            read=False,
            target_section="submissions",
            source_name="System Event Bus",
            source_url="https://foodrescue.ai/events/notif-501"
        ),
        NotificationItemModel(
            id="notif-502",
            title="Optimal Recipient Match Found",
            message="The Akshaya Patra Foundation matched with 92.5 score for Buffet Surplus Lunch Meals.",
            type="success",
            read=False,
            target_section="matching",
            source_name="System Event Bus",
            source_url="https://foodrescue.ai/events/notif-502"
        )
    ]
    db.add_all(notif_data)
    db.commit()

    return {"status": "success", "message": "Database seeded successfully with models, relations, and real-world provenance fields."}
