// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use serde::{Serialize, Deserialize};
use std::fs::{self, OpenOptions};
use std::path::Path;
use std::io::{self, Write};

#[derive(Serialize, Deserialize, Clone)]
struct Entry {
    title: String,
    content: String,
    date: String,
}

#[tauri::command]
fn save_entry(title: String, content: String, date: String) -> Result<String, String> {
    let entry = Entry { title, content, date };
    let path = "entries.json";

    let mut entries: Vec<Entry> = if Path::new(path).exists() {
        let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).map_err(|e| e.to_string())?
    } else {
        Vec::new()
    };

    entries.push(entry);

    let data = serde_json::to_string(&entries).map_err(|e| e.to_string())?;

    fs::write(path, data).map_err(|e| e.to_string())?;

    Ok("Günlük kaydedildi.".to_string())
}

#[tauri::command]
fn get_entries() -> Result<Vec<Entry>, String> {
    let path = "entries.json";
    if Path::new(path).exists() {
        let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
        let entries: Vec<Entry> = serde_json::from_str(&data).map_err(|e| e.to_string())?;
        Ok(entries)
    } else {
        Ok(Vec::new())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_entry, get_entries])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
