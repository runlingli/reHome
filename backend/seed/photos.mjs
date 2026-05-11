// Backfill imageUrl on each seeded listing with a real, on-topic photo.
//
// Source:    loremflickr.com — keyword-based real Flickr photos under CC.
// Strategy:  download the photo locally and upload to the production web
//            server (rehome.design hosts /photos/iN.jpg via the same nginx
//            container that serves the React app).  Hot-linking LoremFlickr
//            cache URLs failed in production — they get evicted hours later.
//            Self-hosting under our domain is permanent.
//
// Run:  cd backend/seed  &&  node photos.mjs
//
// Requires:  the rehome.design nginx container is up (docker compose),
//            and ssh root@178.104.248.143 works.

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore }                      from "firebase-admin/firestore";
import { writeFile, mkdir }                  from "node:fs/promises";
import { execSync }                          from "node:child_process";
import { tmpdir }                            from "node:os";
import { join }                              from "node:path";

initializeApp({ credential: applicationDefault(), projectId: "rehome-495823" });
const db = getFirestore();

const PHOTO_QUERIES = {
  i1:  "white,desk,minimal",
  i2:  "coffee,maker",
  i3:  "trek,bicycle",
  i4:  "mattress,bed",
  i5:  "dyson,vacuum",
  i6:  "cast,iron,skillet",
  i7:  "down,jacket",
  i8:  "air,fryer",
  i9:  "bookshelf,wooden",
  i10: "ceramic,dinner,plates",
  i11: "brass,floor,lamp",
  i12: "office,chair",
};

const STRAY_IDS = ["2LxJWvmrtC4qP6UclHMa"];

const HOST       = "root@178.104.248.143";
const REMOTE_DIR = "/root/rehome/dist/photos";
const PUBLIC_BASE = "https://rehome.design/photos";

const tmpDir = join(tmpdir(), "rehome-photos");
await mkdir(tmpDir, { recursive: true });

async function downloadJpg(keywords, dest) {
  const res = await fetch(`https://loremflickr.com/800/600/${keywords}`, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

for (const id of STRAY_IDS) {
  try {
    await db.collection("listings").doc(id).delete();
    console.log(`✓ deleted stray ${id}`);
  } catch (e) {
    console.warn(`  skip stray ${id}: ${e.message}`);
  }
}

// 1. Download all photos to /tmp.
for (const [id, keywords] of Object.entries(PHOTO_QUERIES)) {
  try {
    const bytes = await downloadJpg(keywords, join(tmpDir, `${id}.jpg`));
    console.log(`  ↓ ${id}  ${keywords.padEnd(28)}  ${(bytes / 1024).toFixed(0)} KB`);
  } catch (err) {
    console.error(`  ✗ ${id}: ${err.message}`);
  }
}

// 2. Sync to nginx container's mounted dir + ensure dir is traversable.
console.log("\n→ uploading to rehome.design …");
execSync(`ssh ${HOST} 'mkdir -p ${REMOTE_DIR}'`, { stdio: "inherit" });
execSync(`scp -q ${tmpDir}/*.jpg ${HOST}:${REMOTE_DIR}/`,                  { stdio: "inherit" });
execSync(`ssh ${HOST} 'chmod 755 ${REMOTE_DIR}'`,                          { stdio: "inherit" });

// 3. Point Firestore at the self-hosted URLs.
console.log("\n→ updating Firestore …");
for (const id of Object.keys(PHOTO_QUERIES)) {
  const url = `${PUBLIC_BASE}/${id}.jpg`;
  await db.collection("listings").doc(id).update({ imageUrl: url });
  console.log(`✓ ${id}  →  ${url}`);
}

process.exit(0);
