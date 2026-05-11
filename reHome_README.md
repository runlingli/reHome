# reHome

reHome is a student move-out marketplace that helps graduating students pass on furniture, appliances, and household items to local residents instead of leaving them on the curb.

Built for **HackDavis 2026**, reHome focuses on the end-of-year move-out window, when many international students and graduating students need to clear apartments quickly, while local residents are looking for affordable or free secondhand items nearby.

## Inspiration

Every May and June, near-new furniture piles up outside dorms and apartments because shipping a desk or chair home often costs more than the item is worth. At the same time, local families and residents may want those items but have no easy way to discover what students are leaving behind.

reHome closes that gap by connecting people who need to give things away with people who can reuse them.

## What reHome does

reHome is a two-sided marketplace for student move-out items.

Students can:

- Upload photos of items they want to give away or sell
- Write a short description in any language
- Generate an English listing with AI assistance
- Set pickup availability windows
- Publish listings before move-out day
- Confirm handoff completion with the receiver

Local residents can:

- Browse nearby listings
- Filter by category or price
- View items on a distance-sorted interface
- Book pickup slots directly
- Chat with the student giver
- Confirm pickup after handoff

Items that remain unclaimed by the move-out deadline can be routed toward nonprofit donation partners, reducing unnecessary landfill waste.

## Key features

- **Student-focused listing flow** — designed around the pressure of move-out week.
- **AI listing generator** — helps users turn quick item notes into clear English listings.
- **Category and price filters** — makes browsing easier for local residents.
- **Pickup availability windows** — avoids endless back-and-forth scheduling.
- **Real-time conversations** — supports coordination between giver and receiver.
- **Two-sided handoff confirmation** — both users confirm before an item is marked complete.
- **Saved items and drafts** — lets users save listings and continue unfinished posts.
- **Donation fallback** — unclaimed items can be directed toward partner nonprofits.

## How we built it

reHome is built as a cross-platform application with:

- **SwiftUI** for the native iOS app
- **React** for the companion web experience
- **Firebase Authentication** for sign-in and `.edu` email verification
- **Cloud Firestore** for real-time listings, conversations, and messages
- **Firebase Storage** for listing images
- **Firestore security rules** for protected status transitions and handoff confirmation

The iOS app uses a single-source-of-truth architecture through a `FirestoreService` layer with Combine-backed published state. The web app uses live Firestore snapshot listeners so listing and conversation updates appear in real time.

Conversations are keyed by a deterministic ID based on the two users and the listing ID, allowing both platforms to reference the same conversation document.

## Repository structure

```text
reHome/
├── backend/        # Backend-related code and Firebase integration work
├── desktop/        # Web / desktop companion app
├── prize_tracks/   # Hackathon prize track materials
├── reHome/         # Native iOS app
├── API.md          # API and integration notes
└── README.md
```

## Tech stack

| Area | Tools |
| --- | --- |
| Mobile | SwiftUI, Combine |
| Web | React, Zustand |
| Backend / Database | Firebase, Cloud Firestore |
| Auth | Firebase Authentication, `.edu` verification |
| Storage | Firebase Storage |
| Real-time updates | Firestore snapshot listeners |
| AI assistance | AI-powered listing generation |

## Getting started

### Prerequisites

Before running the project, make sure you have:

- Node.js and npm installed
- Xcode installed for the iOS app
- A Firebase project configured
- Firebase Authentication, Firestore, and Storage enabled

### Web app

```bash
cd desktop
npm install
npm run dev
```

Create a local environment file if required by the web app:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### iOS app

1. Open the `reHome` iOS project in Xcode.
2. Add your Firebase `GoogleService-Info.plist` file if it is not already included.
3. Select a simulator or connected device.
4. Build and run the app.

## Challenges

This was our first hackathon project, so scoping was one of the biggest challenges. We had to decide what to build, what to cut, and how to make the core flow work end-to-end within the available time.

On the technical side, we redesigned the database schema multiple times before reaching a structure that handled bundle listings, real-time conversations, and item status transitions cleanly. Role-separated authentication and handoff confirmation also required careful design so that users could coordinate safely without allowing one side to fake completion.

For the demo, we shipped a polling-based approach for some time-sensitive flows, while leaving the full push notification infrastructure as a future improvement.

## What we learned

We learned that building a marketplace is not only about matching supply and demand. The harder problem is reducing friction and building trust on both sides of the transaction.

We also learned that early user research matters. Talking through the actual move-out experience helped us prioritize practical features like pickup windows, clear listing generation, and donation fallback instead of building features that sounded interesting but did not directly solve the user problem.

## What's next

Next steps for reHome include:

- Adding a low-price transaction marketplace for higher-value items
- Partnering with local moving companies for large-item pickup
- Building nonprofit donation routing more deeply into the product
- Improving push notifications for booking and handoff updates
- Expanding from one campus move-out season to multiple university communities

## Team

Built by the Runling Li, Zekun Shang, Boyang Xia for HackDavis 2026.

## License

Copyright (c) 2026 Boyang Xia, Ruhling Li, Zekun Shang
