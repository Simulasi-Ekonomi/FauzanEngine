// =========================================================
// Aries Autonomous Brain - Built-in AI Engine
// Works WITHOUT any external API key
// Provides: Scene Analysis, Bug Detection, Game Design Discussion,
// Monetization Advice, Initiative-based Suggestions
// =========================================================

import type { NeoActor } from '../types/editor';

interface BrainResponse {
  response: string;
  actions: Array<Record<string, unknown>>;
}

// =========================================================
// Scene Analysis Engine
// =========================================================

interface SceneIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

function analyzeScene(actors: Record<string, NeoActor>): SceneIssue[] {
  const issues: SceneIssue[] = [];
  const actorList = Object.values(actors);
  const actorCount = actorList.length;

  // Check for missing essentials
  const hasLight = actorList.some(a => a.type.includes('light'));
  const hasCamera = actorList.some(a => a.type === 'camera');
  const hasPlayerStart = actorList.some(a => a.type === 'player_start');
  const hasFloor = actorList.some(a => a.type === 'plane');

  if (!hasLight) {
    issues.push({
      severity: 'error', category: 'Lighting',
      message: 'Scene tidak punya light source! Game akan gelap total.',
      suggestion: 'Tambahkan DirectionalLight untuk matahari atau PointLight untuk indoor.',
    });
  }

  if (!hasCamera) {
    issues.push({
      severity: 'warning', category: 'Camera',
      message: 'Scene tidak punya camera actor.',
      suggestion: 'Tambahkan CameraActor untuk mengontrol pandangan player.',
    });
  }

  if (!hasPlayerStart) {
    issues.push({
      severity: 'warning', category: 'Gameplay',
      message: 'Scene tidak punya PlayerStart.',
      suggestion: 'Tambahkan PlayerStart untuk spawn point player. Tanpa ini, player tidak tahu mulai dari mana.',
    });
  }

  if (!hasFloor) {
    issues.push({
      severity: 'warning', category: 'Level Design',
      message: 'Scene tidak punya ground plane.',
      suggestion: 'Tambahkan Plane sebagai lantai/tanah supaya objek tidak jatuh ke void.',
    });
  }

  // Check for duplicate PlayerStarts
  const playerStarts = actorList.filter(a => a.type === 'player_start');
  if (playerStarts.length > 1) {
    issues.push({
      severity: 'warning', category: 'Gameplay',
      message: `Ada ${playerStarts.length} PlayerStart! Hanya satu yang akan digunakan.`,
      suggestion: 'Hapus PlayerStart duplikat. Game hanya butuh satu spawn point utama (kecuali multiplayer).',
    });
  }

  // Check for actors at same position (overlapping)
  for (let i = 0; i < actorList.length; i++) {
    for (let j = i + 1; j < actorList.length; j++) {
      const a = actorList[i];
      const b = actorList[j];
      if (a.transform.position.x === b.transform.position.x &&
          a.transform.position.y === b.transform.position.y &&
          a.transform.position.z === b.transform.position.z) {
        issues.push({
          severity: 'warning', category: 'Collision',
          message: `"${a.name}" dan "${b.name}" ada di posisi yang sama (${a.transform.position.x}, ${a.transform.position.y}, ${a.transform.position.z}).`,
          suggestion: 'Pindahkan salah satu actor supaya tidak overlapping.',
        });
      }
    }
  }

  // Performance warnings
  if (actorCount > 100) {
    issues.push({
      severity: 'warning', category: 'Performance',
      message: `Scene punya ${actorCount} actors. Ini bisa berat untuk mobile.`,
      suggestion: 'Pertimbangkan LOD (Level of Detail) dan occlusion culling. Untuk mobile, usahakan < 50 actors.',
    });
  }

  const lightCount = actorList.filter(a => a.type.includes('light')).length;
  if (lightCount > 5) {
    issues.push({
      severity: 'warning', category: 'Performance',
      message: `${lightCount} dynamic lights! Ini sangat berat untuk rendering.`,
      suggestion: 'Kurangi jumlah light atau gunakan baked lighting. Mobile ideal: max 2-3 lights.',
    });
  }

  // Check for zero scale (invisible objects)
  const zeroScale = actorList.filter(a =>
    a.transform.scale.x === 0 || a.transform.scale.y === 0 || a.transform.scale.z === 0
  );
  if (zeroScale.length > 0) {
    issues.push({
      severity: 'error', category: 'Transform',
      message: `${zeroScale.length} actor(s) punya scale 0: ${zeroScale.map(a => a.name).join(', ')}`,
      suggestion: 'Actor dengan scale 0 tidak akan terlihat. Set minimal ke 0.01.',
    });
  }

  // Good scene feedback
  if (issues.length === 0) {
    issues.push({
      severity: 'info', category: 'Quality',
      message: 'Scene looks good! Tidak ada masalah terdeteksi.',
      suggestion: 'Scene siap untuk di-build dan di-test.',
    });
  }

  return issues;
}

