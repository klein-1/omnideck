// Complete Catalog of all 90+ tools in OmniDeck with rich search metadata, aliases, and deep tab routing

export const ALL_TOOLS = [
  // ── 1. IMAGE STUDIO (imageToolbox) ──────────────────────────────────
  {
    id: 'image_compress',
    categoryId: 'imageToolbox',
    tabId: 'compress',
    category: 'IMAGE STUDIO',
    name: 'Image Compressor & Converter',
    description: 'Compress and convert WebP, AVIF, JPEG, PNG with side-by-side quality comparison',
    keywords: ['compress', 'convert', 'webp', 'avif', 'jpg', 'jpeg', 'png', 'optimize', 'shrink', 'size', 'reducer', 'photo', 'picture']
  },
  {
    id: 'image_resize',
    categoryId: 'imageToolbox',
    tabId: 'resize',
    category: 'IMAGE STUDIO',
    name: 'Image Resizer & Aspect Ratio Crop',
    description: 'Resize dimensions, maintain aspect ratios, and crop graphics with pixel precision',
    keywords: ['resize', 'crop', 'dimensions', 'scale', 'width', 'height', 'aspect ratio', 'resolution', 'aspect']
  },
  {
    id: 'image_filter',
    categoryId: 'imageToolbox',
    tabId: 'filter',
    category: 'IMAGE STUDIO',
    name: 'Photo Color Filter & Grading Matrix',
    description: 'Adjust brightness, contrast, saturation, sepia, invert, and apply cyber photo filters',
    keywords: ['filter', 'color', 'brightness', 'contrast', 'saturation', 'sepia', 'grayscale', 'invert', 'blur', 'effects']
  },
  {
    id: 'image_pixel',
    categoryId: 'imageToolbox',
    tabId: 'pixelate',
    category: 'IMAGE STUDIO',
    name: '8-Bit Retro Pixel Art Downsampler',
    description: 'Convert photos to authentic retro NES, GameBoy, and Cyberpunk pixel palettes',
    keywords: ['pixel', '8bit', 'pixel art', 'retro', 'nes', 'gameboy', 'downsample', 'palette', 'dithering', 'arcade', 'pixelate']
  },
  {
    id: 'image_bg',
    categoryId: 'imageToolbox',
    tabId: 'bgRemove',
    category: 'IMAGE STUDIO',
    name: 'Background Remover & Alpha Eraser',
    description: 'Remove solid backgrounds and isolate silhouettes locally directly in browser',
    keywords: ['background remover', 'bg remove', 'removebg', 'cutout', 'transparent', 'alpha', 'erase', 'isolate', 'silhouette', 'png']
  },
  {
    id: 'image_watermark',
    categoryId: 'imageToolbox',
    tabId: 'watermark',
    category: 'IMAGE STUDIO',
    name: 'Image Watermark & Stamp',
    description: 'Stamp custom diagonal or centered security watermarks on graphic files',
    keywords: ['watermark', 'stamp', 'logo', 'copyright', 'text overlay', 'protect', 'confidential']
  },
  {
    id: 'image_palette',
    categoryId: 'imageToolbox',
    tabId: 'palette',
    category: 'IMAGE STUDIO',
    name: 'Image Palette & Color Extractor',
    description: 'Extract dominant color palettes and hex swatches directly from any picture',
    keywords: ['palette', 'color extractor', 'extract colors', 'hex', 'swatches', 'dominant colors', 'eyedropper']
  },
  {
    id: 'image_sig',
    categoryId: 'imageToolbox',
    tabId: 'signature',
    category: 'IMAGE STUDIO',
    name: 'Vector Signature Maker',
    description: 'Draw transparent ink signature on touch canvas and export crystal-clear PNG',
    keywords: ['signature', 'sign', 'autograph', 'draw signature', 'transparent png', 'ink', 'pen', 'contract']
  },

  // ── 2. PDF SUITE (pdfSuite) ─────────────────────────────────────────
  {
    id: 'pdf_merge',
    categoryId: 'pdfSuite',
    tabId: 'merge',
    category: 'PDF SUITE',
    name: 'PDF Merge & Combine',
    description: 'Drag, drop, and bind multiple PDF files into one clean document',
    keywords: ['pdf merge', 'combine pdf', 'join pdf', 'bind pdf', 'stitch pdf', 'merge documents', 'unite']
  },
  {
    id: 'pdf_split',
    categoryId: 'pdfSuite',
    tabId: 'split',
    category: 'PDF SUITE',
    name: 'PDF Split & Page Extractor',
    description: 'Extract specific page ranges or separate individual sheets from any PDF',
    keywords: ['pdf split', 'split pdf', 'extract pages', 'separate pdf', 'cut pdf', 'page extractor']
  },
  {
    id: 'pdf_rotate',
    categoryId: 'pdfSuite',
    tabId: 'rotate',
    category: 'PDF SUITE',
    name: 'PDF Page Rotator',
    description: 'Rotate upside-down or sideways PDF pages by 90, 180, or 270 degrees',
    keywords: ['rotate pdf', 'pdf rotate', 'turn page', 'orientation', 'flip pdf', 'landscape', 'portrait']
  },
  {
    id: 'pdf_watermark',
    categoryId: 'pdfSuite',
    tabId: 'watermark',
    category: 'PDF SUITE',
    name: 'PDF Watermark Stamp',
    description: 'Stamp custom diagonal security watermarks on all document pages',
    keywords: ['pdf watermark', 'stamp pdf', 'draft', 'confidential', 'security stamp', 'watermark pages']
  },
  {
    id: 'pdf_img',
    categoryId: 'pdfSuite',
    tabId: 'imgToPdf',
    category: 'PDF SUITE',
    name: 'Images to PDF Converter',
    description: 'Combine PNG, JPG, and WebP pictures into one formatted PDF document',
    keywords: ['images to pdf', 'jpg to pdf', 'png to pdf', 'photos to pdf', 'convert to pdf', 'pictures to pdf']
  },

  // ── 3. DATE & TIME (dateTime) ───────────────────────────────────────
  {
    id: 'dt_clocks',
    categoryId: 'dateTime',
    tabId: 'clocks',
    category: 'DATE & TIME',
    name: 'Analog & Digital CRT Clocks',
    description: 'Real-time 7-segment digital display and smooth SVG analog chronometer',
    keywords: ['clock', 'analog clock', 'digital clock', 'time', 'current time', '7 segment', 'watch', 'now']
  },
  {
    id: 'dt_epoch',
    categoryId: 'dateTime',
    tabId: 'epoch',
    category: 'DATE & TIME',
    name: 'Unix Epoch Timestamp Converter',
    description: 'Convert Unix seconds/milliseconds to human date & relative time calculations',
    keywords: ['epoch', 'unix', 'timestamp', 'epoch converter', 'posix', 'milliseconds', 'seconds', 'datetime']
  },
  {
    id: 'dt_stopwatch',
    categoryId: 'dateTime',
    tabId: 'stopwatch',
    category: 'DATE & TIME',
    name: 'Precision Stopwatch & Laps',
    description: 'Millisecond timer with lap recorder, split intervals, and tactile controls',
    keywords: ['stopwatch', 'timer', 'lap timer', 'split timer', 'chronometer', 'track time', 'racing']
  },
  {
    id: 'dt_pomodoro',
    categoryId: 'dateTime',
    tabId: 'pomodoro',
    category: 'DATE & TIME',
    name: 'Pomodoro Focus Intervals',
    description: '25m focus and 5m break work timer with 8-bit bell notifications',
    keywords: ['pomodoro', 'focus timer', 'productivity', 'study timer', 'work interval', 'break timer', '25 min']
  },
  {
    id: 'dt_tally',
    categoryId: 'dateTime',
    tabId: 'tally',
    category: 'DATE & TIME',
    name: 'Tactile Tally Counter',
    description: 'Digital step counter with tap sounds, score keeper, and step size adjustments',
    keywords: ['tally', 'counter', 'clicker', 'count', 'tap counter', 'score keeper', 'step count']
  },
  {
    id: 'dt_zones',
    categoryId: 'dateTime',
    tabId: 'zones',
    category: 'DATE & TIME',
    name: 'World Timezones Matrix',
    description: 'Live multi-city world clock grid across UTC, London, New York, Tokyo, Sydney',
    keywords: ['world clock', 'timezones', 'gmt', 'utc', 'est', 'pst', 'time in london', 'time in tokyo', 'cities']
  },
  {
    id: 'dt_datediff',
    categoryId: 'dateTime',
    tabId: 'datediff',
    category: 'DATE & TIME',
    name: 'Date Duration & Difference',
    description: 'Calculate days, weeks, months, and hours between any two calendar dates',
    keywords: ['date difference', 'days between', 'date duration', 'days calculator', 'how many days', 'countdown']
  },

  // ── 4. CALCULATORS (calculators) ────────────────────────────────────
  {
    id: 'calc_sci',
    categoryId: 'calculators',
    tabId: 'scientific',
    category: 'CALCULATORS',
    name: 'Full Scientific Calculator',
    description: 'Advanced trigonometry, logarithmic, radicals, and constant mathematical functions',
    keywords: ['calculator', 'calc', 'scientific calculator', 'sin', 'cos', 'tan', 'sqrt', 'log', 'math', 'evaluate']
  },
  {
    id: 'calc_units',
    categoryId: 'calculators',
    tabId: 'units',
    category: 'CALCULATORS',
    name: 'Universal Unit Converter',
    description: 'Convert length, weight, speed, temperature, and digital storage data units',
    keywords: ['unit converter', 'units', 'convert', 'length', 'weight', 'temperature', 'speed', 'miles', 'km', 'kg', 'lbs', 'celsius', 'fahrenheit', 'bytes', 'gb']
  },
  {
    id: 'calc_tip',
    categoryId: 'calculators',
    tabId: 'tip',
    category: 'CALCULATORS',
    name: 'Tip & Bill Split Calculator',
    description: 'Calculate tip percentage, per-person total, and bill rounding easily',
    keywords: ['tip', 'bill split', 'restaurant', 'dining', 'gratuity', 'split bill', 'per person', 'food bill']
  },
  {
    id: 'calc_loan',
    categoryId: 'calculators',
    tabId: 'loan',
    category: 'CALCULATORS',
    name: 'Loan & Mortgage Amortization',
    description: 'Estimate monthly payments, compound interest, and comprehensive loan schedule',
    keywords: ['loan', 'mortgage', 'amortization', 'monthly payment', 'interest', 'borrow', 'principal']
  },
  {
    id: 'calc_age',
    categoryId: 'calculators',
    tabId: 'age',
    category: 'CALCULATORS',
    name: 'Exact Live Age Calculator',
    description: 'Ticking age calculation down to the exact second, day, and leap year lived',
    keywords: ['age', 'age calculator', 'exact age', 'birthday', 'how old am i', 'dob', 'seconds lived']
  },
  {
    id: 'calc_bmi',
    categoryId: 'calculators',
    tabId: 'bmi',
    category: 'CALCULATORS',
    name: 'BMI Health Calculator',
    description: 'Body Mass Index gauge with metric and imperial units and health classification',
    keywords: ['bmi', 'body mass index', 'weight', 'height', 'obesity', 'underweight', 'healthy weight', 'health calc']
  },
  {
    id: 'calc_discount',
    categoryId: 'calculators',
    tabId: 'discount',
    category: 'CALCULATORS',
    name: 'Discount & Sales Tax Calculator',
    description: 'Calculate sale price discounts, final cost, and sales tax savings',
    keywords: ['discount', 'sale', 'percentage off', 'tax', 'savings', 'promo', 'retail discount']
  },
  {
    id: 'calc_fuel',
    categoryId: 'calculators',
    tabId: 'fuel',
    category: 'CALCULATORS',
    name: 'Fuel & Mileage Cost Calculator',
    description: 'Calculate trip fuel cost, gas consumption, and vehicle distance economy',
    keywords: ['fuel', 'mileage', 'gas', 'trip cost', 'petrol', 'diesel', 'mpg', 'l/100km', 'car trip']
  },
  {
    id: 'calc_electricity',
    categoryId: 'calculators',
    tabId: 'electricity',
    category: 'CALCULATORS',
    name: 'Power & Electricity Consumption',
    description: 'Calculate appliance wattage, kilowatt-hours (kWh), and monthly energy bills',
    keywords: ['power', 'electricity', 'wattage', 'watts', 'kwh', 'energy bill', 'appliance', 'electric cost']
  },
  {
    id: 'calc_charts',
    categoryId: 'calculators',
    tabId: 'charts',
    category: 'CALCULATORS',
    name: 'Pie & Bar Chart Maker',
    description: 'Enter labels and data values to generate downloadable visual vector charts',
    keywords: ['charts', 'pie chart', 'bar chart', 'graph', 'chart maker', 'graph maker', 'visualize data']
  },

  // ── 5. FINANCE (finance) ───────────────────────────────────────────
  {
    id: 'fin_invoice',
    categoryId: 'finance',
    tabId: 'invoice',
    category: 'FINANCE',
    name: 'Professional Invoice Generator',
    description: 'Create itemized client invoices and export clean printable PDFs with totals',
    keywords: ['invoice', 'bill', 'receipt', 'client billing', 'invoice generator', 'pdf invoice', 'freelance invoice', 'estimate']
  },
  {
    id: 'fin_currency',
    categoryId: 'finance',
    tabId: 'currency',
    category: 'FINANCE',
    name: 'Live Currency Converter',
    description: 'Instant exchange rate calculator for USD, EUR, GBP, JPY, INR, CAD, AUD',
    keywords: ['currency', 'exchange rate', 'forex', 'currency converter', 'usd', 'eur', 'gbp', 'inr', 'jpy', 'dollar', 'euro', 'rupee', 'money']
  },
  {
    id: 'fin_sip',
    categoryId: 'finance',
    tabId: 'sip',
    category: 'FINANCE',
    name: 'Mutual Funds & SIP Calculator',
    description: 'Compound wealth growth forecaster for recurring monthly investments',
    keywords: ['sip', 'mutual funds', 'investment', 'compound interest', 'wealth', 'wealth growth', 'returns', 'stocks']
  },
  {
    id: 'fin_emi',
    categoryId: 'finance',
    tabId: 'emi',
    category: 'FINANCE',
    name: 'Loan & EMI Amortization Calc',
    description: 'Calculate monthly loan installments, total interest paid, and repayment tenure',
    keywords: ['emi', 'emi calculator', 'car loan', 'home loan', 'personal loan', 'installment', 'monthly interest']
  },
  {
    id: 'fin_gst',
    categoryId: 'finance',
    tabId: 'gst',
    category: 'FINANCE',
    name: 'GST & Sales Tax Slabs',
    description: 'Calculate net price, gross total, and tax breakdowns across 5%, 12%, 18%, 28%',
    keywords: ['gst', 'tax', 'sales tax', 'vat', 'tax slabs', 'net amount', 'gross amount', 'tax calculator']
  },

  // ── 6. ESSENTIALS (essentials) ──────────────────────────────────────
  {
    id: 'ess_flashlight',
    categoryId: 'essentials',
    tabId: 'flashlight',
    category: 'ESSENTIALS',
    name: 'Screen Flashlight & Strobe Beacon',
    description: 'Ultra-bright display torch with solid colors, strobe pulses, and SOS Morse modes',
    keywords: ['flashlight', 'torch', 'white screen', 'strobe', 'sos', 'light', 'beacon', 'screen torch', 'bright']
  },
  {
    id: 'ess_passgen',
    categoryId: 'essentials',
    tabId: 'passgen',
    category: 'ESSENTIALS',
    name: 'CSPRNG & Diceware Password Generator',
    description: 'Cryptographically secure password & memorable passphrase generator with entropy score',
    keywords: ['password', 'password generator', 'passcode', 'diceware', 'random password', 'secure key', 'entropy', 'passphrase', 'pin']
  },
  {
    id: 'ess_qr',
    categoryId: 'essentials',
    tabId: 'qr',
    category: 'ESSENTIALS',
    name: 'QR Code Generator',
    description: 'Generate high-contrast scannable QR codes for URLs, text, and credentials',
    keywords: ['qr', 'qr code', 'qr generator', 'barcode', 'scan qr', 'create qr', 'link qr', 'share qr']
  },
  {
    id: 'ess_dictionary',
    categoryId: 'essentials',
    tabId: 'dictionary',
    category: 'ESSENTIALS',
    name: 'Instant English Word Dictionary',
    description: 'Fast lexicon definitions, phonetics, and grammatical word usage lookup',
    keywords: ['dictionary', 'word meaning', 'definition', 'vocabulary', 'thesaurus', 'synonyms', 'lexicon']
  },
  {
    id: 'ess_notes',
    categoryId: 'essentials',
    tabId: 'notes',
    category: 'ESSENTIALS',
    name: 'Autosave Quick Notes',
    description: 'Markdown scratchpad with word counter and persistent local storage memory',
    keywords: ['notes', 'quick notes', 'notepad', 'scratchpad', 'memo', 'markdown notes', 'autosave', 'draft']
  },
  {
    id: 'ess_todo',
    categoryId: 'essentials',
    tabId: 'todo',
    category: 'ESSENTIALS',
    name: 'Tactile To-Do & Task Board',
    description: 'Checklist task manager with retro click sounds and completion trackers',
    keywords: ['todo', 'to do', 'tasks', 'checklist', 'task list', 'planner', 'done', 'productivity']
  },
  {
    id: 'ess_shopping',
    categoryId: 'essentials',
    tabId: 'shopping',
    category: 'ESSENTIALS',
    name: 'Shopping & Grocery List',
    description: 'Quick add grocery items, strike through completed goods, and track spend',
    keywords: ['shopping', 'grocery', 'shopping list', 'groceries', 'buy list', 'market', 'items to buy']
  },

  // ── 7. MEASURE & SENSORS (measurement) ──────────────────────────────
  {
    id: 'meas_speed',
    categoryId: 'measurement',
    tabId: 'speedtest',
    category: 'MEASURE & SENSORS',
    name: 'Authentic Internet Bandwidth Benchmark',
    description: 'Real packet ping/jitter, live chunk download Mbps and binary upload speed test',
    keywords: ['speed', 'speedtest', 'internet speed', 'wifi speed', 'ping', 'jitter', 'download mbps', 'upload mbps', 'bandwidth', 'network test']
  },
  {
    id: 'meas_ruler',
    categoryId: 'measurement',
    tabId: 'ruler',
    category: 'MEASURE & SENSORS',
    name: 'Calibrated Screen Ruler & Calipers',
    description: 'On-screen caliper measurement in centimeters (cm), millimeters (mm), and inches',
    keywords: ['ruler', 'scale', 'caliper', 'screen ruler', 'centimeter', 'cm', 'millimeter', 'mm', 'inch', 'measure length', 'distance']
  },
  {
    id: 'meas_protractor',
    categoryId: 'measurement',
    tabId: 'protractor',
    category: 'MEASURE & SENSORS',
    name: 'Interactive 180° Protractor',
    description: 'Measure physical angles with draggable touch arm and quick angle presets',
    keywords: ['protractor', 'angle', 'degrees', 'measure angle', 'geometry', 'compass', 'slope', 'degrees measure', 'triangle']
  },
  {
    id: 'meas_freq',
    categoryId: 'measurement',
    tabId: 'freq',
    category: 'MEASURE & SENSORS',
    name: 'Synthesized Frequency Generator',
    description: 'Audio tone oscillator with creature hearing range spectrum (20Hz - 20kHz)',
    keywords: ['frequency', 'tone generator', 'audio oscillator', 'hz', 'hertz', 'pitch', 'creature hearing', 'sine wave', 'sound test']
  },
  {
    id: 'meas_bpm',
    categoryId: 'measurement',
    tabId: 'bpm',
    category: 'MEASURE & SENSORS',
    name: 'BPM Tempo Tapper',
    description: 'Tap in rhythm with touch or spacebar to calculate precise beats per minute tempo',
    keywords: ['bpm', 'tempo', 'tap tempo', 'bpm tapper', 'beats per minute', 'music tempo', 'rhythm', 'metronome tap']
  },

  // ── 8. TEXT & CRYPTO (textTools) ────────────────────────────────────
  {
    id: 'txt_crypto',
    categoryId: 'textTools',
    tabId: 'crypto',
    category: 'TEXT & CRYPTO',
    name: 'AES-256 Text Encryption',
    description: 'Cryptographic encryption and decryption with custom secret passphrase key',
    keywords: ['aes', 'encryption', 'decryption', 'encrypt', 'decrypt', 'cipher', 'secret', 'password protect', 'crypto text']
  },
  {
    id: 'txt_entropy',
    categoryId: 'textTools',
    tabId: 'entropy',
    category: 'TEXT & CRYPTO',
    name: 'Password Entropy & Security Audit',
    description: 'Calculate Shannon entropy bits and brute-force crack time estimates',
    keywords: ['entropy', 'password strength', 'security audit', 'crack time', 'bits of entropy', 'password test']
  },
  {
    id: 'txt_case',
    categoryId: 'textTools',
    tabId: 'case',
    category: 'TEXT & CRYPTO',
    name: 'Text Case Converter',
    description: 'UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case converter',
    keywords: ['case', 'uppercase', 'lowercase', 'titlecase', 'camelcase', 'snakecase', 'kebabcase', 'text transform', 'capitalization']
  },
  {
    id: 'txt_uuid',
    categoryId: 'textTools',
    tabId: 'uuid',
    category: 'TEXT & CRYPTO',
    name: 'UUID v4 & NanoID Generator',
    description: 'Generate cryptographically unique identifiers (UUIDs) and compact NanoIDs',
    keywords: ['uuid', 'nanoid', 'guid', 'unique id', 'id generator', 'random id', 'v4']
  },
  {
    id: 'txt_rot13',
    categoryId: 'textTools',
    tabId: 'rot13',
    category: 'TEXT & CRYPTO',
    name: 'Caesar Cipher & ROT13',
    description: 'Encode and decode classic substitution ciphers with custom alphabet shift keys',
    keywords: ['rot13', 'caesar cipher', 'cipher', 'substitution', 'secret code', 'letter shift']
  },
  {
    id: 'txt_urlcodec',
    categoryId: 'textTools',
    tabId: 'urlcodec',
    category: 'TEXT & CRYPTO',
    name: 'URL Encoder & Decoder',
    description: 'Safely encode and decode URI components and query strings with percent-encoding',
    keywords: ['url encode', 'url decode', 'uri component', 'percent encoding', 'url safe', 'query string']
  },
  {
    id: 'txt_htmlentities',
    categoryId: 'textTools',
    tabId: 'htmlentities',
    category: 'TEXT & CRYPTO',
    name: 'HTML Entities Converter',
    description: 'Escape and unescape HTML special characters to prevent XSS and formatting issues',
    keywords: ['html entities', 'escape html', 'unescape html', 'special characters', 'html encode', 'ampersand']
  },
  {
    id: 'txt_lorem',
    categoryId: 'textTools',
    tabId: 'lorem',
    category: 'TEXT & CRYPTO',
    name: 'Cyberpunk & Classic Lorem Ipsum',
    description: 'Generate custom paragraphs and words of placeholder text for UI mockups',
    keywords: ['lorem', 'lorem ipsum', 'placeholder text', 'dummy text', 'generator', 'paragraphs', 'sample text']
  },
  {
    id: 'txt_markdown',
    categoryId: 'textTools',
    tabId: 'markdown',
    category: 'TEXT & CRYPTO',
    name: 'Markdown Live Previewer',
    description: 'Split-screen live Markdown editor with instant HTML formatting and code blocks',
    keywords: ['markdown', 'md', 'markdown preview', 'live editor', 'html preview', 'readme editor', 'notes']
  },
  {
    id: 'txt_counter',
    categoryId: 'textTools',
    tabId: 'counter',
    category: 'TEXT & CRYPTO',
    name: 'Word & Character Text Statistics',
    description: 'Detailed analysis of words, characters, sentences, reading time, and speech duration',
    keywords: ['word count', 'character count', 'reading time', 'text statistics', 'char count', 'sentences', 'length']
  },
  {
    id: 'txt_base64',
    categoryId: 'textTools',
    tabId: 'base64file',
    category: 'TEXT & CRYPTO',
    name: 'File & Image to Base64',
    description: 'Encode any file or image into clean Base64 data URI string with instant copy',
    keywords: ['base64', 'file to base64', 'image to base64', 'data uri', 'encode base64', 'decode base64']
  },
  {
    id: 'txt_diff',
    categoryId: 'textTools',
    tabId: 'diff',
    category: 'TEXT & CRYPTO',
    name: 'Text Diff Comparator',
    description: 'Compare two text snippets side-by-side with color-coded additions and removals',
    keywords: ['diff', 'text diff', 'compare text', 'text comparator', 'differences', 'code diff', 'changes']
  },
  {
    id: 'txt_morse',
    categoryId: 'textTools',
    tabId: 'morse',
    category: 'TEXT & CRYPTO',
    name: 'Morse Code & Audio Chirps',
    description: 'Translate text to Morse code with playable synthesized dots and dashes beeps',
    keywords: ['morse', 'morse code', 'telegraph', 'dots and dashes', 'audio morse', 'beeps', 'sos']
  },
  {
    id: 'txt_binary',
    categoryId: 'textTools',
    tabId: 'binary',
    category: 'TEXT & CRYPTO',
    name: 'Binary, Hex & Decimal Converter',
    description: 'Translate text into binary bytes, hexadecimal numbers, and ASCII codes',
    keywords: ['binary', 'hex', 'decimal', 'ascii', 'bytes', 'number base', '0101', 'hexadecimal']
  },
  {
    id: 'txt_tts',
    categoryId: 'textTools',
    tabId: 'tts',
    category: 'TEXT & CRYPTO',
    name: 'Speech Synthesis Text to Speech',
    description: 'Synthesize written text into realistic spoken audio using browser speech engine',
    keywords: ['tts', 'text to speech', 'speech synthesis', 'speak text', 'voice', 'read aloud', 'audio speech']
  },

  // ── 9. AUDIO & CANVAS (media) ───────────────────────────────────────
  {
    id: 'med_synth',
    categoryId: 'media',
    tabId: 'synth',
    category: 'AUDIO & CANVAS',
    name: '8-Bit Retro Synthesizer',
    description: 'Chiptune keyboard with multiple waveforms, octave controls, and retro keys',
    keywords: ['synth', 'synthesizer', 'chiptune', '8bit', 'keyboard', 'piano', 'waveforms', 'square wave', 'sound generator']
  },
  {
    id: 'med_palette',
    categoryId: 'media',
    tabId: 'palette',
    category: 'AUDIO & CANVAS',
    name: 'Color Palette & Eyedropper',
    description: 'Harmonious color schemes with hex copy and screen color picker',
    keywords: ['palette', 'color palette', 'colors', 'eyedropper', 'hex colors', 'color picker', 'design palette']
  },
  {
    id: 'med_videograb',
    categoryId: 'media',
    tabId: 'videograb',
    category: 'AUDIO & CANVAS',
    name: 'Video Frame Grabber',
    description: 'Extract crystal-clear frames from MP4/WebM video files at exact timestamp',
    keywords: ['video frame', 'video screenshot', 'extract frame', 'grab frame', 'video capture', 'freeze frame']
  },
  {
    id: 'med_metronome',
    categoryId: 'media',
    tabId: 'metronome',
    category: 'AUDIO & CANVAS',
    name: 'Precision BPM Metronome',
    description: 'Visual and acoustic metronome with adjustable tempos and time signatures',
    keywords: ['metronome', 'bpm', 'tempo', 'timekeeper', 'tick', 'click track', 'music timing', 'rhythm']
  },
  {
    id: 'med_draw',
    categoryId: 'media',
    tabId: 'drawing',
    category: 'AUDIO & CANVAS',
    name: 'Cyber Pixel Canvas',
    description: 'Touch-friendly drawing board with exportable PNG artwork and color brush tools',
    keywords: ['drawing', 'paint', 'canvas', 'pixel canvas', 'sketch', 'doodle', 'draw', 'export art']
  },

  // ── 10. DEVICE & SYS (deviceInfo) ───────────────────────────────────
  {
    id: 'dev_specs',
    categoryId: 'deviceInfo',
    tabId: 'specs',
    category: 'DEVICE & SYS',
    name: 'Hardware & System Specifications',
    description: 'Inspect CPU cores, RAM memory, battery level, network connection, and display',
    keywords: ['specs', 'hardware', 'system info', 'cpu', 'ram', 'battery', 'device info', 'browser specs', 'screen resolution']
  },
  {
    id: 'dev_fps',
    categoryId: 'deviceInfo',
    tabId: 'fps',
    category: 'DEVICE & SYS',
    name: 'Screen Refresh Rate (FPS) Monitor',
    description: 'Real-time display refresh rate benchmark, frame jitter, and Hz measurement',
    keywords: ['fps', 'refresh rate', 'hz', '60hz', '120hz', '144hz', 'frame rate', 'frame jitter', 'monitor test']
  },
  {
    id: 'dev_audio',
    categoryId: 'deviceInfo',
    tabId: 'audiochannel',
    category: 'DEVICE & SYS',
    name: 'Stereo Audio Channel Diagnostics',
    description: 'Left/Right speaker isolation, balance, and acoustic phase tests',
    keywords: ['audio test', 'speaker test', 'left right', 'stereo', 'audio balance', 'sound check', 'earphone test']
  },
  {
    id: 'dev_kb',
    categoryId: 'deviceInfo',
    tabId: 'keyboard',
    category: 'DEVICE & SYS',
    name: 'Keyboard Rollover & Key Code Matrix',
    description: 'Interactive virtual key codes, modifiers, and anti-ghosting test',
    keywords: ['keyboard test', 'key tester', 'ghosting', 'anti ghosting', 'key codes', 'virtual keyboard', 'typing test']
  },
  {
    id: 'dev_storage',
    categoryId: 'deviceInfo',
    tabId: 'storage',
    category: 'DEVICE & SYS',
    name: 'Storage & Disk Quota Analyzer',
    description: 'Inspect browser disk quota, cache, and indexedDB space allocation',
    keywords: ['storage', 'disk quota', 'indexeddb', 'cache', 'browser storage', 'memory usage', 'disk space']
  },
  {
    id: 'dev_cleaner',
    categoryId: 'deviceInfo',
    tabId: 'cleaner',
    category: 'DEVICE & SYS',
    name: 'Speaker Water & Dust Cleaner',
    description: 'Plays 165Hz acoustic wave pulses to dislodge trapped water droplets from speakers',
    keywords: ['speaker cleaner', 'water eject', 'eject water', 'dust cleaner', 'fix speaker', '165hz', 'sound pulse']
  },
  {
    id: 'dev_pixel',
    categoryId: 'deviceInfo',
    tabId: 'deadpixel',
    category: 'DEVICE & SYS',
    name: 'Dead Pixel Screen Tester',
    description: 'Fullscreen RGBW color cycler to identify stuck monitor pixels',
    keywords: ['dead pixel', 'screen test', 'stuck pixel', 'monitor check', 'fullscreen color', 'pixel check']
  },

  // ── 11. ARCADE GAMES (games) ────────────────────────────────────────
  {
    id: 'game_snake',
    categoryId: 'games',
    tabId: 'snake',
    category: 'ARCADE GAMES',
    name: 'Retro 8-Bit Snake Game',
    description: 'Classic arcade snake game on canvas with score tally and retro sounds',
    keywords: ['snake', 'snake game', 'retro arcade', 'classic snake', 'nokia snake', '8bit game']
  },
  {
    id: 'game_minesweeper',
    categoryId: 'games',
    tabId: 'minesweeper',
    category: 'ARCADE GAMES',
    name: 'Classic Minesweeper',
    description: 'Defuse 10 mines on a 9x9 grid with flags and flood-fill reveals',
    keywords: ['minesweeper', 'bomb', 'flag', 'mines', 'puzzle game', 'classic windows', 'defuse']
  },
  {
    id: 'game_2048',
    categoryId: 'games',
    tabId: 'g2048',
    category: 'ARCADE GAMES',
    name: '2048 Number Tile Puzzle',
    description: 'Slide matching number tiles across 4x4 grid to reach the 2048 tile',
    keywords: ['2048', 'number puzzle', 'tile puzzle', 'merge numbers', 'math puzzle', '1024']
  },
  {
    id: 'game_wordle',
    categoryId: 'games',
    tabId: 'wordle',
    category: 'ARCADE GAMES',
    name: '5-Letter Word Guess Game',
    description: 'Guess the hidden 5-letter word in 6 attempts with color-coded clues',
    keywords: ['wordle', 'word guess', 'word game', 'vocabulary', '5 letters', 'puzzle']
  },
  {
    id: 'game_rps',
    categoryId: 'games',
    tabId: 'rps',
    category: 'ARCADE GAMES',
    name: 'Rock Paper Scissors vs AI',
    description: 'Classic hand game against cybernetic computer opponent with streak tracker',
    keywords: ['rock paper scissors', 'rps', 'roshambo', 'hand game', 'versus ai']
  },
  {
    id: 'game_memory',
    categoryId: 'games',
    tabId: 'memory',
    category: 'ARCADE GAMES',
    name: 'Pixel Memory Card Match',
    description: '16-card flip and match game with moves counter and sound effects',
    keywords: ['memory', 'memory match', 'card match', 'flip cards', 'pairs', 'concentration game']
  },
  {
    id: 'game_ttt',
    categoryId: 'games',
    tabId: 'tictactoe',
    category: 'ARCADE GAMES',
    name: 'Tic Tac Toe Game',
    description: 'Tactile grid board with win detection, score tracking, and AI mode',
    keywords: ['tic tac toe', 'tictactoe', 'noughts and crosses', 'xo', 'x and o', 'grid game']
  },
  {
    id: 'game_cointoss',
    categoryId: 'games',
    tabId: 'cointoss',
    category: 'ARCADE GAMES',
    name: '3D Coin Toss Simulator',
    description: 'Flip golden cyber coin with physics animation for fair 50/50 decisions',
    keywords: ['coin toss', 'flip coin', 'heads or tails', 'toss coin', 'decision maker', 'chance']
  },
  {
    id: 'game_dice',
    categoryId: 'games',
    tabId: 'dice',
    category: 'ARCADE GAMES',
    name: 'Multi-Sided Dice Roller (D6, D20)',
    description: 'Roll D4, D6, D8, D10, D12, and D20 dice with real RNG and sound effects',
    keywords: ['dice', 'dice roller', 'roll dice', 'd6', 'd20', 'tabletop', 'random number', 'dnd dice']
  },

  // ── 12. HEALTH & LIFE (health) ──────────────────────────────────────
  {
    id: 'health_breathe',
    categoryId: 'health',
    tabId: 'breathe',
    category: 'HEALTH & LIFE',
    name: 'Box Breathing Relaxer (4-4-4-4)',
    description: 'Guided expanding visual breath pacer to reduce anxiety and stress',
    keywords: ['box breathing', 'breathing', 'relax', 'calm', 'meditation', 'stress relief', '4-4-4-4', 'anxiety']
  },
  {
    id: 'health_water',
    categoryId: 'health',
    tabId: 'water',
    category: 'HEALTH & LIFE',
    name: 'Daily Hydration Tracker',
    description: 'Log daily glasses of water toward 2.5L goal with visual water gauge',
    keywords: ['water tracker', 'hydration', 'drink water', 'water goal', 'daily water', 'health tracker']
  },
  {
    id: 'health_sleep',
    categoryId: 'health',
    tabId: 'sleep',
    category: 'HEALTH & LIFE',
    name: '90-Minute REM Sleep Cycle Calculator',
    description: 'Calculate optimal bedtimes and wake-up times to wake refreshed between cycles',
    keywords: ['sleep', 'sleep cycle', 'rem sleep', 'wake up time', 'bedtime', 'sleep calculator', 'rest']
  },
  {
    id: 'health_eye',
    categoryId: 'health',
    tabId: 'eye',
    category: 'HEALTH & LIFE',
    name: '20-20-20 Eye Strain Prevention Timer',
    description: 'Protect vision with 20-minute interval reminders to look 20 feet away',
    keywords: ['eye rest', '20-20-20', 'eye strain', 'computer vision', 'screen break', 'eyesight']
  },
  {
    id: 'health_bmi',
    categoryId: 'health',
    tabId: 'bmi',
    category: 'HEALTH & LIFE',
    name: 'BMI Body Composition Gauge',
    description: 'Body Mass Index gauge with metric and imperial units and category metrics',
    keywords: ['bmi', 'body mass', 'weight calculator', 'healthy weight', 'obesity gauge']
  },
  {
    id: 'health_macros',
    categoryId: 'health',
    tabId: 'macros',
    category: 'HEALTH & LIFE',
    name: 'Calorie & Macronutrient Calculator',
    description: 'Calculate daily Basal Metabolic Rate (BMR) and recommended protein/carbs/fats',
    keywords: ['calorie calculator', 'macros', 'protein', 'bmr', 'tdee', 'diet', 'nutrition', 'calories']
  },
  {
    id: 'health_soundscape',
    categoryId: 'health',
    tabId: 'soundscape',
    category: 'HEALTH & LIFE',
    name: 'Ambient Meditation Audio',
    description: 'Relaxing synthesized rainfall and ambient brown noise soundscape',
    keywords: ['meditation audio', 'white noise', 'brown noise', 'rain sounds', 'relaxing audio', 'ambient']
  },
  {
    id: 'health_heartrate',
    categoryId: 'health',
    tabId: 'heartrate',
    category: 'HEALTH & LIFE',
    name: 'Target Heart Rate & Cardio Zones',
    description: 'Calculate fat burn, aerobic, and peak anaerobic training target heart rates',
    keywords: ['heart rate', 'cardio zones', 'fat burn', 'pulse', 'bpm zones', 'exercise heart rate']
  },

  // ── 13. SOCIAL & WEB (social) ───────────────────────────────────────
  {
    id: 'soc_ogpreview',
    categoryId: 'social',
    tabId: 'ogpreview',
    category: 'SOCIAL & WEB',
    name: 'Open Graph Social Card Previewer',
    description: 'Preview how website links look when shared on Twitter, Facebook, and LinkedIn',
    keywords: ['open graph', 'og preview', 'social card', 'meta tags', 'twitter card', 'share preview']
  },
  {
    id: 'soc_utm',
    categoryId: 'social',
    tabId: 'utm',
    category: 'SOCIAL & WEB',
    name: 'Campaign UTM Parameter Builder',
    description: 'Build Google Analytics tracking links with campaign source, medium, and name',
    keywords: ['utm builder', 'tracking url', 'utm parameters', 'google analytics', 'campaign link', 'marketing']
  },
  {
    id: 'soc_counter',
    categoryId: 'social',
    tabId: 'counter',
    category: 'SOCIAL & WEB',
    name: 'Social Character Limit Auditor',
    description: 'Check post lengths against Twitter (280), Instagram, LinkedIn, and Threads limits',
    keywords: ['character limit', 'twitter limit', 'instagram bio', 'post length', 'threads limit', 'social counter']
  },
  {
    id: 'soc_biolink',
    categoryId: 'social',
    tabId: 'biolink',
    category: 'SOCIAL & WEB',
    name: 'Cyber Bio-Link Page Builder',
    description: 'Design custom link-in-bio hub pages with social buttons and custom themes',
    keywords: ['bio link', 'link in bio', 'linktree', 'profile link', 'social links', 'landing page']
  },
  {
    id: 'soc_hashtags',
    categoryId: 'social',
    tabId: 'hashtags',
    category: 'SOCIAL & WEB',
    name: 'Trending Hashtag Matrix',
    description: 'Browse high-engagement tags for tech, coding, design, business, and fitness',
    keywords: ['hashtags', 'instagram tags', 'viral tags', 'tag generator', 'social tags', 'trending']
  },
  {
    id: 'soc_sizes',
    categoryId: 'social',
    tabId: 'sizes',
    category: 'SOCIAL & WEB',
    name: 'Social Media Image Dimensions Guide',
    description: 'Quick reference for profile photo, banner, and feed post pixel dimensions',
    keywords: ['image sizes', 'banner sizes', 'avatar dimension', 'instagram size', 'youtube banner', 'aspect ratios']
  },
  {
    id: 'soc_wifi',
    categoryId: 'social',
    tabId: 'wifi',
    category: 'SOCIAL & WEB',
    name: 'Instant Wi-Fi Access QR Code',
    description: 'Generate scannable QR codes for seamless guest Wi-Fi join without typing passwords',
    keywords: ['wifi qr', 'wifi password', 'connect wifi', 'guest wifi', 'wifi code', 'network qr']
  },
  {
    id: 'soc_captions',
    categoryId: 'social',
    tabId: 'captions',
    category: 'SOCIAL & WEB',
    name: 'Caption Crafter & Hook Templates',
    description: 'High-converting social caption hooks and story prompts for creators',
    keywords: ['captions', 'caption crafter', 'instagram caption', 'hooks', 'post ideas', 'copywriting']
  },

  // ── 14. DEV & NETWORK (developer) ───────────────────────────────────
  {
    id: 'dev_code',
    categoryId: 'developer',
    tabId: 'code',
    category: 'DEV & NETWORK',
    name: 'In-Browser JavaScript Sandbox',
    description: 'Safe JavaScript REPL code runner with console output capture and error reporting',
    keywords: ['javascript sandbox', 'js runner', 'repl', 'run code', 'js playground', 'code editor', 'developer']
  },
  {
    id: 'dev_regex',
    categoryId: 'developer',
    tabId: 'regex',
    category: 'DEV & NETWORK',
    name: 'Regex Visual Tester',
    description: 'Test regular expressions with flags, match groups, and common syntax presets',
    keywords: ['regex', 'regular expression', 'regex tester', 'pattern matching', 'regexp', 'regex test']
  },
  {
    id: 'dev_cssgen',
    categoryId: 'developer',
    tabId: 'cssgen',
    category: 'DEV & NETWORK',
    name: 'CSS Box Shadow Generator',
    description: 'Visual multi-layer box-shadow generator with live preview and code export',
    keywords: ['css box shadow', 'box shadow', 'shadow generator', 'css generator', 'drop shadow', 'styling']
  },
  {
    id: 'dev_color',
    categoryId: 'developer',
    tabId: 'color',
    category: 'DEV & NETWORK',
    name: 'Color & WCAG Contrast Checker',
    description: 'HEX, RGB, HSL converter with WCAG 2.1 AA/AAA accessibility contrast ratios',
    keywords: ['color contrast', 'wcag', 'accessibility', 'contrast ratio', 'hex to rgb', 'hsl', 'color checker']
  },
  {
    id: 'dev_curl',
    categoryId: 'developer',
    tabId: 'curl',
    category: 'DEV & NETWORK',
    name: 'Curl & HTTP Request Builder',
    description: 'Generate Curl, Fetch, and Python requests snippets with headers and payloads',
    keywords: ['curl', 'fetch', 'http request', 'api builder', 'rest api', 'python requests', 'post get']
  },
  {
    id: 'dev_json',
    categoryId: 'developer',
    tabId: 'json',
    category: 'DEV & NETWORK',
    name: 'JSON Formatter & Validator',
    description: 'Beautify, validate, format, and minify messy JSON data strings',
    keywords: ['json formatter', 'beautify json', 'validate json', 'minify json', 'json viewer', 'json parser']
  },
  {
    id: 'dev_hash',
    categoryId: 'developer',
    tabId: 'hash',
    category: 'DEV & NETWORK',
    name: 'SHA-256 & MD5 Cryptographic Hasher',
    description: 'Generate SHA-1, SHA-256, SHA-512, and MD5 cryptographic hashes from text',
    keywords: ['hash', 'sha256', 'md5', 'sha512', 'checksum', 'crypto hash', 'digest']
  },
  {
    id: 'dev_jwt',
    categoryId: 'developer',
    tabId: 'jwt',
    category: 'DEV & NETWORK',
    name: 'JWT Token Decoder & Inspector',
    description: 'Decode and inspect JSON Web Token headers, claims payload, and expiry dates',
    keywords: ['jwt', 'jwt decoder', 'json web token', 'token inspector', 'jwt claims', 'bearer token']
  },
  {
    id: 'dev_dns',
    categoryId: 'developer',
    tabId: 'dns',
    category: 'DEV & NETWORK',
    name: 'Live DNS Lookup',
    description: 'Query A, MX, and TXT DNS records for any domain name via Google DNS API',
    keywords: ['dns', 'dns lookup', 'mx records', 'txt records', 'domain lookup', 'nameserver', 'ip address']
  },

  // ── 15. HUMAN BENCHMARK (humanBenchmark) ────────────────────────────
  {
    id: 'bench_reaction',
    categoryId: 'humanBenchmark',
    tabId: 'reaction',
    category: 'BENCHMARK',
    name: 'Reaction Time Test',
    description: 'Millisecond reaction speed test with average score tracking and percentile',
    keywords: ['reaction time', 'reflexes', 'click speed', 'reaction speed', 'human benchmark', 'ms reaction']
  },
  {
    id: 'bench_aim',
    categoryId: 'humanBenchmark',
    tabId: 'aim',
    category: 'BENCHMARK',
    name: 'Aim & Reflex Target Trainer',
    description: 'Click 30 targets rapidly to measure hand-eye coordination and accuracy',
    keywords: ['aim trainer', 'mouse accuracy', 'reflex trainer', 'target practice', 'click accuracy', 'fps aim']
  },
  {
    id: 'bench_number',
    categoryId: 'humanBenchmark',
    tabId: 'number',
    category: 'BENCHMARK',
    name: 'Number Working Memory Test',
    description: 'Remember increasingly long sequences of digits under strict timed recall',
    keywords: ['number memory', 'digit span', 'memory test', 'sequence recall', 'working memory']
  },
  {
    id: 'bench_verbal',
    categoryId: 'humanBenchmark',
    tabId: 'verbal',
    category: 'BENCHMARK',
    name: 'Verbal Working Memory Test',
    description: 'Identify whether displayed words are new or seen previously to test vocabulary memory',
    keywords: ['verbal memory', 'word memory', 'remember words', 'verbal recall', 'vocabulary test']
  },
  {
    id: 'bench_chimp',
    categoryId: 'humanBenchmark',
    tabId: 'chimp',
    category: 'BENCHMARK',
    name: 'Chimp Working Memory Grid Test',
    description: 'Memorize numbered grid positions before they vanish and tap in order',
    keywords: ['chimp test', 'chimpanzee memory', 'ayumu test', 'grid memory', 'spatial memory']
  },
  {
    id: 'bench_typing',
    categoryId: 'humanBenchmark',
    tabId: 'typing',
    category: 'BENCHMARK',
    name: '60-Second Typing Speed Test',
    description: 'Calculate live words per minute (WPM) and accuracy with real-time feedback',
    keywords: ['typing test', 'wpm', 'words per minute', 'typing speed', 'keyboard speed', 'typing accuracy']
  }
];

