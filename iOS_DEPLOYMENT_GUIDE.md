# 🚀 EazyLink WiFi Calling - iOS Deployment Guide

## ✅ You Now Have

```
Team ID:      MV7236Q253
Bundle ID:    com.offgrid.eazylink
```

---

## 📋 Next Steps (Follow in Order)

### STEP 1: Update Your Project Files (5 min)

Copy these files to your `mobile/` folder:

1. **Replace:** `app.json` (includes iOS config + permissions)
2. **Create:** `eas.json` (build configuration)
3. **Create:** `.env.example` (template for secrets)
4. **Update:** `src/services/networkService.ts` (better WiFi detection)
5. **Update:** `.gitignore` (prevent committing secrets)

---

### STEP 2: Setup EAS Build Tool (3 min)

```bash
cd mobile

# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account (create at https://expo.io if needed)
eas login

# Initialize EAS for your project
eas init
```

During `eas init`, it will:
- Ask for project name
- Create/link to Expo project
- Update `app.json` with project ID

---

### STEP 3: Complete eas.json Configuration (2 min)

Edit `eas.json` and replace:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID_EMAIL@example.com",  ← REPLACE THIS
        "ascAppId": "YOUR_APP_ID_FROM_APP_STORE_CONNECT", ← GET THIS NEXT
        "appleTeamId": "MV7236Q253",
        "bundleIdentifier": "com.offgrid.eazylink"
      }
    }
  }
}
```

**What do you need?**
- `appleId`: Your Apple ID email (the one you used for developer account)
- `ascAppId`: You'll get this after creating app in App Store Connect (next step)

---

### STEP 4: Create App Store Connect Record (10 min)

Go to: https://appstoreconnect.apple.com

1. Click **"My Apps"** → **"+ Create new app"**
2. Fill in:
   ```
   Platform:        iOS
   Name:            EazyLink
   Bundle ID:       com.offgrid.eazylink (select from dropdown)
   SKU:             eazylink001 (any unique code)
   User Access:     Full Access
   ```
3. Click **"Create"**

4. **Copy your App ID** (shown as number like `1234567890`)
   - Update `eas.json` with this: `"ascAppId": "1234567890"`

---

### STEP 5: Fill In App Information (15 min)

In App Store Connect, complete these sections:

**App Information:**
- [ ] Category: Utilities
- [ ] Pricing: Free
- [ ] Description: 
  ```
  "EazyLink is a WiFi calling app that lets you call 
  international numbers over WiFi with crystal clear quality. 
  Perfect for staying connected with family and friends worldwide."
  ```

**App Privacy:**
- [ ] Privacy Policy URL: **REQUIRED** (add your URL or use template)
- [ ] Data Collection: Select as appropriate

**Screenshots & Branding:**
- [ ] 1-5 screenshots (1242x2208 px)
- [ ] App Icon (1024x1024 px)

**General:**
- [ ] Age Rating Questionnaire: Complete it
- [ ] Release Type: Manual Release

---

### STEP 6: Install Dependencies (2 min)

```bash
cd mobile
npm install
```

---

### STEP 7: Test Locally (Optional but Recommended)

```bash
# Start development server
npm start

# Press 'i' to open iOS simulator (requires macOS + Xcode)
# OR scan QR code with Expo Go app on physical iPhone
```

Test:
- [ ] App loads
- [ ] Dashboard screen shows connection status
- [ ] Contacts screen shows wife contact
- [ ] No console errors

---

### STEP 8: Build for iOS (15-30 min)

```bash
# Build for App Store
eas build --platform ios