// =========================================================
// Game Design Discussion Engine
// =========================================================

interface GameDesignTopic {
  keywords: string[];
  response: string;
}

const GAME_DESIGN_TOPICS: GameDesignTopic[] = [
  {
    keywords: ['monetisasi', 'uang', 'revenue', 'duit', 'pendapatan', 'penghasilan', 'dollar', 'sejuta'],
    response: `[ARIES GAME MONETIZATION ADVISOR]

Strategi monetisasi untuk target $1M revenue:

1. IAP (In-App Purchase) - 70% revenue
   - Consumables: Gem/Gold packs ($0.99 - $99.99)
   - Battle Pass: $9.99/season (renewal setiap 30-60 hari)
   - Starter Pack: $2.99 (one-time, high conversion)
   - VIP Subscription: $7.99/bulan

2. Ads - 20% revenue
   - Rewarded Video: Player pilih nonton = engagement tinggi
   - Interstitial: Di antara level, MAX 1x per 3 menit
   - JANGAN pakai banner ads (revenue rendah, UX jelek)

3. Premium Content - 10% revenue
   - DLC/Expansion packs
   - Cosmetic skins (non-pay-to-win!)

TIPS PENTING:
- Jangan Pay-to-Win! Player akan review 1 star
- Retention > Monetization. Player yang main lama = lebih banyak spend
- A/B test setiap harga. Bahkan $0.99 vs $1.49 bisa beda 30% conversion
- Segmentasi: Whale ($100+/bulan), Dolphin ($10-100), Minnow ($1-10)
- Buka Tools > Monetization Manager untuk atur IAP & ads

Mau diskusi strategi lebih detail? Ketik:
- "strategi whale" - Cara maximize revenue dari big spenders
- "strategi retention" - Cara bikin player balik lagi
- "strategi launch" - Rencana launch yang optimal`
  },
  {
    keywords: ['whale', 'big spender', 'pemain besar'],
    response: `[ARIES WHALE STRATEGY]

Whale = top 1-2% player yang contribute 50%+ revenue.

Cara maximize whale spending:
1. Limited Edition Items - FOMO (Fear of Missing Out)
   - "Hanya 48 jam!" / "Stok terbatas 100!"
   - Exclusive skins yang TIDAK akan balik lagi

2. High-Value Bundles ($49.99 - $99.99)
   - "Ultimate Pack" dengan semua item langka
   - Bonus 2x gems hanya untuk first purchase

3. VIP Tiers
   - Bronze ($10) → Silver ($50) → Gold ($100) → Diamond ($500)
   - Setiap tier dapat perks exclusive

4. Competitive Features
   - Leaderboard rewards
   - Tournament entry fees
   - Guild wars dengan stake

5. Social Features
   - Gift items ke player lain
   - Whale suka flexing ke teman

PENTING: Whale butuh merasa "worth it", bukan dipaksa bayar.`
  },
  {
    keywords: ['retention', 'player balik', 'churn', 'quit', 'berhenti main'],
    response: `[ARIES RETENTION STRATEGY]

Retention adalah kunci revenue. Player yang main D30 = 10x lebih likely to pay.

Day 1 (Target: 40%+ retention):
- Tutorial singkat (< 2 menit)
- Kasih reward besar di awal (dopamine hit)
- JANGAN minta login/register dulu

Day 3-7 (Target: 20%+ retention):
- Daily login rewards (escalating)
- Push notification: "Your crops are ready!"
- Social features: add friends, gift items

Day 14-30 (Target: 10%+ retention):
- Events mingguan (limited time content)
- Guild/clan system
- Progression milestones dengan rewards

Anti-Churn Tactics:
- Detect idle players → send "We miss you!" offer (70% discount)
- Reduce difficulty jika player fail 3x berturut-turut
- "Come back" bonus setelah 3 hari tidak login

Metrics yang harus di-track:
- D1, D7, D30 retention rate
- Session length & frequency
- Churn point (di mana player quit?)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)`
  },
  {
    keywords: ['launch', 'rilis', 'publish', 'release'],
    response: `[ARIES LAUNCH STRATEGY]

Timeline rilis game optimal:

Pre-Launch (2-4 minggu sebelum):
1. Soft launch di 2-3 negara kecil (Filipina, Thailand, Kanada)
2. Collect data: retention, monetization, crash rate
3. Fix bugs & tune balance
4. Build email/social following

Launch Week:
1. Submit ke store 1 minggu sebelum target date
2. Prepare press kit & trailer
3. Contact game reviewers/YouTubers
4. Set up App Store Optimization (ASO):
   - Keywords yang relevan
   - Screenshots yang eye-catching
   - Video preview 30 detik

Post-Launch (minggu 1-4):
1. Monitor reviews & respond ke negative ones
2. Release patch cepat untuk critical bugs
3. First event/content update di week 2
4. Analyze data → adjust monetization

Marketing Budget (minimum):
- $500-2000 untuk User Acquisition (Facebook/Google Ads)
- Target CPI (Cost Per Install): $0.50-2.00
- ROI target: LTV > 3x CPI

Buka Build > Upload to Play Store untuk mulai proses publish!`
  },
  {
    keywords: ['balance', 'seimbang', 'terlalu mudah', 'terlalu susah', 'difficulty'],
    response: `[ARIES GAME BALANCE ADVISOR]

Prinsip balancing game:

1. Dynamic Difficulty Adjustment (DDA):
   - Player gagal 3x → kurangi difficulty 10%
   - Player menang terus → naikkan difficulty 5%
   - JANGAN bilang ke player bahwa difficulty berubah

2. Economy Balance:
   - Earn rate vs Spend rate harus 1:1.5
   - Player harus bisa progress tanpa bayar (tapi lambat)
   - Premium currency: gratis 50-100/hari dari gameplay
   - Cheapest IAP harus = 3-5 hari farming

3. Combat/Gameplay Balance:
   - Semua unit/character harus viable
   - Counter system: A > B > C > A (bukan A > semua)
   - Winrate setiap strategy harus 45-55%

4. Progression Curve:
   - Level 1-10: Tutorial, cepat, rewarding
   - Level 10-30: Core loop, moderate pace
   - Level 30-50: Endgame, slow but meaningful
   - Level 50+: Prestige/New Game+ system

Tips: Pakai spreadsheet untuk model ekonomi game kamu.`
  },
  {
    keywords: ['bug', 'error', 'crash', 'masalah', 'problem', 'rusak', 'broken'],
    response: `[ARIES BUG DETECTIVE]

Saya scan scene kamu untuk masalah...

Cara Aries mendeteksi bug:
1. Scene Analysis - ketik "analisa scene" untuk full scan
2. Runtime Detection - play mode otomatis track:
   - Null references
   - Missing assets
   - Performance spikes
   - Memory leaks
   - Physics glitches

3. Common Game Bugs & Fix:
   - Player jatuh menembus lantai → Check collision layer + floor plane
   - FPS drop → Kurangi draw calls, bake lighting
   - Touch tidak responsif → Check input layer order
   - Memory leak → Pastikan destroy objects saat scene change
   - Black screen → Check camera position & light source

Ketik "analisa scene" untuk scan scene yang sedang aktif sekarang.`
  },
  {
    keywords: ['analisa scene', 'analyze scene', 'scan scene', 'cek scene', 'check scene', 'analisis'],
    response: '__SCENE_ANALYSIS__'  // Special handler
  },
  {
    keywords: ['ide game', 'game idea', 'game apa', 'mau buat game apa', 'saran game', 'rekomendasi game'],
    response: `[ARIES GAME IDEA GENERATOR]

Berdasarkan tren pasar 2024-2025, ini game yang paling menguntungkan:

MOBILE (Revenue tertinggi):
1. Idle/Tycoon Game - Low effort to make, high retention
   - Contoh: "Idle Factory Tycoon", "Cookie Clicker"
   - Dev time: 2-4 minggu
   - Revenue potential: $5k-50k/bulan

2. Merge Game - Sangat populer di casual market
   - Contoh: "Merge Dragons", "Merge Mansion"
   - Dev time: 4-8 minggu
   - Revenue potential: $10k-100k/bulan

3. Puzzle + Story - Highest retention
   - Contoh: "Homescapes", "Gardenscapes"
   - Dev time: 6-12 minggu
   - Revenue potential: $50k-500k/bulan

4. Hyper Casual - Quick to launch, test market
   - Simple mechanic (tap, swipe, timing)
   - Dev time: 1-2 minggu
   - Revenue: $1k-10k/bulan per game, volume play

UNTUK TARGET $1M:
- Buat 1 quality puzzle/merge game ATAU
- Buat 10-20 hyper casual games (portfolio approach)

Mau saya buatkan template untuk salah satu? Ketik:
"buat game idle tycoon" / "buat game merge" / "buat game puzzle"`
  },
  {
    keywords: ['idle', 'tycoon', 'clicker'],
    response: `[ARIES] Membuat template Idle Tycoon Game...

Idle Tycoon membutuhkan:
- Resource generators (otomatis produce)
- Upgrade system (exponential cost)
- Prestige/Reset mechanic (multiplicator)
- Offline earnings

Scene dibuat dengan komponen dasar idle game.`,
  },
  {
    keywords: ['merge', 'gabung'],
    response: `[ARIES] Membuat template Merge Game...

Merge Game membutuhkan:
- Grid board (5x5 atau 7x7)
- Merge chain items (level 1-15)
- Energy system
- Quest/Order system

Scene dibuat dengan grid dan merge items.`,
  },
];

