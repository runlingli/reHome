# reHome backend (Firebase)

Project: **`rehome-495823`** · Owner: lirunlingemily@gmail.com
iOS bundle: `com.3idiots.reHome` · iOS app config: [`reHome/reHome/GoogleService-Info.plist`](../reHome/reHome/GoogleService-Info.plist)

## Stack
- **Firebase Auth** (Identity Platform) — `.edu` email + (optional) phone for Local Verified
- **Cloud Firestore** — listings, users, conversations, messages
- **Cloud Storage for Firebase** — listing photos + avatars + ID verification uploads
- **Cloud Functions** *(later)* — `.edu` domain check, value estimation, ID OCR + delete, notifications

## Layout
```
backend/
├── firebase.json            products + emulator ports
├── .firebaserc              pinned project id
├── firestore.rules          security rules
├── firestore.indexes.json   composite indexes
└── storage.rules            cloud storage rules
```

## Firestore data model

```
users/{uid}
  name, handle, school, bio, avatarColor, avatarInitials,
  eduVerified: bool        # set by server only (custom claim → mirror)
  localVerified: bool      # set by server only
  rating, deals, createdAt

listings/{listingId}
  title, category, condition, estValue,
  age, pickup, desc, location,
  photoColors[], photoLabel,
  sellerUid,               # == users/{uid}
  savedCount, createdAt

conversations/{convId}     # convId = sortedUids.join("__") + "__" + listingId
  participants: [uidA, uidB]
  listingId,
  lastMessage, lastTime, unread: { uidA: n, uidB: n }
  createdAt

conversations/{convId}/messages/{messageId}
  from: uid, text, createdAt
```

## Verification model
- `eduVerified` and `localVerified` live as **custom claims** on the auth token + mirrored on `users/{uid}` for client display
- They are never client-writable (rules block diff on those keys)
- Set by Cloud Functions after email/OTP/OCR success

## Deploy
```bash
cd backend
firebase deploy --only firestore:rules,firestore:indexes,storage   # rules + indexes
```

## Local development (emulator)
```bash
cd backend
firebase emulators:start                    # Auth 9099 · Firestore 8080 · Storage 9199 · UI 4000
```
The iOS app should `connect…UseEmulator` when `#if DEBUG`.

## Manual one-off setup
- `Authentication → Sign-in method → Email/Password` → enable in Firebase console
- `Storage → Get started` → pick `us` location → use default rules (we'll redeploy ours)
