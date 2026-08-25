import os
import sys
import re
import json

# Forçar codificação UTF-8 para stdout no Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtube.readonly'
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREDENTIALS_FILE = os.path.join(BASE_DIR, 'scripts', 'client_secrets.json')
TOKEN_FILE = os.path.join(BASE_DIR, 'scripts', 'token.json')
OUTPUT_DIR = os.path.join(BASE_DIR, 'content', 'transcripts')

def get_authenticated_service():
    """Autentica o canal do YouTube usando OAuth 2.0 oficial do Google."""
    creds = None
    
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                print(f"\n[!] Arquivo '{CREDENTIALS_FILE}' não encontrado.\n")
                sys.exit(1)
            
            print("\n[+] Iniciando autenticação OAuth 2.0 com sua conta Google...")
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
            
        with open(TOKEN_FILE, 'w', encoding='utf-8') as token:
            token.write(creds.to_json())
            print(f"[✓] Token de autenticação salvo em {TOKEN_FILE}")
            
    return build('youtube', 'v3', credentials=creds)

def list_channel_videos(youtube, max_results=10):
    """Lista os vídeos mais recentes do seu próprio canal."""
    channels_response = youtube.channels().list(mine=True, part='contentDetails,snippet').execute()
    
    if not channels_response.get('items'):
        print("[!] Nenhum canal associado a esta conta Google foi encontrado.")
        return []
    
    channel_title = channels_response['items'][0]['snippet']['title']
    uploads_playlist_id = channels_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
    
    print(f"\n[+] Canal Autenticado: {channel_title}")
    print(f"[+] Buscando os últimos {max_results} vídeos/lives...\n")
    
    playlist_response = youtube.playlistItems().list(
        playlistId=uploads_playlist_id,
        part='snippet',
        maxResults=max_results
    ).execute()
    
    videos = []
    for item in playlist_response.get('items', []):
        snippet = item['snippet']
        videos.append({
            'id': snippet['resourceId']['videoId'],
            'title': snippet['title'],
            'publishedAt': snippet['publishedAt'],
            'description': snippet['description']
        })
    return videos

def clean_srt_to_text(srt_content):
    """Converte formato SRT/VTT em texto corrido e limpo."""
    lines = srt_content.splitlines()
    text_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if re.match(r'^\d+$', line):
            continue
        if re.match(r'^\d{2}:\d{2}:\d{2}', line) or '-->' in line:
            continue
        cleaned = re.sub(r'<[^>]+>', '', line)
        if cleaned and (not text_lines or cleaned != text_lines[-1]):
            text_lines.append(cleaned)
    return " ".join(text_lines)

def download_transcript(youtube, video_id, video_title=""):
    """Baixa a legenda oficial do vídeo via YouTube Data API v3."""
    print(f"[*] Buscando legendas para o vídeo: [{video_id}] {video_title}...")
    
    captions_response = youtube.captions().list(
        videoId=video_id,
        part='snippet'
    ).execute()
    
    caption_items = captions_response.get('items', [])
    if not caption_items:
        print(f"[!] Nenhuma legenda disponível para o vídeo {video_id}.")
        return None
    
    selected_caption = caption_items[0]
    for c in caption_items:
        lang = c['snippet'].get('language', '')
        if lang.startswith('pt'):
            selected_caption = c
            break
            
    caption_id = selected_caption['id']
    lang = selected_caption['snippet'].get('language', 'pt')
    print(f"[+] Baixando faixa de legenda ID '{caption_id}' (Idioma: {lang})...")
    
    raw_bytes = youtube.captions().download(
        id=caption_id,
        tfmt='srt'
    ).execute()
    
    raw_caption = raw_bytes.decode('utf-8', errors='replace')
    clean_text = clean_srt_to_text(raw_caption)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    slug = re.sub(r'[^a-zA-Z0-9_-]', '-', video_title.lower()).strip('-')
    slug = re.sub(r'-+', '-', slug)[:50]
    output_path = os.path.join(OUTPUT_DIR, f"{video_id}_{slug}.txt")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(f"Título: {video_title}\nVídeo ID: {video_id}\nURL: https://www.youtube.com/watch?v={video_id}\nIdioma: {lang}\n\n{clean_text}")
        
    print(f"[✓] Transcrição salva com sucesso em: {output_path} ({len(clean_text)} caracteres)\n")
    return clean_text

def main():
    print("=" * 60)
    print("EXTRATOR OFICIAL DE TRANSCRIÇÕES DO YOUTUBE (DATA API v3)")
    print("=" * 60)
    
    youtube = get_authenticated_service()
    videos = list_channel_videos(youtube, max_results=10)
    
    if not videos:
        print("Nenhum vídeo encontrado.")
        return
        
    for i, v in enumerate(videos):
        print(f"[{i + 1}] ID: {v['id']} | Data: {v['publishedAt'][:10]} | Título: {v['title']}")
        
    if len(sys.argv) > 1:
        target_video_id = sys.argv[1]
        target_title = next((v['title'] for v in videos if v['id'] == target_video_id), "video")
        download_transcript(youtube, target_video_id, target_title)
    else:
        target = videos[1] if len(videos) > 1 else videos[0]
        download_transcript(youtube, target['id'], target['title'])

if __name__ == '__main__':
    main()
