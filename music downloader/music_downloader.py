#!/usr/bin/env python3
"""
music_downloader.py
Download a single YouTube video or a whole playlist as MP3 files using yt-dlp + ffmpeg.

Usage:
    python music_downloader.py
    (then paste a video or playlist URL)

Requirements:
    pip install -U yt-dlp
    ffmpeg installed and available on PATH
"""

import os
import sys
import shutil
from yt_dlp import YoutubeDL

# CONFIG
OUTPUT_DIR = "downloads"              # change to a short path if you get Windows path errors
ARCHIVE_FILE = "downloaded.txt"       # keeps track of already downloaded video IDs
MP3_QUALITY = "192"                   # kbps

# Progress hook (prints simple status)
def progress_hook(d):
    status = d.get('status')
    if status == 'downloading':
        total = d.get('total_bytes') or d.get('total_bytes_estimate')
        downloaded = d.get('downloaded_bytes', 0)
        if total:
            pct = downloaded / total * 100
            sys.stdout.write(f"\rDownloading: {d.get('filename','')}  {pct:5.1f}%")
            sys.stdout.flush()
    elif status == 'finished':
        print(f"\nFinished downloading: {d.get('filename')}")
    elif status == 'error':
        print("\nError in download hook:", d)

def check_ffmpeg():
    ff = shutil.which("ffmpeg")
    if ff is None:
        print("ERROR: ffmpeg executable not found in PATH.")
        print(" Install ffmpeg and ensure it's on PATH (https://ffmpeg.org/download.html).")
        return False
    return True

def make_outtmpl(output_dir):
    # use yt-dlp templating with restricted filenames; put into playlist folder if playlist
    # %(ext)s will be converted to mp3 by postprocessor
    return os.path.join(output_dir, "%(playlist_title)s", "%(playlist_index)03d - %(title)s.%(ext)s")

def main():
    if not check_ffmpeg():
        return

    url = input("Enter YouTube video or playlist URL: ").strip()
    if not url:
        print("No URL provided — exiting.")
        return

    # ensure output dir exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': make_outtmpl(OUTPUT_DIR),
        'restrictfilenames': True,            # avoid weird chars in filenames
        'noplaylist': False,                  # allow playlists and single videos
        'ignoreerrors': True,
        'no_warnings': True,
        'progress_hooks': [progress_hook],
        'postprocessors': [
            {'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3', 'preferredquality': MP3_QUALITY},
            {'key': 'EmbedThumbnail'},
            {'key': 'FFmpegMetadata'},
        ],
        'download_archive': ARCHIVE_FILE,     # skip already-downloaded videos
        'retries': 3,
        'socket_timeout': 20,
        'http_headers': {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'},
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            print("Starting download. This may take a while for big playlists...")
            info = ydl.extract_info(url, download=True)
            # Print summary
            if info is None:
                print("No items downloaded (maybe private/removed?).")
            else:
                title = info.get('title') or info.get('playlist_title') or "Unknown"
                print(f"\nDone. Playlist/title: {title}")
                print(f"Saved to: {os.path.abspath(OUTPUT_DIR)}")
    except Exception as e:
        print("Fatal error:", e)

if __name__ == "__main__":
    main()
