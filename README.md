# OMNI-DECK // The Universal Cyber-Suite

> *A high-density, pixel-modernist command deck housing 120+ integrated offline-first utilities, media extraction engines, security analyzers, and local infrastructure tools.*

---

## ⚡ Overview & Design Philosophy

OMNI-DECK was built from the ground up without generic AI templates or sterilizing purple gradients. It marries authentic **Swiss typography** with **8-bit arcade responsiveness**, tactile micro-interactions, CRT scanlines, and an authentic neo-arcade palette (Arcade Emerald, Amber Gold, Cyber Coral, Cobalt Cyan, and Charcoal Void).

Every single tool is fully operational, with client-side performance, local storage persistence, and a powerful Node.js backend powering native media pipelines.

---

## 🛠️ Complete Feature Matrix

### 1. 📥 Universal Downloader (Seal & SpotDL Engineered)
* **All Video Platforms**: YouTube, Instagram (Reels & Posts), Twitter / X, TikTok, Reddit, Facebook, Twitch, Vimeo, SoundCloud, and 1,000+ yt-dlp supported sites.
* **Maximum Quality Extraction**: 8K, 4K (2160p), 1440p, 1080p FHD, 720p HD, and 480p SD.
* **Lossless & Hi-Fi Audio Containers**: MP3 (320kbps), FLAC, M4A (AAC), WAV, and OPUS.
* **Seal Advanced Features**:
  * **Clip Trimmer**: Set custom start (`hh:mm:ss`) and end timestamps to download exact segments.
  * **SponsorBlock**: Automatically remove sponsored segments, intros, and outro cards.
  * **Subtitles**: Download and embed multi-language `.srt` and `.vtt` subtitles into the file container.
  * **Cover Art**: Embed original high-res thumbnail into ID3 tags.
  * **Custom yt-dlp Flags**: Inject expert arguments (e.g., `--geo-bypass`, `--cookies`).
* **Spotify & Music Stream Resolver**: Search Spotify tracks, albums, and playlists; matches and downloads high-bitrate streaming audio with complete ID3 tags and album artwork.
* **Live Progress Engine**: Real-time download speed, ETA, percentage gauge, and session download archive.

---

### 2. 🛡️ Safe URL Checker & Unshortener
* **Redirect Chain Tracer**: Unshortens `bit.ly`, `t.co`, `tinyurl`, and tracks up to 15 redirect hops with HTTP status codes and latency.
* **Security & Threat Heuristics**: Punycode/homograph detection, direct IP hostnames, deceptive subdomains, and credential phishing keywords.
* **Surveillance Tracker Stripper**: Automatically purges `utm_*`, Facebook `fbclid`, Google `gclid`, and marketing beacons.
* **DNS Resolution**: Live query of IPv4 (A), MX mail servers, and TXT security records.
* **Safety Trust Meter**: 0 to 100 Safety Score with instant verdict (`SAFE`, `CAUTION`, `DANGEROUS`).

---

### 3. 🌐 Local SHTTPS Server Host (Enhanced shttps)
* **Instant HTTPS/HTTP Hosting**: Spin up local servers on any port (e.g. 8443, 8080, 3000) with one click.
* **Self-Signed SSL Auto-Forge**: Generates 2048-bit RSA certificates on the fly with localhost and LAN IP SANs.
* **Mobile LAN Testing with QR Code**: Generates phone-scannable QR code to connect and test local web projects over Wi-Fi.
* **Mobile File Uploading**: Drag and drop files from phone or browser directly into the hosted directory.
* **Live Request Inspector**: Real-time HTTP log stream with status codes, latency, and client user-agent.
* **Security Controls**: Toggle Basic Authentication and CORS headers.

---

### 4. 🎨 Image Toolbox Studio (T8RIN Full Suite)
* **Image Compressor**: Compress WebP, JPEG, PNG, and AVIF with quality sliders and side-by-side savings stats.
* **Aspect Resizer**: Scale by pixels or percentages with aspect ratio lock and choice of smooth bicubic or nearest-neighbor pixel scaling.
* **8-Bit Pixel Art Generator**: Authentic retro palette downsampling (Game Boy 4-shade green, NES, Commodore 64, Cyberpunk).
* **Background Remover**: Local edge and luminance transparency isolation.
* **Watermark Stamper**: Text watermark with opacity, position grid, and rotation.
* **Palette Extractor**: Extract dominant 8-color palette with HEX and RGB copy triggers.
* **Vector Signature Maker**: Draw ink signature on transparent canvas with direct PNG export.

