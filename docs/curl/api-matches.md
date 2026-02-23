# cURL Examples: Match Management

## 1. Create Match
**Note:** Only Owners.
```bash
curl -X POST http://localhost:3000/api/matches 
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "groupId": "GROUP_UUID",
    "sport": "football",
    "scheduledAt": "2026-03-01T10:00:00Z",
    "durationMinutes": 60,
    "capacity": 10,
    "location": "Central Park Field A",
    "teamAColor": {"r": 1, "g": 0, "b": 0},
    "teamBColor": {"r": 0, "g": 0, "b": 1}
  }'
```

## 2. Update Match Metadata
```bash
curl -X PATCH http://localhost:3000/api/matches/MATCH_UUID 
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "location": "Updated Stadium",
    "capacity": 12
  }'
```

## 3. List Group Matches
```bash
curl -X GET http://localhost:3000/api/groups/GROUP_UUID/matches 
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 4. Join Match (Self)
```bash
curl -X POST http://localhost:3000/api/matches/MATCH_UUID/participants 
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. List Participants (Merit Ordered)
```bash
curl -X GET http://localhost:3000/api/matches/MATCH_UUID/participants 
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 6. Leave Match
```bash
curl -X DELETE http://localhost:3000/api/matches/MATCH_UUID/participants/me 
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 7. Update Match Status (Ciclo de Vida)
```bash
# To playing (seals reserves)
curl -X PATCH http://localhost:3000/api/matches/MATCH_UUID/status 
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"status": "playing"}'

# To finished (enables evaluations)
curl -X PATCH http://localhost:3000/api/matches/MATCH_UUID/status 
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"status": "finished"}'
```

## 8. Evaluate Participant
**Note:** Only in 'finished' status.
```bash
curl -X PATCH http://localhost:3000/api/matches/MATCH_UUID/participants/USER_UUID/evaluation 
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "didPlay": true,
    "attitude": "positive"
  }'
```

## 9. Lock Match
```bash
curl -X PATCH http://localhost:3000/api/matches/MATCH_UUID/lock 
  -H "Authorization: Bearer YOUR_OWNER_TOKEN"
```
