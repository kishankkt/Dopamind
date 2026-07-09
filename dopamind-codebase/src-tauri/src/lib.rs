use tauri_plugin_deep_link::DeepLinkExt;

#[cfg(windows)]
fn register_protocol_manually() {
    use winreg::enums::*;
    use winreg::RegKey;
    use std::env;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let path = "Software\\Classes\\dopamind";
    
    // Attempt to register if it doesn't exist or we just want to enforce it
    if let Ok((key, _)) = hkcu.create_subkey(path) {
        let _ = key.set_value("", &"URL:dopamind Protocol");
        let _ = key.set_value("URL Protocol", &"");
        
        if let Ok((shell_key, _)) = key.create_subkey("shell\\open\\command") {
            if let Ok(exe_path) = env::current_exe() {
                let command = format!("\"{}\" \"%1\"", exe_path.display());
                let _ = shell_key.set_value("", &command);
            }
        }
    }
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      #[cfg(any(windows, target_os = "linux"))]
      {
        use tauri_plugin_deep_link::DeepLinkExt;
        
        #[cfg(windows)]
        register_protocol_manually();

        let _ = app.deep_link().register_all();
      }
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_deep_link::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
