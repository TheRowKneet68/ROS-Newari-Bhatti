from pytube import Playlist, YouTube
import os
import re

def sanitize_filename(name):
    """Remove invalid characters for Windows filenames"""
    return re.sub(r'[<>:"/\\|?*]', '', name)

def download_playlist_as_mp3(playlist_url, output_path="Downloads"):
    try:
        playlist = Playlist(playlist_url)

        # Clean playlist title for safe folder name
        safe_title = sanitize_filename(playlist.title)
        playlist_folder = os.path.join(output_path, safe_title)
        if not os.path.exists(playlist_folder):
            os.makedirs(playlist_folder)

        print(f"📂 Downloading Playlist: {playlist.title}")
        print(f"🎵 Total videos: {len(playlist.video_urls)}")

        for index, video_url in enumerate(playlist.video_urls, start=1):
            try:
                yt = YouTube(video_url)
                print(f"\n{index}. {yt.title}")

                # Download best audio
                stream = yt.streams.filter(only_audio=True).first()
                out_file = stream.download(output_path=playlist_folder)

                # Convert to mp3
                base, ext = os.path.splitext(out_file)
                new_file = base + ".mp3"
                if not os.path.exists(new_file):
                    os.rename(out_file, new_file)

                print(f"✅ Saved as {new_file}")
            except Exception as e:
                print(f"❌ Error downloading {video_url}: {e}")

        print("\n🎉 Playlist download completed!")

    except Exception as e:
        print("❌ Error:", e)


if __name__ == "__main__":
    url = input("Enter YouTube playlist link: ")
    download_playlist_as_mp3(url)
