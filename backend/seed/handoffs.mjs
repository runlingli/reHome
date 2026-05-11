// Seed a few completed handoffs so the "Local pickups" stat tile isn't 0.
//
// For each pair below: marks the listing's status="completed" + creates a
// conversation document with both sellerConfirmed=true and receiverConfirmed=true
// (mirroring what the in-app handoff flow produces when both sides tap confirm).
//
// Run:  cd backend/seed  &&  node handoffs.mjs

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore }                      from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault(), projectId: "rehome-495823" });
const db = getFirestore();

// listingId  → { receiver: uid }   (seller is read from the listing doc)
const HANDOFFS = {
  i6:  { receiver: "u_local" },   // Lodge cast-iron skillet  → local resident
  i11: { receiver: "u_local" },   // Brass standing lamp      → local resident
};

for (const [listingId, { receiver }] of Object.entries(HANDOFFS)) {
  const listingRef = db.collection("listings").doc(listingId);
  const snap = await listingRef.get();
  if (!snap.exists) { console.warn(`  skip ${listingId}: listing not found`); continue; }
  const seller = snap.data().sellerUid;
  if (!seller) { console.warn(`  skip ${listingId}: no sellerUid`); continue; }

  // Conversation ID convention from FirestoreService.swift / listings.ts:
  //   sorted([seller, receiver]).join('__') + '__' + listingId
  const convId = [seller, receiver].sort().join("__") + "__" + listingId;
  const convRef = db.collection("conversations").doc(convId);

  await convRef.set({
    participants:      [seller, receiver],
    listingId,
    sellerUid:         seller,
    sellerConfirmed:   true,
    receiverConfirmed: true,
    lastMessage:       "Confirmed — pickup complete.",
    lastMessageAt:     new Date(),
    unread:            { [seller]: 0, [receiver]: 0 },
    createdAt:         new Date(),
  }, { merge: true });

  await listingRef.update({ status: "completed" });
  console.log(`✓ ${listingId}  seller=${seller}  receiver=${receiver}  → completed`);
}

process.exit(0);
