$env:PATH = $env:PATH + ";C:\Users\PREMIUM\.cargo\bin"
Write-Host "PATH updated."
npx.cmd tauri build
