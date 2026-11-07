import sqlite3
import os

db_path = os.path.abspath('backend/foodrescue.db')
print(f"Connecting to DB at: {db_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

print("\n=== 1. Most Recent Food Submissions in SQLite ===")
c.execute("SELECT id, food_name, category, quantity, unit, status, created_at FROM food_submissions ORDER BY created_at DESC LIMIT 5")
rows = c.fetchall()
for r in rows:
    print(r)

print("\n=== 2. Most Recent Redistrubutions in SQLite ===")
c.execute("SELECT id, submission_id, matched_recipient_id, match_score, status, created_at FROM redistributions ORDER BY created_at DESC LIMIT 5")
redists = c.fetchall()
for r in redists:
    print(r)

print("\n=== 3. Most Recent Pickup Tasks in SQLite ===")
c.execute("SELECT id, redistribution_id, recipient_name, current_status, created_at FROM pickup_tasks ORDER BY created_at DESC LIMIT 5")
pickups = c.fetchall()
for p in pickups:
    print(p)

print("\n=== 4. Deduplication & Persistence Check on Recent Submissions ===")
c.execute("SELECT id, food_name, status FROM food_submissions ORDER BY created_at DESC LIMIT 5")
recent_subs = c.fetchall()
for sub_id, name, status in recent_subs:
    c.execute("SELECT id, status FROM redistributions WHERE submission_id = ?", (sub_id,))
    linked_redists = c.fetchall()
    print(f"\nSubmission '{name}' (ID: {sub_id}) Status: '{status}'")
    print(f"  Linked redistributions count: {len(linked_redists)}")
    for rid, rstatus in linked_redists:
        c.execute("SELECT id, current_status FROM pickup_tasks WHERE redistribution_id = ?", (rid,))
        linked_pickups = c.fetchall()
        print(f"    Redistribution ID: {rid}, Status: {rstatus}, Pickup tasks count: {len(linked_pickups)}")

conn.close()
