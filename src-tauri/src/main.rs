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

#[tauri::command]
fn edit_entry(index: usize, title: String, content: String, date: String) -> Result<String, String> {
    let path = "entries.json";

    if Path::new(path).exists() {
        let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
        let mut entries: Vec<Entry> = serde_json::from_str(&data).map_err(|e| e.to_string())?;

        if index < entries.len() {
            entries[index] = Entry { title, content, date };
            let data = serde_json::to_string(&entries).map_err(|e| e.to_string())?;
            fs::write(path, data).map_err(|e| e.to_string())?;
            Ok("Günlük güncellendi.".to_string())
        } else {
            Err("Geçersiz indeks.".to_string())
        }
    } else {
        Err("Günlük bulunamadı.".to_string())
    }
}

#[tauri::command]
fn delete_entry(index: usize) -> Result<String, String> {
    let path = "entries.json";

    if Path::new(path).exists() {
        let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
        let mut entries: Vec<Entry> = serde_json::from_str(&data).map_err(|e| e.to_string())?;

        if index < entries.len() {
            entries.remove(index);
            let data = serde_json::to_string(&entries).map_err(|e| e.to_string())?;
            fs::write(path, data).map_err(|e| e.to_string())?;
            Ok("Günlük silindi.".to_string())
        } else {
            Err("Geçersiz indeks.".to_string())
        }
    } else {
        Err("Günlük bulunamadı.".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_entry, get_entries, edit_entry, delete_entry])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}