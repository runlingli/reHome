// Create deterministic test accounts for the demo.
// Each gets a fixed UID that matches the sellerUid on seeded listings,
// so the seller of "IKEA Malm desk" actually IS u_emma's account.
//
// Run from backend/seed/:  node users.mjs
// Password for everyone:   rehome2026

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth }                         from "firebase-admin/auth";
import { getFirestore, FieldValue }        from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault(), projectId: "rehome-495823" });

const PASSWORD = "rehome2026";

const ACCOUNTS = [
  // .edu students — can post (eduVerified=true), and own the seeded listings
  { uid: "u_emma",  email: "emma@bu.edu",          name: "Emma L.",  school: "Boston University",
    bio: "Graduating in May. Moving back to Singapore — everything in my apartment must go.",
    avatarColor: "#C8553D", avatarInitials: "EL", rating: 4.9, deals: 12,
    eduVerified: true,  localVerified: false },

  { uid: "u_jin",   email: "jin@harvard.edu",      name: "Jin C.",   school: "Harvard University",
    bio: "PhD wrap-up. Apartment cleanout — items barely used.",
    avatarColor: "#5C7A5E", avatarInitials: "JC", rating: 5.0, deals: 7,
    eduVerified: true,  localVerified: false },

  { uid: "u_dani",  email: "dani@mit.edu",         name: "Dani O.",  school: "MIT",
    bio: "Lab moving to SF. Take it all please.",
    avatarColor: "#4F46E5", avatarInitials: "DO", rating: 4.8, deals: 19,
    eduVerified: true,  localVerified: false },

  { uid: "u_lucas", email: "lucas@northeastern.edu", name: "Lucas M.", school: "Northeastern",
    bio: "Co-op finishing. Moving to NYC mid-June.",
    avatarColor: "#1F1F1F", avatarInitials: "LM", rating: 4.7, deals: 5,
    eduVerified: true,  localVerified: false },

  // Local resident — can browse / message but can't post
  { uid: "u_local", email: "local@example.com",    name: "Maya R.",  school: "",
    bio: "Allston resident, picking up the basics for my new apt.",
    avatarColor: "#2A6FDB", avatarInitials: "MR", rating: 4.9, deals: 14,
    eduVerified: false, localVerified: true },
];

const auth = getAuth();
const db   = getFirestore();

for (const a of ACCOUNTS) {
  // Create-or-update the Auth account at a deterministic UID
  try {
    await auth.createUser({
      uid:         a.uid,
      email:       a.email,
      password:    PASSWORD,
      displayName: a.name,
      emailVerified: true,
    });
    console.log(`✓ created  ${a.email}  (uid=${a.uid})`);
  } catch (e) {
    if (e.code === "auth/uid-already-exists" || e.code === "auth/email-already-exists") {
      await auth.updateUser(a.uid, {
        email:       a.email,
        password:    PASSWORD,
        displayName: a.name,
      });
      console.log(`✓ updated  ${a.email}  (uid=${a.uid})`);
    } else {
      console.error(`✗ ${a.email}:`, e.message);
      continue;
    }
  }

  // Upsert the public profile doc — merge so the existing seeded fields stay
  await db.collection("users").doc(a.uid).set({
    name:           a.name,
    handle:         "@" + a.email.split("@")[0],
    school:         a.school,
    bio:            a.bio,
    avatarColor:    a.avatarColor,
    avatarInitials: a.avatarInitials,
    rating:         a.rating,
    deals:          a.deals,
    eduVerified:    a.eduVerified,
    localVerified:  a.localVerified,
    createdAt:      FieldValue.serverTimestamp(),
  }, { merge: true });
}

console.log("");
console.log("All test accounts ready. Password for all:", PASSWORD);
process.exit(0);
