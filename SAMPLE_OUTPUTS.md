# Sample API Responses

## POST /api/auth/signup
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "createdAt": "2026-05-17T10:00:00.000Z"
  }
}
```

## GET /api/notes?sort=updated
```json
{
  "notes": [
    {
      "id": "note-uuid-001",
      "title": "Sprint Planning Notes",
      "body": "Discussed Q2 roadmap priorities...",
      "category": "work",
      "tags": ["sprint", "planning", "work"],
      "archived": false,
      "shareId": "abc123def456",
      "isPublic": true,
      "summary": "Q2 sprint planning covering AI features and auth refactor.",
      "actionItems": ["Ship AI feature", "Refactor auth module"],
      "suggestedTitle": "Q2 Sprint Planning",
      "aiGenerated": true,
      "aiCallCount": 3,
      "createdAt": "2026-05-14T08:00:00.000Z",
      "updatedAt": "2026-05-17T09:30:00.000Z"
    }
  ],
  "total": 1
}
```

## POST /api/notes/:id/generate-summary
```json
{
  "summary": "Weekly project planning discussion covering Q2 roadmap priorities including AI feature shipping, auth refactoring, and search performance improvements.",
  "tokensUsed": 312
}
```

## POST /api/notes/:id/generate-actions
```json
{
  "actionItems": [
    "Prepare UI mockups for dashboard",
    "Review API structure with team",
    "Schedule design review meeting",
    "Fix critical auth bugs before release"
  ],
  "tokensUsed": 289
}
```

## POST /api/notes/:id/generate-title
```json
{
  "suggestedTitle": "Q2 Sprint Planning and Roadmap Review",
  "tokensUsed": 178
}
```

## GET /api/insights
```json
{
  "totals": {
    "total_notes": "12",
    "archived_notes": "2",
    "ai_notes": "7",
    "public_notes": "3"
  },
  "topTags": [
    { "tag": "work", "count": "5" },
    { "tag": "productivity", "count": "4" },
    { "tag": "planning", "count": "3" }
  ],
  "recentNotes": [
    {
      "id": "note-uuid-001",
      "title": "Sprint Planning Notes",
      "category": "work",
      "updated_at": "2026-05-17T09:30:00.000Z",
      "ai_generated": true
    }
  ],
  "aiUsage": [
    { "action_type": "summary", "count": "6" },
    { "action_type": "actions", "count": "5" },
    { "action_type": "title", "count": "4" }
  ],
  "weeklyActivity": [
    { "day": "2026-05-11", "count": "2" },
    { "day": "2026-05-13", "count": "3" },
    { "day": "2026-05-17", "count": "4" }
  ]
}
```

## GET /api/shared/:shareId (public, no auth)
```json
{
  "note": {
    "id": "note-uuid-001",
    "title": "Sprint Planning Notes",
    "body": "Discussed Q2 roadmap priorities...",
    "category": "work",
    "tags": ["sprint", "planning"],
    "summary": "Q2 sprint planning covering AI features.",
    "actionItems": ["Ship AI feature", "Refactor auth"],
    "authorName": "Ada Lovelace",
    "createdAt": "2026-05-14T08:00:00.000Z",
    "updatedAt": "2026-05-17T09:30:00.000Z"
  }
}
```
