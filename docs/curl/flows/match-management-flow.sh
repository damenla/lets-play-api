#!/bin/bash

# ==============================================================================
# Flow: Match Management Lifecycle
# Description: This script performs a complete self-contained flow:
# 1. Registers/Logins Owner and Player
# 2. Creates a Group
# 3. Creates a Match -> Joins -> Starts -> Finishes -> Evaluates -> Locks
# ==============================================================================

API_URL="http://localhost:3000"

# Helper function to extract JSON values without jq
extract_json() {
    echo $1 | grep -o "\"$2\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

echo "🚀 Starting Full Match Management Flow..."

# 1. Setup Users
echo "------------------------------------------------"
echo "1. Registering/Logging in Users..."

# Owner
curl -s -X POST "$API_URL/api/auth/register" -H "Content-Type: application/json" \
  -d '{"username":"owner_flow","email":"owner@flow.com","name":"Owner Flow","password":"password123"}' > /dev/null

OWNER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"owner_flow","password":"password123"}')
OWNER_TOKEN=$(extract_json "$OWNER_LOGIN" "token")

# Player
curl -s -X POST "$API_URL/api/auth/register" -H "Content-Type: application/json" \
  -d '{"username":"player_flow","email":"player@flow.com","name":"Player Flow","password":"password123"}' > /dev/null

PLAYER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"player_flow","password":"password123"}')
PLAYER_TOKEN=$(extract_json "$PLAYER_LOGIN" "token")

# Get Player ID for later evaluation
PLAYER_PROFILE=$(curl -s -X GET "$API_URL/api/users/me" -H "Authorization: Bearer $PLAYER_TOKEN")
PLAYER_ID=$(extract_json "$PLAYER_PROFILE" "id")

if [ -z "$OWNER_TOKEN" ] || [ -z "$PLAYER_ID" ]; then
    echo "❌ Error: Failed to setup users. Is the server running at $API_URL?"
    exit 1
fi
echo "✅ Users ready. Player ID: $PLAYER_ID"

# 2. Create Group
echo "------------------------------------------------"
echo "2. Creating Group..."
GROUP_RES=$(curl -s -X POST "$API_URL/api/groups" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Flow League", "description": "Testing match lifecycle"}')
GROUP_ID=$(extract_json "$GROUP_RES" "id")

if [ -z "$GROUP_ID" ]; then
    echo "❌ Error: Failed to create group."
    echo "Response: $GROUP_RES"
    exit 1
fi
echo "✅ Group created ID: $GROUP_ID"

# Invite player to group and accept
curl -s -X POST "$API_URL/api/groups/$GROUP_ID/members" \
  -H "Authorization: Bearer $OWNER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"userId\": \"$PLAYER_ID\"}" > /dev/null
curl -s -X PATCH "$API_URL/api/groups/$GROUP_ID/invitations" \
  -H "Authorization: Bearer $PLAYER_TOKEN" -H "Content-Type: application/json" \
  -d '{"status": "accepted"}' > /dev/null
echo "✅ Player invited and joined group."

# 3. Create Match
echo "------------------------------------------------"
echo "3. Creating Match..."

# Cross-platform date calculation (macOS -v vs Linux -d)
if date -v+1d >/dev/null 2>&1; then
    TOMORROW=$(date -v+1d -u +%Y-%m-%dT%H:%M:%SZ)
else
    TOMORROW=$(date -d "+1 day" -u +%Y-%m-%dT%H:%M:%SZ)
fi

MATCH_RES=$(curl -s -X POST "$API_URL/api/matches" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"groupId\": \"$GROUP_ID\",
    \"sport\": \"football\",
    \"scheduledAt\": \"$TOMORROW\",
    \"durationMinutes\": 90,
    \"capacity\": 10,
    \"location\": \"Flow Stadium\",
    \"teamAColor\": {\"r\": 1, \"g\": 0, \"b\": 0},
    \"teamBColor\": {\"r\": 1, \"g\": 1, \"b\": 1}
  }")
MATCH_ID=$(extract_json "$MATCH_RES" "id")

if [ -z "$MATCH_ID" ]; then
    echo "❌ Error: Failed to create match."
    echo "Response: $MATCH_RES"
    exit 1
fi
echo "✅ Match created ID: $MATCH_ID"

# 4. Join Match
echo "------------------------------------------------"
echo "4. Player joining match..."
curl -s -X POST "$API_URL/api/matches/$MATCH_ID/participants" \
  -H "Authorization: Bearer $PLAYER_TOKEN" | grep -q "matchId" && echo "✅ Joined successfully."

# 5. Lifecycle: Planning -> Playing
echo "------------------------------------------------"
echo "5. Starting match (Status: playing)..."
curl -s -X PATCH "$API_URL/api/matches/$MATCH_ID/status" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "playing"}' | grep -q "playing" && echo "✅ Match is now playing."

# 6. Lifecycle: Playing -> Finished
echo "------------------------------------------------"
echo "6. Finishing match (Status: finished)..."
curl -s -X PATCH "$API_URL/api/matches/$MATCH_ID/status" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "finished"}' | grep -q "finished" && echo "✅ Match finished."

# 7. Evaluation
echo "------------------------------------------------"
echo "7. Evaluating player performance..."
curl -s -X PATCH "$API_URL/api/matches/$MATCH_ID/participants/$PLAYER_ID/evaluation" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"didPlay": true, "attitude": "positive"}' && echo "✅ Evaluation submitted."

# 8. Lock Match
echo "------------------------------------------------"
echo "8. Locking match (Final step)..."
curl -s -X PATCH "$API_URL/api/matches/$MATCH_ID/lock" \
  -H "Authorization: Bearer $OWNER_TOKEN" && echo "✅ Match locked. Inmutable."

echo "------------------------------------------------"
echo "✨ Full flow completed successfully!"
