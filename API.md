# reHome API Documentation

> Version: v1  
> Base URL: `https://api.rehome.app/v1`  
> All requests and responses use `application/json` unless noted.

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

Tokens are issued on login/register (JWT, 24 h expiry). Use `POST /auth/refresh` to renew.

---

## Common Response Envelope

**Success**
```json
{
  "ok": true,
  "data": { ... }
}
```

**Error**
```json
{
  "ok": false,
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "No listing with that ID."
  }
}
```

**Paginated list**
```json
{
  "ok": true,
  "data": [ ... ],
  "meta": {
    "total": 128,
    "page": 1,
    "per_page": 20,
    "has_next": true
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 204  | No content (DELETE success) |
| 400  | Bad request / validation error |
| 401  | Not authenticated |
| 403  | Forbidden (not owner) |
| 404  | Resource not found |
| 409  | Conflict (e.g. email already registered) |
| 422  | Unprocessable (business logic error) |
| 500  | Internal server error |

---

## Error Codes

| code | Trigger |
|------|---------|
| `INVALID_EDU_EMAIL` | Email does not end in a recognized `.edu` domain |
| `EMAIL_TAKEN` | Email already registered |
| `WRONG_PASSWORD` | Login credentials invalid |
| `TOKEN_EXPIRED` | Access token expired — refresh or re-login |
| `LISTING_NOT_FOUND` | Listing ID does not exist |
| `NOT_LISTING_OWNER` | PATCH/DELETE called by non-owner |
| `CONVERSATION_EXISTS` | A conversation for this listing+user pair already exists |
| `TRANSLATION_FAILED` | AI translation service unavailable |

---

---

# 1. Auth

## POST `/auth/register`

Create a new account. Email must be a valid `.edu` address.

**Request body**
```json
{
  "name":     "Emma L.",
  "email":    "emma@bu.edu",
  "password": "hunter2secure",
  "school":   "Boston University"
}
```

**Response 201**
```json
{
  "ok": true,
  "data": {
    "access_token":  "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id":             "u_emma",
      "name":           "Emma L.",
      "handle":         "@emma.l",
      "email":          "emma@bu.edu",
      "school":         "Boston University",
      "edu_verified":   true,
      "local_verified": false,
      "rating":         null,
      "deals":          0,
      "bio":            "",
      "avatar_initials":"EL",
      "avatar_color":   "#C8553D",
      "created_at":     "2026-05-09T14:00:00Z"
    }
  }
}
```

---

## POST `/auth/login`

**Request body**
```json
{
  "email":    "emma@bu.edu",
  "password": "hunter2secure"
}
```

**Response 200** — same shape as register.

---

## POST `/auth/logout`

[auth] Requires auth.  
Invalidates the current refresh token server-side.

**Response 204** — no body.

---

## POST `/auth/refresh`

Exchange a refresh token for a new access token.

**Request body**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response 200**
```json
{
  "ok": true,
  "data": {
    "access_token":  "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

---

## POST `/auth/verify-edu`

[auth] Requires auth.  
Sends a verification email to the user's `.edu` address. Call `POST /auth/verify-edu/confirm` with the 6-digit code.

**Request body** — empty `{}`

**Response 200**
```json
{
  "ok": true,
  "data": { "message": "Verification email sent to emma@bu.edu" }
}
```

## POST `/auth/verify-edu/confirm`

**Request body**
```json
{ "code": "482910" }
```

**Response 200**
```json
{
  "ok": true,
  "data": { "edu_verified": true }
}
```

---

---

# 2. Users

## GET `/users/me`

[auth] Requires auth. Returns the authenticated user's full profile.

**Response 200**
```json
{
  "ok": true,
  "data": {
    "id":             "u_emma",
    "name":           "Emma L.",
    "handle":         "@emma.l",
    "email":          "emma@bu.edu",
    "school":         "Boston University",
    "edu_verified":   true,
    "local_verified": false,
    "rating":         4.9,
    "deals":          12,
    "bio":            "Graduating in May. Moving back to Singapore.",
    "avatar_initials":"EL",
    "avatar_color":   "#C8553D",
    "saved_listing_ids": ["i3", "i12"],
    "created_at":     "2026-04-01T09:00:00Z"
  }
}
```

---

## PATCH `/users/me`

[auth] Requires auth. Update profile fields (all optional).

**Request body**
```json
{
  "name":           "Emma Lin",
  "bio":            "Updated bio.",
  "avatar_color":   "#4F46E5"
}
```

**Response 200** — returns updated user object (same shape as GET /users/me).

---

## GET `/users/:id`

Public profile. Does **not** return email or saved listings.

**Path param:** `id` — user ID (e.g. `u_emma`)

**Response 200**
```json
{
  "ok": true,
  "data": {
    "id":             "u_emma",
    "name":           "Emma L.",
    "handle":         "@emma.l",
    "school":         "Boston University",
    "edu_verified":   true,
    "local_verified": false,
    "rating":         4.9,
    "deals":          12,
    "bio":            "Graduating in May.",
    "avatar_initials":"EL",
    "avatar_color":   "#C8553D",
    "active_listings_count": 3
  }
}
```

---

## POST `/users/me/verify-local`

[auth] Requires auth.  
Submit a local address for verification. Backend triggers an address check flow.

**Request body**
```json
{
  "address": "104 Brighton Ave, Allston, MA 02134"
}
```

**Response 200**
```json
{
  "ok": true,
  "data": { "status": "pending", "message": "Verification postcard mailed." }
}
```

---

---

# 3. Listings

## GET `/listings`

Public. Returns paginated listings with optional filters.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search (title, description, location) |
| `category` | string | `furniture` \| `kitchen` \| `appliance` \| `bike` \| `clothing` \| `household` |
| `condition` | string | `new` \| `excellent` \| `good` \| `fair` |
| `location` | string | City or neighborhood filter |
| `sort` | string | `recent` (default) \| `saved` \| `value_desc` |
| `page` | int | Default `1` |
| `per_page` | int | Default `20`, max `50` |

**Response 200**
```json
{
  "ok": true,
  "data": [
    {
      "id":           "i1",
      "title":        "IKEA Malm desk · white",
      "category":     "furniture",
      "condition":    "excellent",
      "est_value":    149,
      "age":          "14 mo",
      "pickup":       "Mid-May",
      "description":  "Compact desk, fits a 27\" monitor...",
      "seller_id":    "u_emma",
      "location":     "Allston, MA",
      "saved_count":  18,
      "status":       "active",
      "photos": [
        {
          "id":    "ph_1",
          "url":   "https://cdn.rehome.app/photos/i1_1.jpg",
          "order": 0
        }
      ],
      "created_at":   "2026-05-07T10:00:00Z",
      "updated_at":   "2026-05-07T10:00:00Z"
    }
  ],
  "meta": {
    "total": 128,
    "page": 1,
    "per_page": 20,
    "has_next": true
  }
}
```

---

## GET `/listings/feed`

[auth] Requires auth. Returns personalised home feed:  
- `featured` — one listing picked for current user  
- `showcase` — 4 recently re-homed success stories  
- `grid` — remaining active listings (paged)

**Response 200**
```json
{
  "ok": true,
  "data": {
    "featured":  { /* single listing object */ },
    "showcase": [
      {
        "listing":    { /* listing object */ },
        "badge":      "PICKED UP",
        "route":      "MIT → Harvard"
      }
    ],
    "grid": [ /* listing objects */ ]
  }
}
```

---

## POST `/listings`

[auth] Requires auth + `edu_verified: true`.  
Creates a new listing. Photos are uploaded separately via `POST /listings/:id/photos`.

**Request body**
```json
{
  "title":           "IKEA Malm desk · white",
  "category":        "furniture",
  "condition":       "excellent",
  "age":             "14 mo",
  "description":     "Compact desk, fits a 27\" monitor.",
  "description_lang":"en",
  "pickup_window":   "Mid-May",
  "pickup_date":     "May 15",
  "pickup_time_slot":"Afternoon (12–17)",
  "pickup_spot":     "104 Brighton Ave, Allston, MA",
  "location":        "Allston, MA",
  "est_value":       149
}
```

**Fields**

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | 5–120 chars |
| `category` | yes | One of the 6 category IDs |
| `condition` | yes | `new` \| `excellent` \| `good` \| `fair` |
| `age` | yes | `< 6 mo` \| `6-12 mo` \| `1 yr` \| `2 yr` \| `3+ yr` |
| `description` | — | If omitted, backend auto-generates via AI |
| `description_lang` | — | BCP-47 code, default `en`. Non-`en` text is auto-translated |
| `pickup_window` | yes | Free string, e.g. `Mid-May` |
| `pickup_date` | — | Specific day within window |
| `pickup_time_slot` | — | `Morning (8–12)` \| `Afternoon (12–17)` \| `Evening (17–20)` |
| `pickup_spot` | — | Approximate address, hidden until agreed |
| `location` | yes | Neighbourhood / city (public) |
| `est_value` | yes | Positive integer, dollars |

**Response 201**
```json
{
  "ok": true,
  "data": {
    "id":     "i13",
    "status": "active",
    ...
  }
}
```

---

## GET `/listings/:id`

Public. Returns single listing with seller summary.

**Response 200**
```json
{
  "ok": true,
  "data": {
    "id":          "i3",
    "title":       "Trek FX 2 hybrid bike",
    "category":    "bike",
    "condition":   "good",
    "est_value":   420,
    "age":         "3 yr",
    "pickup":      "After May 20",
    "description": "Size M. Recently tuned at Cambridge Bicycle...",
    "seller": {
      "id":           "u_dani",
      "name":         "Dani O.",
      "handle":       "@dani.o",
      "school":       "MIT",
      "edu_verified": true,
      "rating":       4.8,
      "deals":        19
    },
    "location":     "Somerville, MA",
    "saved_count":  41,
    "status":       "active",
    "photos": [
      { "id": "ph_3", "url": "https://cdn.rehome.app/photos/i3_1.jpg", "order": 0 }
    ],
    "created_at":   "2026-05-08T08:00:00Z"
  }
}
```

---

## PATCH `/listings/:id`

[auth] Requires auth. Only the listing owner may update.

**Request body** — any subset of POST fields plus:

```json
{
  "status": "claimed"
}
```

`status` values: `active` | `claimed` | `draft` | `deleted`

**Response 200** — updated listing object.

---

## DELETE `/listings/:id`

[auth] Requires auth + owner.

**Response 204** — no body.

---

## POST `/listings/:id/save`

[auth] Requires auth. Toggles saved state for the authenticated user.

**Response 200**
```json
{
  "ok": true,
  "data": {
    "saved": true,
    "saved_count": 42
  }
}
```

---

---

# 4. Photos

## POST `/listings/:id/photos`

[auth] Requires auth + listing owner.  
Upload a photo for a listing. `Content-Type: multipart/form-data`.

**Form fields**

| Field | Type | Description |
|-------|------|-------------|
| `file` | binary | JPEG or PNG, max 10 MB |
| `order` | int | Display order (0-indexed) |

**Response 201**
```json
{
  "ok": true,
  "data": {
    "id":    "ph_99",
    "url":   "https://cdn.rehome.app/photos/i13_0.jpg",
    "order": 0
  }
}
```

---

## DELETE `/listings/:id/photos/:photo_id`

[auth] Requires auth + listing owner.

**Response 204** — no body.

---

---

# 5. Conversations & Messages

## GET `/conversations`

[auth] Requires auth. Returns all conversations for the current user, ordered by most recent message.

**Response 200**
```json
{
  "ok": true,
  "data": [
    {
      "id":           "c1",
      "listing": {
        "id":    "i1",
        "title": "IKEA Malm desk · white",
        "photo_url": "https://cdn.rehome.app/photos/i1_1.jpg"
      },
      "other_user": {
        "id":           "u_emma",
        "name":         "Emma L.",
        "edu_verified": true,
        "avatar_color": "#C8553D",
        "avatar_initials": "EL"
      },
      "last_message":  "I can swing by Saturday at 2?",
      "last_message_at":"2026-05-09T11:42:00Z",
      "unread_count":  2
    }
  ]
}
```

---

## POST `/conversations`

[auth] Requires auth.  
Open a new conversation about a listing. One conversation per (listing, user-pair).

**Request body**
```json
{
  "listing_id":   "i3",
  "first_message":"Hi, is the bike still available?"
}
```

**Response 201**
```json
{
  "ok": true,
  "data": {
    "id":         "c5",
    "listing_id": "i3",
    "other_user_id": "u_dani",
    "created_at": "2026-05-09T15:00:00Z"
  }
}
```

---

## GET `/conversations/:id`

[auth] Requires auth + participant.  
Returns conversation details with paginated message history.

**Query params:** `before` (ISO timestamp cursor), `limit` (default 40)

**Response 200**
```json
{
  "ok": true,
  "data": {
    "id": "c1",
    "listing": { /* listing summary */ },
    "other_user": { /* user summary */ },
    "messages": [
      {
        "id":         "m_101",
        "sender_id":  "u_emma",
        "body":       "I can swing by Saturday at 2?",
        "sent_at":    "2026-05-09T11:42:00Z",
        "read":       false
      }
    ],
    "has_more": false
  }
}
```

---

## POST `/conversations/:id/messages`

[auth] Requires auth + participant. Send a message.

**Request body**
```json
{
  "body": "Works for me — I'll send the address once you confirm."
}
```

**Response 201**
```json
{
  "ok": true,
  "data": {
    "id":        "m_102",
    "sender_id": "me_student",
    "body":      "Works for me — I'll send the address once you confirm.",
    "sent_at":   "2026-05-09T15:05:00Z",
    "read":      false
  }
}
```

---

## PATCH `/conversations/:id/read`

[auth] Requires auth + participant.  
Marks all unread messages in the conversation as read by the current user.

**Response 200**
```json
{
  "ok": true,
  "data": { "unread_count": 0 }
}
```

---

---

# 6. AI Utilities

## POST `/ai/generate-description`

[auth] Requires auth.  
Auto-generates a listing description from structured inputs.  
Used on step 4 of publish when user leaves description blank.

**Request body**
```json
{
  "title":         "IKEA Malm desk · white",
  "category":      "furniture",
  "condition":     "excellent",
  "age":           "14 mo",
  "pickup_window": "Mid-May",
  "location":      "Allston, MA"
}
```

**Response 200**
```json
{
  "ok": true,
  "data": {
    "description": "Excellent condition furniture, 14 mo old. Compact IKEA Malm desk in white — fits a 27\" monitor. Available for Mid-May pickup in Allston, MA."
  }
}
```

---

## POST `/ai/translate`

[auth] Requires auth.  
Translates listing description to English for buyers.  
Called when `description_lang` is non-`en`.

**Request body**
```json
{
  "text":            "状态很好的宜家书桌，用了14个月，几乎全新。",
  "source_language": "zh",
  "target_language": "en"
}
```

**Response 200**
```json
{
  "ok": true,
  "data": {
    "translated_text": "IKEA desk in great condition, used for 14 months, nearly new.",
    "source_language": "zh",
    "target_language": "en"
  }
}
```

**Supported `source_language` values:** `en`, `zh`, `es`, `fr`, `ko`, `ja`

---

## POST `/ai/estimate-value`

Public (no auth required).  
Returns an estimated retail value for a given item based on category, condition, and age.

**Request body**
```json
{
  "category":  "furniture",
  "condition": "excellent",
  "age":       "14 mo"
}
```

**Response 200**
```json
{
  "ok": true,
  "data": {
    "est_value": 124,
    "breakdown": {
      "base_value":           250,
      "condition_multiplier": 0.62,
      "age_multiplier":       0.80
    }
  }
}
```

**Multiplier tables**

Condition:

| condition | multiplier |
|-----------|-----------|
| `new`       | 0.78 |
| `excellent` | 0.62 |
| `good`      | 0.45 |
| `fair`      | 0.28 |

Age:

| age | multiplier |
|-----|-----------|
| `< 6 mo`  | 1.00 |
| `6-12 mo` | 0.90 |
| `1 yr`    | 0.80 |
| `2 yr`    | 0.70 |
| `3+ yr`   | 0.60 |

Category base values (USD):

| category | base |
|----------|------|
| `furniture`  | 250 |
| `appliance`  | 180 |
| `bike`       | 350 |
| `clothing`   | 90 |
| `kitchen`    | 60 |
| `household`  | 75 |

---

---

# 7. Categories

## GET `/categories`

Public. Returns all item categories.

**Response 200**
```json
{
  "ok": true,
  "data": [
    { "id": "furniture", "label": "Furniture",  "glyph": "▦" },
    { "id": "kitchen",   "label": "Kitchen",    "glyph": "◍" },
    { "id": "appliance", "label": "Appliances", "glyph": "◉" },
    { "id": "bike",      "label": "Bikes",      "glyph": "◷" },
    { "id": "clothing",  "label": "Clothing",   "glyph": "◇" },
    { "id": "household", "label": "Household",  "glyph": "○" }
  ]
}
```

---

---

# Data Schemas

## User

```
id              string   Unique user ID
name            string   Display name
handle          string   @handle
email           string   .edu email (private)
school          string   University name
edu_verified    bool     .edu email confirmed
local_verified  bool     Address confirmed
rating          float?   Average rating (null if no deals)
deals           int      Completed pickups
bio             string
avatar_initials string   2-char initials
avatar_color    string   Hex color for avatar background
created_at      ISO 8601
```

## Listing

```
id              string
title           string
category        string   Category ID
condition       string   new | excellent | good | fair
est_value       int      Dollars
age             string   < 6 mo | 6-12 mo | 1 yr | 2 yr | 3+ yr
pickup          string   Public pickup window label
pickup_date     string?  Specific preferred date
pickup_time_slot string? Morning | Afternoon | Evening
pickup_spot     string?  Address (hidden until deal agreed)
description     string
description_lang string  BCP-47
seller_id       string
location        string   Public neighbourhood/city
saved_count     int
status          string   active | claimed | draft | deleted
photos          Photo[]
created_at      ISO 8601
updated_at      ISO 8601
```

## Photo

```
id    string
url   string   CDN URL
order int      0-indexed display order
```

## Conversation

```
id              string
listing_id      string
participants    string[]  Two user IDs
last_message    string
last_message_at ISO 8601
unread_count    int       Unread for the requesting user
```

## Message

```
id         string
conversation_id string
sender_id  string
body       string
sent_at    ISO 8601
read       bool
```

---

---

# Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register with .edu email |
| POST | `/auth/login` | — | Login |
| POST | `/auth/logout` | yes | Invalidate token |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/verify-edu` | yes | Send .edu verification email |
| POST | `/auth/verify-edu/confirm` | yes | Confirm verification code |
| GET  | `/users/me` | yes | My profile |
| PATCH | `/users/me` | yes | Update profile |
| GET  | `/users/:id` | — | Public profile |
| POST | `/users/me/verify-local` | yes | Submit local address |
| GET  | `/listings` | — | List + search listings |
| GET  | `/listings/feed` | yes | Personalised home feed |
| POST | `/listings` | yes | Create listing |
| GET  | `/listings/:id` | — | Single listing |
| PATCH | `/listings/:id` | yes | Update listing |
| DELETE | `/listings/:id` | yes | Delete listing |
| POST | `/listings/:id/save` | yes | Toggle save |
| POST | `/listings/:id/photos` | yes | Upload photo |
| DELETE | `/listings/:id/photos/:photo_id` | yes | Delete photo |
| GET  | `/conversations` | yes | My conversation list |
| POST | `/conversations` | yes | Start conversation |
| GET  | `/conversations/:id` | yes | Messages in conversation |
| POST | `/conversations/:id/messages` | yes | Send message |
| PATCH | `/conversations/:id/read` | yes | Mark as read |
| POST | `/ai/generate-description` | yes | Auto-generate description |
| POST | `/ai/translate` | yes | Translate to English |
| POST | `/ai/estimate-value` | — | Estimate retail value |
| GET  | `/categories` | — | All categories |
