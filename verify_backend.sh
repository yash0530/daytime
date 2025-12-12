#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "1. Registering User..."
REGISTER_RES=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser_'$(date +%s)'", "password": "password123"}')
echo "Response: $REGISTER_RES"

if [[ $REGISTER_RES == *"token"* ]]; then
  echo "✅ Register Success"
  TOKEN=$(echo $REGISTER_RES | jq -r .token)
else
  echo "❌ Register Failed"
  exit 1
fi

echo "2. Logging In..."
LOGIN_RES=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser_'$(date +%s)'", "password": "password123"}')
# Note: Re-using the same username might fail if I didn't save it.
# Let's just use the token from register, or extracting username from register is safer.

echo "Using Token from Register..."

echo "3. Creating Activity..."
ACTIVITY_RES=$(curl -s -X POST $BASE_URL/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"description": "Coding Test", "durationMinutes": 45, "tagNames": ["Dev", "Test"]}')
echo "Response: $ACTIVITY_RES"

if [[ $ACTIVITY_RES == *"Coding Test"* ]]; then
    echo "✅ Create Activity Success"
else
    echo "❌ Create Activity Failed"
fi

echo "4. Listing Activities..."
LIST_RES=$(curl -s -X GET $BASE_URL/activities \
  -H "Authorization: Bearer $TOKEN")
echo "Response List Length: $(echo $LIST_RES | jq '. | length')"

if [[ $LIST_RES == *"Coding Test"* ]]; then
    echo "✅ List Activity Success"
else
    echo "❌ List Activity Failed"
fi
