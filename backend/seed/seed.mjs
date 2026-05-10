// Seed Firestore with mock listings + sample seller users.
// Run from backend/seed/:  npm install && npm run seed
//
// Auth: uses Application Default Credentials (gcloud auth application-default login).
// Admin SDK bypasses security rules — fine for dev seeding.

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp({
  credential: applicationDefault(),
  projectId:  "rehome-495823",
});

const db = getFirestore();

// ── Sample sellers (UC Davis area) ──────────────────────────────────────────
const SELLERS = {
  u_emma:  { name: "Emma L.",  handle: "@emma.l",   school: "UC Davis",
             bio: "Graduating in June. Moving back to Singapore — everything in my apartment must go.",
             avatarColor: "#C8553D", avatarInitials: "EL", rating: 4.9, deals: 12 },
  u_jin:   { name: "Jin C.",   handle: "@jin.chen", school: "UC Berkeley",
             bio: "PhD wrap-up. Apartment cleanout — items barely used.",
             avatarColor: "#5C7A5E", avatarInitials: "JC", rating: 5.0, deals: 7 },
  u_dani:  { name: "Dani O.",  handle: "@dani.o",   school: "Sacramento State",
             bio: "Lab moving to SF. Take it all please.",
             avatarColor: "#4F46E5", avatarInitials: "DO", rating: 4.8, deals: 19 },
  u_lucas: { name: "Lucas M.", handle: "@lucasm",   school: "UC Santa Cruz",
             bio: "Co-op finishing. Moving to SF mid-June.",
             avatarColor: "#1F1F1F", avatarInitials: "LM", rating: 4.7, deals: 5 },
};

