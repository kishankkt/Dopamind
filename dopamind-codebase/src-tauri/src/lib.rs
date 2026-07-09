use tauri_plugin_deep_link::DeepLinkExt;

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
        app.deep_link().register_all().expect("Failed to register deep link");
      }
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_deep_link::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