# Track build progress
eas build:list
```

EAS will:
- Create signing certificates
- Build app for App Store
- Sign with your Team ID
- Upload to App Store Connect

**Wait for build to complete** (you'll get email notification)

---

### STEP 9: Submit to App Store Review (1 min)

**Option A: Auto-submit** (easiest)
```bash
eas build --platform ios --auto-submit
```

**Option B: Manual submit**
1. Go to App Store Connect
2. Select your app
3. Click "Build" section on right
4. Select your build
5. Answer compliance questions:
   - Encryption: No
   - Advertising: No
   - Data collection: No (unless applicable)
6. Click "Submit for Review"

---

### STEP 10: Wait for Apple Review (24-48 hours)

Apple will review for:
- ✅ Functionality
- ✅ Permission usage matches description
- ✅ Privacy compliance
- ✅ No prohibited content

**Possible outcomes:**
- ✅ Approved → Goes to next step
- ⚠️ Needs updates → Fixes and resubmit
- ❌ Rejected → Address issues and resubmit

---

### STEP 11: Release to App Store (5 min)

Once approved:
1. Go to App Store Connect
2. Select your app
3. Click "Release to App Store"
4. Or schedule for later

**App goes live in 1-2 hours!** 🎉

---

## 🔧 Before You Run Build Command

**Checklist:**

- [ ] `app.json` updated (your files in place)
- [ ] `eas.json` has your Team ID (MV7236Q253)
- [ ] `eas.json` has your Apple ID email
- [ ] `eas.json` has ascAppId (get from App Store Connect)
- [ ] `npm install` completed
- [ ] App Store Connect record created
- [ ] App information filled out (at least basic info)
- [ ] Privacy policy URL ready

---

## 📞 Need Help?

**Common Issues:**

**Q: Build fails**
```bash
# Clear cache and retry
eas build --platform ios --clear-cache
```

**Q: Can't find ascAppId**
- Go to App Store Connect
- Select your app
- Look for "App ID" on the main page (big number)
- Copy it

**Q: Certificate errors**
```bash
# Reset certificates
eas credentials
# Select iOS → Reset
```

**Q: Bundle ID mismatch**
- Ensure app.json, eas.json, and App Store Connect all have: `com.offgrid.eazylink`

---

## 📚 Reference Links

- **Expo Docs:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/eas-build/introduction
- **App Store Connect:** https://appstoreconnect.apple.com
- **Apple Developer:** https://developer.apple.com/account

---

## 🚀 Timeline Summary

```
Time 0:00   - Start this guide
Time 0:05   - Copy files to project
Time 0:08   - Run eas init
Time 0:10   - Create App Store Connect record
Time 0:25   - Fill app information
Time 0:27   - Run npm install
Time 0:30   - (Optional) Test locally
Time 0:45   - Run eas build
Time 1:15   - Build completes, submit for review
Time 1:16   - Apple review starts
Time 25:16  - Apple approval (24-48 hours)
Time 25:17  - Release to App Store
Time 25:19  - App live! 🎉
```

---

## 🎯 WiFi Calling Feature

Your app now has:
- ✅ Real WiFi detection (`networkService.ts`)
- ✅ Network monitoring
- ✅ Call prerequisites checking
- ✅ Contact management
- ✅ Call screen UI (demo mode)

**Next phase (after launch):**
- 🔜 Agora VoIP integration (real calling)
- 🔜 Backend authentication server
- 🔜 Call history & persistence
- 🔜 eSIM support
- 🔜 Satellite fallback

---

## ✅ Success Indicators

You'll know you're successful when:

1. ✅ `eas build` completes without errors
2. ✅ Build appears in App Store Connect
3. ✅ App submitted for review
4. ✅ Status shows "Waiting for Review"
5. ✅ Apple approves (email confirmation)
6. ✅ App appears on App Store
7. ✅ You can download from App Store
8. ✅ Call your wife in Thailand over WiFi! 🇹🇭🇺🇸

---

## 💡 Pro Tips

✅ Have privacy policy URL ready
✅ Use good screenshots (show WiFi calling feature)
✅ Mention WiFi calling in app description
✅ Test on real device before submitting
✅ Keep version numbers organized
✅ Monitor first 48 hours after launch for crashes
✅ Have fun celebrating! 🎉

---

**Ready? Start with Step 1: Update Your Project Files**

Let me know if you get stuck! 🚀