// Quick category filter definitions for search modal
export const SEARCH_CATEGORY_FILTERS = [
  { id: 'all', label: 'ALL TOOLS' },
  { id: 'measurement', label: 'MEASURE', color: 'text-rose-400' },
  { id: 'calculators', label: 'CALCULATORS', color: 'text-yellow-400' },
  { id: 'imageToolbox', label: 'IMAGE', color: 'text-pink-400' },
  { id: 'pdfSuite', label: 'PDF', color: 'text-purple-400' },
  { id: 'dateTime', label: 'TIME', color: 'text-teal-400' },
  { id: 'finance', label: 'FINANCE', color: 'text-emerald-400' },
  { id: 'essentials', label: 'ESSENTIALS', color: 'text-orange-400' },
  { id: 'textTools', label: 'TEXT & CRYPTO', color: 'text-violet-400' },
  { id: 'media', label: 'AUDIO & MEDIA', color: 'text-fuchsia-400' },
  { id: 'deviceInfo', label: 'DEVICE', color: 'text-sky-400' },
  { id: 'games', label: 'ARCADE', color: 'text-amber-300' },
  { id: 'health', label: 'HEALTH', color: 'text-rose-400' },
  { id: 'social', label: 'SOCIAL', color: 'text-indigo-400' },
  { id: 'developer', label: 'DEV & NETWORK', color: 'text-lime-400' },
  { id: 'humanBenchmark', label: 'BENCHMARK', color: 'text-orange-400' },
];