---

### 5. 📄 PDF Suite (PaperKnife Full Suite)
* **PDF Merge**: Drag, drop, reorder, and combine multiple PDF documents into a single document using `pdf-lib`.
* **PDF Split & Page Extractor**: Extract custom page ranges (e.g., `1-3, 5`).
* **Page Rotator**: Rotate pages by 90°, 180°, or 270°.
* **Watermark Stamp**: Stamp diagonal security watermarks (e.g. `CONFIDENTIAL`) with opacity sliders.
* **Images to PDF**: Convert and bundle PNG and JPG pictures into a formatted PDF document.

---

### 6. ⏰ Date & Time Chronometry
* **Digital Matrix Clock**: 7-segment retro LED display with seconds, milliseconds, and UTC offset.
* **Analog Chrono Clock**: Smooth SVG analog dial with second tick hand.
* **Precision Stopwatch**: Millisecond precision with lap times, split intervals, and reset controls.
* **Pomodoro Focus Timer**: 25m focus and 5m break cycles with 8-bit bell sounds.
* **Tactile Tally Counter**: Large interactive tap counter with adjustable step modifiers.
* **World Timezones**: Live synchronized clocks for New York, London, Tokyo, Dubai, Sydney, and Delhi.
* **Date Duration Difference**: Calculate exact days, weeks, hours, and minutes between any two calendar dates.

---

### 7. 🧮 Calculators & Mathematics
* **Full Scientific Calculator**: All symbols ($\sin, \cos, \tan, \ln, \log_{10}, \sqrt{}, x^y, \pi, e, \text{rad/deg}$, parentheses, modulo).
* **Live Exact Age Calculator**: Live ticking age calculation down to the exact second lived.
* **BMI Health Calculator**: Body Mass Index with interactive gauge and category ranges.
* **Discount & Tax Calculator**: Original price, discount %, and tax calculation with net savings.
* **Fuel & Mileage Calculator**: Total fuel consumed, trip cost, and per-passenger split cost.
* **Electricity / Power Consumption**: Wattage, hours/day, kWh rate, and monthly/yearly cost forecast.
* **Pie & Bar Chart Makers**: Enter comma-separated labels and values to render exportable charts.

---

### 8. 💼 Financial Suite
* **Itemized Invoice Generator**: Company details, client billing, line items, tax rate, and direct printable PDF export.
* **Mutual Funds / SIP & Lumpsum**: Compound wealth forecaster with annual interest projections.
* **Loan & EMI Calculator**: Monthly EMI installment, total interest payable, and amortization overview.
* **GST & Tax Slabs**: Exclusive and Inclusive GST calculations with standard slabs.
* **Personal Expense Tracker**: Log daily incomes and expenses with live balance ledger.

---

### 9. 🛠️ Daily & Essential Tools
* **Screen Flashlight**: Ultra-bright display torch with solid white, strobe beacon, and SOS Morse auto-flash.
* **QR Code Generator**: High-contrast QR codes for URLs, Wi-Fi networks, and text.
* **English Dictionary**: Word definitions, phonetics, parts of speech, and usage examples.
* **Quick Notes**: Autosave Markdown scratchpad with word and character counters.
* **To-Do & Kanban Board**: Mission tracker with checkoffs, persistent storage, and delete triggers.
* **Shopping List**: Shopping list with item pricing and auto-updating total estimate.

---

### 10. 📐 Hardware Sensors & Measurement
* **Calibrated Screen Ruler**: On-screen caliper measurement in centimeters and inches.
* **180° Interactive Protractor**: Angular measurement with draggable pointer.
* **2-Axis Spirit Level**: Dual-axis gyroscope bubble level for pitch and roll calibration.
* **Internet Speedometer**: Ping latency, download speed, and upload speed test gauge.
* **Acoustic Decibel Sound Meter**: Live microphone sound pressure level (dB) and acoustic category indicator.
* **Frequency Tone Oscillator**: Synthesize pure sine, square, sawtooth, and triangle waves from 50Hz to 3000Hz.
* **Digital Compass**: Real-time azimuth heading with cardinal compass directions.
* **Camera Mirror**: Front camera mirror with digital zoom and horizontal flip.

