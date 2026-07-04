# 💬 DopaMind Support & FAQ Center

Welcome to the DopaMind support center. If you are experiencing technical issues, please refer to the answers below or contact support.

---

## 🍏 macOS Gatekeeper Security Bypass Guide

Since we build and package the macOS `.dmg` file locally to avoid high yearly developer licensing fees, the app is ad-hoc self-signed. When you first install and double-click the app, macOS may block it:

> ⛔ **Error Dialog:** *"DopaMind cannot be opened because it is from an unidentified developer."*

### 🛠️ How to Open DopaMind (Right-Click Bypass Method):
To authorize the app on your Mac, you only need to perform this simple sequence once:
1. Locate the installed **DopaMind.app** in your `/Applications` directory or standard Finder window.
2. Hold down the **Control** key and click the app icon (or **Right-Click**).
3. Select **Open** from the drop-down menu.
4. A warning dialog will appear. Click **Open** again to confirm.
5. macOS will whitelist DopaMind. Going forward, you can open the app normally by double-clicking it.

---

## ❓ Frequently Asked Questions (FAQ)

### Q1: How does the adaptive difficulty algorithm work?
If you get 3 consecutive correct matches in SpeedMatch, the symbols will appear faster to challenge your brain. If you make 2 consecutive mistakes, the app immediately drops back to a slow speed and serves simpler shapes. This prevents focus fatigue and provides a dopamine recovery path.

### Q2: How is my streak maintained?
Your daily streak plants a "pixel plant" that grows each day you log in and complete a training session. If you miss a day, the plant will start to wither. You can purchase a streak recovery token or share the app to protect your progress.

### Q3: Are my payments and account credentials secure?
Yes. Your credentials are secure using industry-standard OAuth through Supabase. Payment transactions are processed entirely off-site on secure, PCI-compliant Stripe or Razorpay checkout portals. We do not store credit card details.

---

## ✉️ Contact Support

If you have other issues, please open a ticket:
* **Email Support:** `support@dopamind.app`
* **Response Time:** We aim to respond to all inquiries within 24–48 hours.
