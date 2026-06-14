# Google Sheets Integration Setup

## Step 1: Open your Google Sheet
Go to: https://docs.google.com/spreadsheets/d/1zhZA7C7h2oqoB4PPyvp_ihjXP3UrQRNIlGvTjEwfojk/edit

## Step 2: Open Apps Script
1. Click on **Extensions** menu (top bar)
2. Click **Apps Script**
3. A new tab will open with the script editor

## Step 3: Copy-Paste the Script
1. Delete everything in the editor
2. Copy the entire code from the file `google-apps-script.js` in this folder
3. Paste it in the Apps Script editor

## Step 4: Deploy as Web App
1. Click **Deploy** button (top right)
2. Click **New deployment**
3. Click the gear icon next to "Select type" → choose **Web app**
4. Set these options:
   - Description: "Raj Life API"
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**
6. Click **Authorize access** → choose your Google account → Allow
7. Copy the **Web app URL** (looks like: `https://script.google.com/macros/s/XXXXX/exec`)

## Step 5: Update the App
1. Open the file `raj-life/src/config.js`
2. Replace the placeholder URL with your Web app URL

## Done!
Now your app will sync all data to Google Sheets automatically!
Each section has its own sheet tab, and you can create new monthly sheets from the app.