---

### 11. 🔤 Text & Cryptography
* **AES-256 Military Encryption**: Encrypt and decrypt sensitive messages using a custom secret key.
* **Text Counter**: Character, word, line count, and estimated reading time.
* **Morse Code Studio**: Encode text to Morse code with playable synthesized audio chirps.
* **Binary, Hex & Base64**: Instant multi-format text conversions.
* **Text to Speech (TTS)**: Web Speech API synthesizer with clear voice playback.
* **Text Diff Comparator**: Side-by-side and inline color-coded character/line diff checker.

---

### 12. 🎵 Media & Audio Studio
* **Hi-Fi Microphone Recorder**: Record microphone audio and export as WAV files.
* **Cyber Pixel Drawing Canvas**: Multi-color pixel drawing board with eraser, clear, and PNG export.

---

### 13. 💻 Hardware Diagnostics & System Info
* **Device Specs**: Direct readout of CPU cores, GPU/WebGL renderer, screen resolution, color depth, and RAM.
* **Battery Status**: Battery percentage and charging indicator.
* **Speaker Water & Dust Cleaner**: Emits 165Hz acoustic wave pulses to dislodge trapped water droplets.
* **Dead Pixel Screen Tester**: Fullscreen RGBW color cycler to identify monitor anomalies.

---

### 14. 🕹️ Retro 8-Bit Arcade Games
* **Retro Snake**: Classic 8-bit canvas snake game with keyboard controls and score tally.
* **Tic Tac Toe**: 2-Player tactile grid with win detection and reset triggers.
* **Chance Coin Toss**: Animated 3D flipping coin with statistics.
* **Dual Dice Roller**: Dual dice roller with sum counter and dice audio.

---

### 15. 🧘 Health & Wellness
* **Box Breathing (4-4-4-4)**: Guided visual breath pacer with inhale, hold, exhale, and rest phases.
* **Daily Hydration Tracker**: Log glasses toward a 2.5L daily hydration goal.
* **REM Sleep Cycle Calculator**: Calculates wake-up times aligned with natural 90-minute sleep cycles.
* **20-20-20 Eye Rest**: Ophthalmic eye relaxation guidance.

---

### 16. 💬 Social & Web Utilities
* **WhatsApp Direct**: Open chats with any phone number without saving it to contacts.
* **Instant Wi-Fi Access QR Code**: Generate scannable QR codes for seamless guest Wi-Fi join.
* **Social Caption Generator**: Generate Hype, Minimal, or Professional social media captions.

---

### 17. 💻 Developer & Network Suite
* **In-Browser JavaScript REPL**: Node.js VM sandbox with console stdout capture.
* **JSON Syntax Formatter**: Beautify, validate, and minify JSON with error detection.
* **Cryptographic Hash Generator**: Compute MD5, SHA-1, SHA-256, and SHA-512 hashes.
* **JWT Claims Decoder**: Inspect header algorithms and payload claims.
* **Live DNS Lookup**: Query A, MX, and TXT DNS records for any domain.

---

### 18. ⚡ Human Benchmark Suite
* **Reaction Time Test**: Millisecond reaction speed test with attempt averaging.
* **Aim & Reflex Target Trainer**: Rapid target clicking test for precision and speed.
* **Chimp Working Memory**: Number sequence memory grid inspired by primate cognition tests.
* **Typing Speed Test**: Live words per minute (WPM) typing benchmark.

---

## 🚀 Getting Started

### 1. Launch Omni-Deck
The server daemon is currently running on:
```
http://localhost:3001
```

To run manually at any time:
```bash
npm start
# or
node server/index.js
```

### 2. Keyboard Shortcuts
* `Ctrl + K` or `/`: Opens the **Universal Command Palette** to jump to any of the 120+ tools instantly.
* `Esc`: Close modals and search overlays.
* `CRT Scanlines`: Toggle in the top header status bar.
* `8-Bit Audio`: Toggle mechanical clicks and arcade sound effects in the header.

---

## 🎖️ Credits
* **Architect & Developer**: **Hatim Mushtaq**
* **Aesthetic**: Pixel Modernist / Swiss Retro-Futurism

