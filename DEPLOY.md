# Local Workers App — Deployment Guide
## Step-by-step: Firebase + Vercel, launch in 30 minutes

---

## STEP 1 — Set up Firebase (free)

1. Go to https://console.firebase.google.com
2. Click "Add project" → name it "local-workers"
3. Disable Google Analytics (not needed) → Create project

### Enable Authentication
- Left menu → Build → Authentication → Get started
- Sign-in method tab → Email/Password → Enable → Save

### Create your admin account
- Authentication → Users tab → Add user
- Email: your email (e.g. admin@gmail.com)
- Password: choose a strong password
- This is your admin login for the app

### Enable Firestore Database
- Left menu → Build → Firestore Database → Create database
- Choose "Start in test mode" → Next
- Select region: asia-south1 (Mumbai) → Enable

### Get your Firebase config
- Top left gear icon → Project settings
- Scroll down to "Your apps" → Click </> (Web)
- App nickname: "local-workers-web" → Register app
- Copy the firebaseConfig object

### Paste config into the app
- Open: src/lib/firebase.js
- Replace the placeholder values with your copied config

---

## STEP 2 — Set Firestore security rules

In Firebase console → Firestore → Rules tab, paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Workers: anyone can read approved, only admin can write
    match /workers/{id} {
      allow read: if resource.data.status == "approved";
      allow create: if true; // allow public registration
      allow update, delete: if request.auth != null;
    }

    // Payments: anyone can create, only admin can read/update
    match /payments/{id} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }
  }
}
```

Click "Publish"

---

## STEP 3 — Update your UPI ID

Open: src/components/UpgradeModal.js

Find this line:
  const YOUR_UPI_ID = "yourname@upi";

Replace with your actual UPI ID (e.g. "9876543210@ybl" or "yourname@paytm")

---

## STEP 4 — Deploy to Vercel (free)

### Option A — Using Vercel website (easiest)

1. Go to https://vercel.com → Sign up with GitHub
2. Upload your project folder to GitHub:
   - Go to https://github.com → New repository → "local-workers"
   - Upload all files
3. In Vercel → "Add New Project" → Import your GitHub repo
4. Framework: Create React App (auto-detected)
5. Click Deploy → Done in 2 minutes
6. Your app is live at: https://local-workers.vercel.app

### Option B — Using terminal

```bash
npm install -g vercel
cd localworkers
npm install
npm run build
vercel --prod
```

---

## STEP 5 — Custom domain (optional, ₹500–800/year)

Buy a domain like "nandyalworkers.in" from GoDaddy or Namecheap.
In Vercel → your project → Settings → Domains → Add your domain.
Follow DNS instructions shown.

---

## STEP 6 — Test before going live

1. Open your app URL
2. Go to "Register as Worker (Free)" → Submit a test registration
3. In Firebase console → Firestore → "workers" collection → you'll see the new entry with status: "pending"
4. Click Admin tab in app → Login with your admin email/password
5. You'll see the pending worker → click Approve
6. Go back to Find Workers → the worker should appear

---

## STEP 7 — Getting paid (₹49/month from workers)

When a worker clicks "Upgrade":
1. They see your UPI ID and pay ₹49
2. They enter their UTR number in the app
3. A record appears in Firestore "payments" collection
4. In Admin tab → "Payment confirmations pending" section
5. You verify the payment in your UPI app
6. Click "Confirm Payment" → worker becomes paid instantly

---

## STEP 8 — Getting paid from advertisers

To add a local business ad, open:
  src/pages/FindWorkers.js

Find the ADS array at the top and add/edit entries:

```js
const ADS = [
  {
    id: 1,
    logo: "🔩",
    name: "Ravi Hardware Store",
    sub: "Pipes, wires, tools • Home delivery available",
    phone: "9800000001",   // their phone number
    position: "top",       // "top" or "mid"
  },
  // add more advertisers here
];
```

Charge them ₹300–500/month. Collect via UPI, then add their info above.

---

## Monthly tasks (5 minutes)

1. Check Firebase → Firestore → payments collection for new payment requests
2. Verify UTR in your PhonePe/GPay → Confirm in admin panel
3. Reset "leadsToday" field in Firestore every morning (or automate with Cloud Functions)
4. Message workers whose trial is expiring → remind them to upgrade

---

## Revenue calculator

| Workers paying | Ad slots | Monthly income |
|---------------|----------|----------------|
| 10            | 2        | ₹1,290         |
| 25            | 3        | ₹2,425         |
| 50            | 4        | ₹4,050         |
| 80            | 5        | ₹5,920         |

---

## Support

If you get stuck on any step, the most common issues are:
- Firebase config not updated → check src/lib/firebase.js
- Firestore rules blocking data → re-check Step 2
- App not loading → run "npm install" and try again