// ── Listings (Davis area) ────────────────────────────────────────────────────
const LISTINGS = [
  { id: "i1",  title: "IKEA Malm desk · white",          category: "furniture", condition: "excellent", estValue: 149, age: "14 mo", pickup: "Mid-June",
    desc: "Compact desk, fits a 27\" monitor. Two screw holes near the back from a monitor mount. Pickup only — 4th-floor walk-up.",
    sellerUid: "u_emma", location: "Davis, CA",
    photoColors: ["#F4EFE6","#D9CFB8"], photoLabel: "desk · white", savedCount: 18 },
  { id: "i2",  title: "Cuisinart 4-cup coffee maker",     category: "appliance", condition: "good", estValue: 38, age: "2 yr", pickup: "June 18 – 22",
    desc: "Works perfectly, just descaled. Comes with a permanent gold filter, no paper needed.",
    sellerUid: "u_jin", location: "Berkeley, CA",
    photoColors: ["#E8DFD0","#B8A687"], photoLabel: "coffee maker", savedCount: 7 },
  { id: "i3",  title: "Trek FX 2 hybrid bike",            category: "bike", condition: "good", estValue: 420, age: "3 yr", pickup: "After June 20",
    desc: "Size M. Recently tuned at Davis Bike Church. Includes lock and front light. One small scratch on the top tube.",
    sellerUid: "u_dani", location: "Sacramento, CA",
    photoColors: ["#EDE4D2","#90785A"], photoLabel: "hybrid bike", savedCount: 41 },
  { id: "i4",  title: "Twin XL mattress + frame",         category: "furniture", condition: "good", estValue: 220, age: "10 mo", pickup: "June 25 – 30",
    desc: "Memory-foam, used with mattress protector since day one. Frame is metal, easy to disassemble.",
    sellerUid: "u_emma", location: "Davis, CA",
    photoColors: ["#F1E9DC","#C9B89A"], photoLabel: "mattress", savedCount: 12 },
  { id: "i5",  title: "Dyson V8 vacuum",                  category: "appliance", condition: "excellent", estValue: 280, age: "1 yr", pickup: "Flexible",
    desc: "Two attachments included. Battery still holds full charge — about 35 min of runtime.",
    sellerUid: "u_jin", location: "Berkeley, CA",
    photoColors: ["#E5E1D7","#A09583"], photoLabel: "vacuum", savedCount: 24 },
  { id: "i6",  title: "Lodge cast-iron skillet · 10\"",   category: "kitchen", condition: "good", estValue: 30, age: "2 yr", pickup: "Mid-June",
    desc: "Well-seasoned. Becomes nonstick with a thin coat of oil.",
    sellerUid: "u_lucas", location: "Woodland, CA",
    photoColors: ["#E2DBCB","#5A4A38"], photoLabel: "skillet", savedCount: 5 },
  { id: "i7",  title: "Uniqlo down jacket · M",           category: "clothing", condition: "excellent", estValue: 70, age: "8 mo", pickup: "Mid-June",
    desc: "Black, ultra-light. Worn one season. No stains.",
    sellerUid: "u_dani", location: "Sacramento, CA",
    photoColors: ["#EDE4D2","#3A3530"], photoLabel: "down jacket", savedCount: 9 },
  { id: "i8",  title: "Air fryer · Cosori 5.8 qt",        category: "appliance", condition: "excellent", estValue: 90, age: "1 yr", pickup: "June 20 – 25",
    desc: "Cleaned thoroughly. Comes with original manual.",
    sellerUid: "u_lucas", location: "Woodland, CA",
    photoColors: ["#E8E2D2","#444036"], photoLabel: "air fryer", savedCount: 31 },
  { id: "i9",  title: "Bookshelf, 3-tier · oak",          category: "furniture", condition: "fair", estValue: 80, age: "4 yr", pickup: "Before June 25",
    desc: "Solid. Some water rings on the top shelf — not visible when loaded.",
    sellerUid: "u_emma", location: "Davis, CA",
    photoColors: ["#E9DFC9","#8A6A45"], photoLabel: "bookshelf", savedCount: 4 },
  { id: "i10", title: "Ceramic dinner set · 4 pcs",       category: "kitchen", condition: "excellent", estValue: 45, age: "1 yr", pickup: "Mid-June",
    desc: "Crate & Barrel. Plates, bowls, and mugs — service for two.",
    sellerUid: "u_jin", location: "Berkeley, CA",
    photoColors: ["#F4EDDD","#A89876"], photoLabel: "dinnerware", savedCount: 11 },
  { id: "i11", title: "Standing lamp · brass",            category: "household", condition: "good", estValue: 55, age: "2 yr", pickup: "Flexible",
    desc: "Warm 3000K bulb included.",
    sellerUid: "u_dani", location: "Sacramento, CA",
    photoColors: ["#EFE7D6","#9A7D4A"], photoLabel: "lamp", savedCount: 6 },
  { id: "i12", title: "Office chair · Steelcase Series 1", category: "furniture", condition: "excellent", estValue: 380, age: "18 mo", pickup: "Late June",
    desc: "Adjustable arms, lumbar, headrest. Smoke-free apartment.",
    sellerUid: "u_lucas", location: "Woodland, CA",
    photoColors: ["#E5DECC","#383330"], photoLabel: "office chair", savedCount: 47 },
];

// ── Write seller user docs ──────────────────────────────────────────────────
const writeSellers = async () => {
  const batch = db.batch();
  for (const [uid, data] of Object.entries(SELLERS)) {
    batch.set(db.collection("users").doc(uid), {
      ...data,
      eduVerified:   true,
      localVerified: false,
      createdAt:     FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`✓ wrote ${Object.keys(SELLERS).length} sellers`);
};

// ── Write listings (timestamps staggered to make sort meaningful) ───────────
const writeListings = async () => {
  const batch = db.batch();
  const now = Date.now();
  LISTINGS.forEach((l, i) => {
    const { id, ...rest } = l;
    // stagger by 10-min steps so newest is i=0
    const ts = new Date(now - i * 10 * 60 * 1000);
    batch.set(db.collection("listings").doc(id), {
      ...rest,
      createdAt: ts,
    });
  });
  await batch.commit();
  console.log(`✓ wrote ${LISTINGS.length} listings`);
};

await writeSellers();
await writeListings();
console.log("done.");
process.exit(0);
