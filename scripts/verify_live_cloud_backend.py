import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
base_url = "https://po-forge.onrender.com/api/v1"

print("=========================================================")
print(f"      LIVE PRODUCTION VERIFICATION: {base_url}           ")
print("=========================================================")

# 1. Health check
health_req = urllib.request.Request("https://po-forge.onrender.com/health", headers={"User-Agent": "POForge-Verifier/1.0"})
with urllib.request.urlopen(health_req, context=ctx, timeout=30) as res:
    health_resp = json.loads(res.read().decode("utf-8"))
    print("[1. HEALTH CHECK 200 OK]")
    print(json.dumps(health_resp, indent=2))

# 2. Login
login_data = json.dumps({"email": "student@poforge.ai", "password": "password123"}).encode("utf-8")
login_req = urllib.request.Request(
    f"{base_url}/auth/login",
    data=login_data,
    headers={"Content-Type": "application/json", "User-Agent": "POForge-Verifier/1.0"}
)

with urllib.request.urlopen(login_req, context=ctx, timeout=30) as res:
    auth_resp = json.loads(res.read().decode("utf-8"))
    token = auth_resp["access_token"]
    print("\n[2. AUTH LOGIN 200 OK]")
    print(f"User ID:      {auth_resp['user_id']}")
    print(f"Access Token: {token[:30]}...")

# 3. Question Search Pool (Quarantine Check)
search_req = urllib.request.Request(
    f"{base_url}/questions/search?limit=100",
    headers={"Authorization": f"Bearer {token}", "User-Agent": "POForge-Verifier/1.0"}
)

with urllib.request.urlopen(search_req, context=ctx, timeout=30) as res:
    questions = json.loads(res.read().decode("utf-8"))
    print("\n[3. QUESTION SEARCH POOL]")
    print(f"Total Published Questions Returned: {len(questions)}")
    if len(questions) > 0:
        print("\nFirst 3 Questions:")
        for q in questions[:3]:
            print(f"- [{q.get('question_id')}] ({q.get('topic_code')}) {q.get('text')[:80]}...")
            print(f"  Options: {q.get('options')[:2]}...")
            print(f"  Correct Option Index: {q.get('correct_option_index')}")

# 4. Hermes Tutor Chat Check
chat_data = json.dumps({
    "user_message": "Can you give me a quick diagnostic on my performance?",
    "task_category": "TUTORING"
}).encode("utf-8")

chat_req = urllib.request.Request(
    f"{base_url}/hermes/chat",
    data=chat_data,
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json", "User-Agent": "POForge-Verifier/1.0"}
)

with urllib.request.urlopen(chat_req, context=ctx, timeout=30) as res:
    chat_resp = json.loads(res.read().decode("utf-8"))
    print("\n[4. HERMES AI COACH CHAT 200 OK]")
    print(f"Model Used: {chat_resp.get('model_used')}")
    print(f"Response:   {chat_resp.get('response')[:150]}...")
    print(f"Tools Used: {chat_resp.get('tool_calls')}")
