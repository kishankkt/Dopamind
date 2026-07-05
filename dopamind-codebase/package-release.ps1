$ErrorActionPreference = "Stop"

Write-Host "----------------------------------------"
Write-Host "📦 DopaMind Automated Release Packager"
Write-Host "----------------------------------------"

# 1. Read package.json version
$packageJsonPath = "package.json"
if (!(Test-Path $packageJsonPath)) {
    Write-Host "❌ Error: Must run this script from inside dopamind-codebase/" -ForegroundColor Red
    exit 1
}

$packageJson = Get-Content -Raw -Path $packageJsonPath | ConvertFrom-Json
$version = $packageJson.version

# 2. Get OS and Chipset
$os = "Windows"
$chipset = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
if ($env:PROCESSOR_ARCHITECTURE -match "ARM") { $chipset = "arm64" }

# 3. Get Date
$date = Get-Date -Format "yyyy-MM-dd"

# 4. Define Target Directory
$targetDir = "public/downloads/$os/$chipset/v${version}_$date"
if (!(Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Write-Host "🚀 Building Tauri Desktop App (v$version)..."
# 5. Run Tauri Build
npm run tauri build

# 6. Copy Installers
$msiDir = "src-tauri/target/release/bundle/msi"
$exeDir = "src-tauri/target/release/bundle/nsis"

Write-Host "📂 Copying output files to $targetDir..."

$filesCopied = 0

if (Test-Path -Path $msiDir) {
    Copy-Item -Path "$msiDir\*.msi" -Destination $targetDir -Force
    Write-Host "  ✔️ Copied MSI installer" -ForegroundColor Green
    $filesCopied++
}

if (Test-Path -Path $exeDir) {
    Copy-Item -Path "$exeDir\*.exe" -Destination $targetDir -Force
    Write-Host "  ✔️ Copied EXE installer" -ForegroundColor Green
    $filesCopied++
}

if ($filesCopied -eq 0) {
    Write-Host "⚠️ Warning: No installers found. Did the Tauri build succeed?" -ForegroundColor Yellow
} else {
    Write-Host "----------------------------------------"
    Write-Host "✅ Packaging Complete!" -ForegroundColor Green
    Write-Host "Installers are ready at: $targetDir"
    Write-Host "Run 'git add public/downloads' to push the new versions to Vercel."
    Write-Host "----------------------------------------"
}