// =========================================================
// Initiative System - Proactive suggestions
// =========================================================

function generateInitiative(actors: Record<string, NeoActor>): string | null {
  const actorList = Object.values(actors);
  const actorCount = actorList.length;

  // No actors = suggest creating something
  if (actorCount <= 4) { // only default actors
    return `💡 Scene masih kosong! Mau mulai buat game? Coba:
- "buat game farmville" - Farming simulation
- "buat game fps" - First person shooter
- "ide game" - Saya kasih rekomendasi game yang profitable
- "buat rumah" - Generate model 3D`;
  }

  // Has game actors but no play test
  const hasGameActors = actorList.some(a =>
    a.name.includes('Farm') || a.name.includes('Cell') || a.name.includes('Arena') ||
    a.name.includes('Platform') || a.name.includes('Village')
  );
  if (hasGameActors) {
    return `💡 Scene sudah ada game objects! Sudah coba "play game" untuk test? Atau ketik "analisa scene" untuk cek bug.`;
  }

  return null;
}

// =========================================================
// Document Import Handler
// =========================================================

export function parseDocumentContent(text: string): string {
  // Clean up extracted text
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function processDocumentForAries(filename: string, content: string): BrainResponse {
  const lines = content.split('\n').filter(l => l.trim());
  const wordCount = content.split(/\s+/).length;

  return {
    response: `[ARIES DOCUMENT READER]

📄 File: ${filename}
📝 ${lines.length} baris, ${wordCount} kata

Saya sudah baca dokumen game design kamu. Ini yang saya temukan:

${extractGameDesignElements(content)}

Dokumen ini sudah tersimpan di Aries memory. Kamu bisa tanya:
- "apa isi dokumen?" - Ringkasan dokumen
- "buat game dari dokumen" - Generate scene dari data dokumen
- "analisa dokumen" - Analisis kelemahan game design`,
    actions: [],
  };
}

function extractGameDesignElements(content: string): string {
  const lower = content.toLowerCase();
  const elements: string[] = [];

  // Detect game type
  const gameTypes = [
    { keywords: ['rpg', 'role playing', 'quest', 'level up'], type: 'RPG' },
    { keywords: ['puzzle', 'match', 'grid', 'sudoku'], type: 'Puzzle' },
    { keywords: ['farm', 'harvest', 'crop', 'animal'], type: 'Farming Sim' },
    { keywords: ['shooter', 'fps', 'weapon', 'gun', 'tembak'], type: 'Shooter' },
    { keywords: ['race', 'racing', 'speed', 'car', 'mobil'], type: 'Racing' },
    { keywords: ['strategy', 'strategi', 'tower', 'defend'], type: 'Strategy' },
    { keywords: ['idle', 'clicker', 'tycoon', 'automate'], type: 'Idle/Tycoon' },
    { keywords: ['platform', 'jump', 'lompat', 'side scroll'], type: 'Platformer' },
  ];

  for (const gt of gameTypes) {
    if (gt.keywords.some(k => lower.includes(k))) {
      elements.push(`🎮 Genre terdeteksi: ${gt.type}`);
    }
  }

  // Detect mechanics
  if (lower.includes('inventory') || lower.includes('item') || lower.includes('barang'))
    elements.push('📦 Sistem inventory/item terdeteksi');
  if (lower.includes('shop') || lower.includes('toko') || lower.includes('beli'))
    elements.push('🛒 Sistem shop terdeteksi');
  if (lower.includes('multiplayer') || lower.includes('pvp') || lower.includes('co-op'))
    elements.push('👥 Multiplayer terdeteksi');
  if (lower.includes('story') || lower.includes('cerita') || lower.includes('narasi'))
    elements.push('📖 Story/Narasi terdeteksi');
  if (lower.includes('skill') || lower.includes('ability') || lower.includes('kemampuan'))
    elements.push('⚔️ Skill system terdeteksi');

  if (elements.length === 0) {
    elements.push('📋 Dokumen berisi data game design umum');
    elements.push('💡 Tip: Tambahkan detail genre, mechanics, dan monetisasi untuk analisis lebih baik');
  }

  return elements.join('\n');
}

// =========================================================
// Stored document memory
// =========================================================

let storedDocuments: Array<{ name: string; content: string }> = [];

export function storeDocument(name: string, content: string) {
  storedDocuments.push({ name, content });
}

export function getStoredDocuments() {
  return storedDocuments;
}

// =========================================================
// Main Brain Processing
// =========================================================

export function processWithAriesBrain(command: string, actors: Record<string, NeoActor>): BrainResponse | null {
  const cmd = command.toLowerCase().trim();

  // Scene analysis command
  if (cmd.includes('analisa scene') || cmd.includes('analyze scene') || cmd.includes('scan scene') ||
      cmd.includes('cek scene') || cmd.includes('check scene') || cmd.includes('analisis scene') ||
      cmd.includes('cari bug') || cmd.includes('find bug') || cmd.includes('detect bug')) {
    const issues = analyzeScene(actors);
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    const severityIcon = (s: string) => s === 'error' ? '🔴' : s === 'warning' ? '🟡' : '🟢';

    const issueText = issues.map(i =>
      `${severityIcon(i.severity)} [${i.category}] ${i.message}\n   → ${i.suggestion}`
    ).join('\n\n');

    return {
      response: `[ARIES SCENE ANALYZER]

Scan selesai untuk ${Object.keys(actors).length} actors:
🔴 ${errorCount} Error | 🟡 ${warningCount} Warning | 🟢 ${infoCount} Info

${issueText}

${errorCount > 0 ? '\n⚠️ Fix semua ERROR sebelum build!' : ''}`,
      actions: [],
    };
  }

  // Document-related commands
  if (cmd.includes('apa isi dokumen') || cmd.includes('ringkas dokumen') || cmd.includes('summary dokumen')) {
    const docs = getStoredDocuments();
    if (docs.length === 0) {
      return {
        response: 'Belum ada dokumen yang di-import. Gunakan File > Import Word (.docx) atau Import PDF (.pdf) untuk upload dokumen game design kamu.',
        actions: [],
      };
    }
    const doc = docs[docs.length - 1];
    const preview = doc.content.substring(0, 500);
    return {
      response: `[ARIES DOCUMENT SUMMARY]\n\n📄 ${doc.name}\n\n${preview}${doc.content.length > 500 ? '\n...(lanjutan)' : ''}\n\n${extractGameDesignElements(doc.content)}`,
      actions: [],
    };
  }

  if (cmd.includes('buat game dari dokumen') || cmd.includes('generate dari dokumen')) {
    const docs = getStoredDocuments();
    if (docs.length === 0) {
      return {
        response: 'Import dokumen dulu via File > Import Word atau Import PDF.',
        actions: [],
      };
    }
    const doc = docs[docs.length - 1];
    const lower = doc.content.toLowerCase();

    // Detect game type from document and create appropriate template
    if (lower.includes('farm') || lower.includes('harvest')) {
      return {
        response: `[ARIES] Dari dokumen "${doc.name}", saya deteksi game farming. Membuat scene farming berdasarkan data dokumen...`,
        actions: [
          { type: 'add_actor', actorType: 'plane', name: 'FarmLand' },
          { type: 'add_actor', actorType: 'cube', name: 'House' },
          { type: 'add_actor', actorType: 'cube', name: 'Barn' },
          { type: 'add_actor', actorType: 'cube', name: 'FarmPlot_1' },
          { type: 'add_actor', actorType: 'cube', name: 'FarmPlot_2' },
          { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
          { type: 'add_actor', actorType: 'player_start', name: 'FarmerSpawn' },
          { type: 'add_actor', actorType: 'camera', name: 'GameCamera' },
        ],
      };
    }
    // Default
    return {
      response: `[ARIES] Membuat scene dari dokumen "${doc.name}"...`,
      actions: [
        { type: 'add_actor', actorType: 'plane', name: 'Ground' },
        { type: 'add_actor', actorType: 'cube', name: 'MainObject' },
        { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
        { type: 'add_actor', actorType: 'player_start', name: 'PlayerSpawn' },
        { type: 'add_actor', actorType: 'camera', name: 'GameCamera' },
      ],
    };
  }

  // Monetization via console
  if (cmd.includes('monetization') || cmd.includes('monetisasi') || cmd.includes('iap') || cmd.includes('in app purchase') ||
      cmd.includes('harga') || cmd.includes('pricing')) {
    return {
      response: `__OPEN_MONETIZATION__`,
      actions: [],
    };
  }

  // Game design discussion topics
  for (const topic of GAME_DESIGN_TOPICS) {
    if (topic.keywords.some(k => cmd.includes(k))) {
      if (topic.response === '__SCENE_ANALYSIS__') {
        // Delegate to scene analysis
        return processWithAriesBrain('analisa scene', actors);
      }

      // For idle/merge game templates, also add actors
      if (topic.keywords.includes('idle') || topic.keywords.includes('tycoon')) {
        return {
          response: topic.response,
          actions: [
            { type: 'add_actor', actorType: 'plane', name: 'Ground' },
            { type: 'add_actor', actorType: 'cube', name: 'Generator_1' },
            { type: 'add_actor', actorType: 'cube', name: 'Generator_2' },
            { type: 'add_actor', actorType: 'cube', name: 'Generator_3' },
            { type: 'add_actor', actorType: 'cube', name: 'UpgradeShop' },
            { type: 'add_actor', actorType: 'sphere', name: 'PrestigePortal' },
            { type: 'add_actor', actorType: 'camera', name: 'TycoonCamera' },
            { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
            { type: 'add_actor', actorType: 'player_start', name: 'PlayerSpawn' },
          ],
        };
      }

      if (topic.keywords.includes('merge')) {
        return {
          response: topic.response,
          actions: [
            { type: 'add_actor', actorType: 'plane', name: 'MergeBoard' },
            { type: 'add_actor', actorType: 'cube', name: 'MergeSlot_1' },
            { type: 'add_actor', actorType: 'cube', name: 'MergeSlot_2' },
            { type: 'add_actor', actorType: 'cube', name: 'MergeSlot_3' },
            { type: 'add_actor', actorType: 'cube', name: 'MergeSlot_4' },
            { type: 'add_actor', actorType: 'cube', name: 'MergeSlot_5' },
            { type: 'add_actor', actorType: 'sphere', name: 'MergeItem_A' },
            { type: 'add_actor', actorType: 'sphere', name: 'MergeItem_B' },
            { type: 'add_actor', actorType: 'camera', name: 'MergeCamera' },
            { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
          ],
        };
      }

      return { response: topic.response, actions: [] };
    }
  }

  // Initiative / proactive suggestion
  if (cmd.includes('saran') || cmd.includes('suggest') || cmd.includes('apa yang harus') || cmd.includes('what should')) {
    const initiative = generateInitiative(actors);
    if (initiative) {
      return { response: initiative, actions: [] };
    }
  }

  // Conversational discussion about game
  if (cmd.includes('diskusi') || cmd.includes('discuss') || cmd.includes('ngobrol') || cmd.includes('chat') ||
      cmd.includes('bagaimana') || cmd.includes('gimana') || cmd.includes('menurut kamu') || cmd.includes('pendapat')) {
    const actorCount = Object.keys(actors).length;
    return {
      response: `[ARIES DISCUSSION MODE]

Saya siap diskusi! Scene kamu saat ini punya ${actorCount} actors.

Topik yang bisa kita diskusikan:
🎮 "ide game" - Rekomendasi game yang profitable
💰 "monetisasi" - Strategi revenue & IAP pricing
🔧 "balance" - Game balancing tips
🚀 "launch" - Strategi rilis & marketing
🐛 "analisa scene" - Cari bug & masalah
📊 "retention" - Cara bikin player balik lagi
🐋 "strategi whale" - Maximize big spender revenue

Atau tanya apa saja tentang game development! Saya jawab berdasarkan pengetahuan saya tentang:
- Game design principles
- Monetization best practices
- Mobile game market trends
- Player psychology
- Technical game architecture`,
      actions: [],
    };
  }

  // Return null = not handled by brain, fall through to existing pattern matching
  return null;
}
