from flask import Flask, request, send_file, jsonify
import yt_dlp
import os
import glob

app = Flask(__name__)

def download_media(url, is_audio=False):
    os.makedirs('/tmp/downloads', exist_ok=True)
    outtmpl = '/tmp/downloads/%(title).45s.%(ext)s'

    ydl_opts = {
        'format': 'best',
        'outtmpl': outtmpl,
        'noplaylist': True,
        'quiet': True,
    }

    if is_audio:
        ydl_opts['format'] = 'bestaudio/best'
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        if is_audio and not filename.endswith('.mp3'):
            filename = os.path.splitext(filename)[0] + '.mp3'

    return filename

@app.route('/api/py_download', methods=['GET', 'POST'])
@app.route('/api/download', methods=['GET', 'POST'])
def download():
    url = None
    if request.method == 'POST':
        if request.is_json:
            url = request.json.get('url')
        elif request.form:
            url = request.form.get('url')
    if not url:
        url = request.args.get('url')

    if not url:
        return "Error: Missing video URL parameter", 400

    url = url.strip()
    is_audio = (
        request.args.get('type') == 'audio' or
        (request.form.get('type') == 'audio' if request.form else False) or
        (request.is_json and request.json.get('type') == 'audio' if request.is_json else False)
    )

    try:
        filepath = download_media(url, is_audio=is_audio)
        if not os.path.exists(filepath):
            # Check if extension changed
            base = os.path.splitext(filepath)[0]
            matches = glob.glob(base + '.*')
            if matches:
                filepath = matches[0]

        return send_file(filepath, as_attachment=True)
    except Exception as e:
        return f"Download error: {str(e)}", 500

# Vercel Serverless Function entrypoint
app.debug = False
