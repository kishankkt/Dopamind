# DopaMind Update Guide & Versioning (Manual Workflow)

When you want to push an update to your users, you are doing two things:
1. **Building the new app version** with a higher version number.
2. **Updating a single remote file (`release.json`)** on GitHub so the old apps know an update exists.

Here is your exact step-by-step guide for managing versions and pushing updates manually.

### 1. Understanding Versioning (Semantic Versioning)
We use standard 3-part versioning (e.g., `v0.1.0`).
* **Major (1.0.0):** Huge complete rewrites or massive new features.
* **Minor (0.2.0):** New games, new dashboard tabs, or medium features.
* **Micro/Patch (0.1.1):** Bug fixes, UI tweaks, small changes.

### 2. Step-by-Step Update Workflow

When you finish making changes and want to send an update to all your users, follow these exact steps:

**Step 1: Bump the version in your Code**
You must change the version number in two files so the app knows its new identity. Let's say we are upgrading from `0.1.0` to `0.1.1`:
* **`tauri.conf.json`**: Change `"version": "0.1.0"` to `"version": "0.1.1"`
* **`package.json`**: Change `"version": "0.1.0"` to `"version": "0.1.1"`

**Step 2: Build the New Update Packages**
Run the build command in your terminal:
`npm run tauri build`

Because you have the updater configured, Tauri will generate a few extra files this time. In `src-tauri/target/release/bundle/msi/`, you will see:
* `DopaMind_0.1.1_x64_en-US.msi` (The actual installer)
* `DopaMind_0.1.1_x64_en-US.msi.zip` (The compressed update package)
* `DopaMind_0.1.1_x64_en-US.msi.zip.sig` (The cryptographic signature file)

**Step 3: Upload the Update File to GitHub**
Go to your GitHub repository -> **Releases** -> **Create a New Release**.
* Tag version: `v0.1.1`
* Attach the `DopaMind_0.1.1_x64_en-US.msi.zip` file to the release.
* Copy the download URL of that `.zip` file.

**Step 4: Update `release.json` (The Magic File)**
Open your `release.json` file in the root of your project. This is the file that every single desktop app reads every time it launches. Update it to look like this:

```json
{
  "version": "v0.1.1",
  "notes": "Added the awesome new Web Bridge login flow!",
  "pub_date": "2026-07-09T14:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "PASTE_THE_CONTENTS_OF_THE_.SIG_FILE_HERE",
      "url": "https://github.com/kishankkt/Dopamind/releases/download/v0.1.1/DopaMind_0.1.1_x64_en-US.msi.zip"
    }
  }
}
```
*Note: The `signature` string is the literal text inside the `.sig` file generated in Step 2. Open the `.sig` file in VSCode and copy its contents.*

**Step 5: Push `release.json` to GitHub**
Run your standard git commands:
`git add release.json`
`git commit -m "Release v0.1.1"`
`git push`

### What Happens Next?
1. The moment you push `release.json` to GitHub, it goes live.
2. A user opens their older `v0.1.0` DopaMind app.
3. The app instantly reads `release.json` in the background and notices the remote version (`v0.1.1`) is higher than its internal version (`0.1.0`).
4. A beautiful native popup appears: *"A new version (v0.1.1) is available: Added the awesome new Web Bridge login flow! Do you want to install it?"*
5. The user clicks **Yes**, and Tauri automatically downloads the `.zip`, verifies the cryptographic signature so it knows it wasn't hacked, closes the app, installs the update, and reopens it!
