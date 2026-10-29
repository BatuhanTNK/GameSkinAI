/**
 * @fileoverview Oyun tema tanımları ve AI prompt şablonları.
 * Her tema iki bileşen içerir:
 * - `prompt`: Gemini 2.5 Flash (ücretsiz vizyon modeli) ile fotoğrafı analiz edip kişinin
 *   cinsiyet/yaş görünümü, cilt tonu, saç stili/rengi, sakal/bıyık, göz/kaş, aksesuar ve
 *   kıyafet renklerini oyun evrenine uyarlayarak çıkaran prompt.
 * - `imageStyle`: Görsel üretim modeline (Gemini Image veya ücretsiz Pollinations/Sana)
 *   gönderilen net sanat stili tanımı. Tam görsel promptu `buildImagePrompt` ile üretilir.
 */

/**
 * Fotoğraftaki kişinin tüm ayırt edici görsel özelliklerini eksiksiz çıkaran analiz promptu.
 * Görsel üretim modeli (özellikle ücretsiz metinden-görsele model) bu çıktıyı doğrudan
 * kullandığı için cinsiyet, cilt tonu, saç, sakal, aksesuar ve kıyafet net belirtilmelidir.
 * @param {string} gameName - Oyun/tema adı
 * @returns {string}
 */
function describePrompt(gameName) {
  return `Look carefully at the person in this photo. In 2-3 sentences (max 65 words), describe how this exact person looks as a ${gameName} character.
You MUST explicitly state:
1) gender presentation, approximate age, and exact skin tone (for example: "A young Black man with dark brown skin", "A young fair-skinned woman", "A middle-aged olive-skinned man"),
2) exact hairstyle, hair length, texture, and hair color,
3) eye color, eyebrows, facial hair (or clean-shaven), and any visible accessories (glasses, earrings, nose ring, headwear, headphones),
4) their exact visible clothing items, colors, and patterns adapted into ${gameName} outfit style.
Rules: plain text only. No markdown, no headings, no bullet points, no character names or titles, no abilities, no stats, no backstory.`;
}

/** Minecraft analiz cevabı için Gemini responseSchema (JSON kesilmesini/bozulmasını önler). */
const MINECRAFT_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    description: { type: 'STRING' },
    skinColor: { type: 'STRING' },
    hairColor: { type: 'STRING' },
    hairStyle: { type: 'STRING', enum: ['short', 'medium', 'long'] },
    eyeColor: { type: 'STRING' },
    shirtColor: { type: 'STRING' },
    shirtColor2: { type: 'STRING' },
    shirtStyle: { type: 'STRING', enum: ['hoodie', 'jacket', 'tshirt', 'striped', 'suit'] },
    sleeveLength: { type: 'STRING', enum: ['short', 'long'] },
    pantsColor: { type: 'STRING' },
    pantsLength: { type: 'STRING', enum: ['short', 'long'] },
    shoesColor: { type: 'STRING' },
    hasBeard: { type: 'BOOLEAN' },
    beardColor: { type: 'STRING' },
    hasGlasses: { type: 'BOOLEAN' },
    glassesColor: { type: 'STRING' },
    hatStyle: { type: 'STRING', enum: ['none', 'cap', 'hat', 'headband'] },
    hatColor: { type: 'STRING' },
    accessory: { type: 'STRING', enum: ['headband', 'glasses', 'hat', 'none'] },
    accessoryColor: { type: 'STRING' },
  },
  required: [
    'description', 'skinColor', 'hairColor', 'hairStyle', 'eyeColor', 'shirtColor', 'shirtColor2', 'shirtStyle',
    'sleeveLength', 'pantsColor', 'pantsLength', 'shoesColor', 'hasBeard', 'beardColor',
    'hasGlasses', 'glassesColor', 'hatStyle', 'hatColor', 'accessory', 'accessoryColor',
  ],
};

export const THEMES = [
  {
    slug: 'minecraft',
    label: 'Minecraft Skin',
    description: 'Piksel sanat tarzı blok karakter',
    description_en: 'Pixel art style block character',
    icon: 'FaCube',
    color: 'green',
    bgGradient: 'from-green-500 to-emerald-600',
    responseSchema: MINECRAFT_RESPONSE_SCHEMA,
    prompt: `Analyze this person's photo very carefully and extract their visual features for a Minecraft skin.

IMPORTANT: You MUST respond with ONLY a raw JSON object matching the requested keys exactly. Do not output any markdown code blocks, backticks, or other text outside of the JSON structure.

Use EXACTLY this flat JSON format:
{
  "description": "2 short plain-text sentences (max 50 words) stating their gender/age appearance, exact skin tone, hairstyle and hair color, eye color, facial hair, accessories, and exact clothing colors/items as a Minecraft character.",
  "skinColor": "#HEX",
  "hairColor": "#HEX",
  "hairStyle": "short or medium or long",
  "eyeColor": "#HEX",
  "shirtColor": "#HEX (dominant color of their hoodie/shirt/jacket)",
  "shirtColor2": "#HEX (secondary accent/logo/inner-shirt color, empty string if solid)",
  "shirtStyle": "hoodie or jacket or tshirt or striped or suit",
  "sleeveLength": "short or long",
  "pantsColor": "#HEX (color of their shorts/pants)",
  "pantsLength": "short or long (use short if they wear shorts, long if long pants)",
  "shoesColor": "#HEX",
  "hasBeard": true or false,
  "beardColor": "#HEX (empty string if no beard)",
  "hasGlasses": true or false,
  "glassesColor": "#HEX (frame color if wearing glasses/sunglasses, empty string if none)",
  "hatStyle": "none or cap or hat or headband",
  "hatColor": "#HEX (color of their cap/hat/beanie/headband, empty string if none)",
  "accessory": "headband or glasses or hat or none",
  "accessoryColor": "#HEX (empty string if none)"
}

Rules:
- skinColor: Match the person's actual skin tone precisely (e.g. #C68642 for medium brown, #FFDFC4 for fair, #8D5524 for dark)
- hairColor: Match the actual hair color you see
- shirtColor: Match the dominant color of their shirt/hoodie/jacket (e.g. #F4F4F6 for white hoodie, #1A1A1A for black, #DD6B20 for orange)
- shirtStyle: Use "hoodie" for hoodies/sweatshirts, "jacket" for open jackets/coats over a shirt, "striped" ONLY if the shirt has full stripes, otherwise "tshirt"
- hasBeard: MUST be true if the person has ANY beard, stubble, goatee, or mustache. False only if completely clean-shaven.
- hasGlasses: MUST be true if the person is wearing eyeglasses or sunglasses.
- hatStyle: Use "cap" or "hat" if the person is wearing a cap, beanie, or hat (even if they also wear glasses!).
- All non-empty color values MUST be valid 6-digit hex starting with #`,
    imageStyle: `Authentic 3D Minecraft cubic voxel character render in official Minecraft key art style, square blocky head and body with 8x8 pixel face texture and sharp 90-degree edges`,
  },
  {
    slug: 'roblox',
    label: 'Roblox Avatar',
    description: 'Yuvarlak kafa, blok vücut tarzı',
    description_en: 'Round head, blocky body style',
    icon: 'FaGamepad',
    color: 'red',
    bgGradient: 'from-red-500 to-rose-600',
    prompt: describePrompt('Roblox avatar'),
    imageStyle: `Roblox 3D avatar character render in Roblox Studio style, classic blocky plastic torso and limbs, cylindrical Roblox head with painted face and 3D Roblox hairpiece`,
  },
  {
    slug: 'among-us',
    label: 'Among Us',
    description: 'Uzay astronot tarzı karakter',
    description_en: 'Space astronaut style character',
    icon: 'FaUserAstronaut',
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-600',
    prompt: describePrompt('Among Us crewmate astronaut'),
    imageStyle: `Official Among Us 2D cartoon crewmate character with thick black outlines, bean-shaped spacesuit in their outfit color, glass visor, and a custom hair/hat accessory on top matching their hairstyle`,
  },
  {
    slug: 'pixel-rpg',
    label: 'Pixel RPG Hero',
    description: 'Klasik JRPG piksel karakter',
    description_en: 'Classic JRPG pixel character',
    icon: 'FaDragon',
    color: 'yellow',
    bgGradient: 'from-yellow-500 to-amber-600',
    prompt: describePrompt('16-bit pixel art JRPG hero'),
    imageStyle: `16-bit SNES JRPG pixel art character sprite in Chrono Trigger and Final Fantasy VI style, crisp visible square pixels, retro fantasy RPG armor matching their outfit colors`,
  },
  {
    slug: 'stardew',
    label: 'Stardew Valley',
    description: 'Çiftlik oyunu tarzı sevimli karakter',
    description_en: 'Cute farming game character',
    icon: 'FaSeedling',
    color: 'teal',
    bgGradient: 'from-teal-500 to-cyan-600',
    prompt: describePrompt('Stardew Valley pixel farmer'),
    imageStyle: `Stardew Valley pixel art farmer character portrait, cute cozy 16-bit pixel art with warm earthy colors and visible pixels`,
  },
  {
    slug: 'fortnite',
    label: 'Fortnite Skin',
    description: 'Fortnite tarzı 3D model savaşçı',
    description_en: 'Fortnite style 3D warrior',
    icon: 'FaCrosshairs',
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    prompt: describePrompt('Fortnite battle royale skin'),
    imageStyle: `Fortnite 3D character skin render in Epic Games Unreal Engine 5 style, stylized heroic proportions, smooth shading, vibrant item-shop lighting`,
  },
  {
    slug: 'gta-sa',
    label: 'GTA San Andreas',
    description: 'CJ tarzı klasik low-poly karakter',
    description_en: 'CJ style classic low-poly character',
    icon: 'FaCar',
    color: 'orange',
    bgGradient: 'from-orange-500 to-amber-600',
    prompt: describePrompt('GTA San Andreas PS2 street character'),
    imageStyle: `GTA San Andreas 2004 PS2 low-polygon 3D character model, retro low-poly faceted geometry and nostalgic Los Santos street style`,
  },
  {
    slug: 'pokemon',
    label: 'Pokémon Trainer',
    description: 'Anime tarzı Pokémon antrenörü',
    description_en: 'Anime style Pokémon trainer',
    icon: 'FaCircle',
    color: 'red',
    bgGradient: 'from-red-500 to-rose-600',
    prompt: describePrompt('Pokémon anime trainer'),
    imageStyle: `Official Pokémon anime trainer illustration in Ken Sugimori and Game Freak 2D cel-shaded anime style, clean bold line art, holding a Poké Ball`,
  },
  {
    slug: 'valorant',
    label: 'Valorant Agent',
    description: 'Valorant stilinde taktiksel ajan',
    description_en: 'Tactical agent in Valorant style',
    icon: 'FaShieldAlt',
    color: 'purple',
    bgGradient: 'from-purple-500 to-indigo-600',
    prompt: describePrompt('Valorant tactical agent'),
    imageStyle: `Valorant agent portrait in Riot Games painterly cel-shaded 3D art style, sharp graphic shapes, hand-painted textures, sleek tactical streetwear`,
  },
  {
    slug: 'brawl-stars',
    label: 'Brawl Stars',
    description: 'Renkli 3D mobil brawler karakter',
    description_en: 'Colorful 3D mobile brawler character',
    icon: 'FaGamepad',
    color: 'purple',
    bgGradient: 'from-purple-600 to-indigo-700',
    prompt: describePrompt('Brawl Stars 3D cartoon brawler'),
    imageStyle: `Brawl Stars 3D brawler character in Supercell chunky cartoon style, stylized big head, glossy vibrant colors, expressive cartoon face`,
  },
  {
    slug: 'clash-royale',
    label: 'Clash Royale',
    description: 'Karikatürize 3D krallık savaşçısı',
    description_en: 'Cartoonish 3D kingdom warrior',
    icon: 'FaCrown',
    color: 'amber',
    bgGradient: 'from-amber-500 to-yellow-600',
    prompt: describePrompt('Clash Royale medieval kingdom warrior'),
    imageStyle: `Clash Royale 3D character render in Supercell cartoon style, expressive cartoon face, polished medieval armor in their outfit colors with gold crown accents`,
  },
  {
    slug: 'lol',
    label: 'LoL Champion',
    description: 'Epik MOBA şampiyonu ve büyü zırhı',
    description_en: 'Epic MOBA champion and magic armor',
    icon: 'FaDragon',
    color: 'blue',
    bgGradient: 'from-blue-600 to-cyan-700',
    prompt: describePrompt('League of Legends fantasy champion'),
    imageStyle: `League of Legends champion splash art in Riot Games high-fantasy digital painting style, dramatic rim lighting, ornate fantasy armor matching their outfit colors`,
  },
  {
    slug: 'apex',
    label: 'Apex Legend',
    description: 'Futuristik battle royale pilotu',
    description_en: 'Futuristic battle royale pilot',
    icon: 'FaCrosshairs',
    color: 'red',
    bgGradient: 'from-red-600 to-orange-700',
    prompt: describePrompt('Apex Legends sci-fi hero'),
    imageStyle: `Apex Legends character portrait in Respawn gritty sci-fi 3D style, futuristic tactical armor plates and jump-kit harness in their outfit colors, face clearly visible`,
  },
  {
    slug: 'lego',
    label: 'LEGO Minifigure',
    description: 'Plastik blok ikonik minifigür stili',
    description_en: 'Iconic plastic block minifigure style',
    icon: 'FaCube',
    color: 'yellow',
    bgGradient: 'from-yellow-400 to-amber-500',
    prompt: describePrompt('LEGO minifigure toy'),
    imageStyle: `Official LEGO minifigure 3D studio product render, glossy ABS plastic, cylindrical LEGO head with top stud, painted LEGO face, moulded plastic hairpiece, printed blocky torso`,
  },
  {
    slug: 'fall-guys',
    label: 'Fall Guys',
    description: 'Renkli peluş fasulye kostümü',
    description_en: 'Colorful plush bean costume',
    icon: 'FaSmile',
    color: 'pink',
    bgGradient: 'from-pink-500 to-rose-600',
    prompt: describePrompt('Fall Guys bean costume character'),
    imageStyle: `Fall Guys 3D bean character in a cute glossy plush costume matching their hair, accessories, and outfit colors, round jellybean body with faceplate`,
  },
  {
    slug: 'genshin',
    label: 'Genshin Impact',
    description: 'Anime 3D cel-shaded kahraman',
    description_en: 'Anime 3D cel-shaded hero',
    icon: 'FaGem',
    color: 'teal',
    bgGradient: 'from-teal-400 to-emerald-600',
    prompt: describePrompt('Genshin Impact anime hero'),
    imageStyle: `Genshin Impact 5-star playable character in HoYoverse 3D cel-shaded anime style, expressive anime eyes, ornate layered fantasy outfit in their real clothing colors with gold trim`,
  },
  {
    slug: 'cyberpunk',
    label: 'Cyberpunk 2077',
    description: 'Neon siber protez ve deri ceket',
    description_en: 'Neon cyberware and leather jacket',
    icon: 'FaBolt',
    color: 'yellow',
    bgGradient: 'from-yellow-400 to-cyan-500',
    prompt: describePrompt('Cyberpunk 2077 Night City mercenary'),
    imageStyle: `Cyberpunk 2077 character portrait in CD Projekt Red realistic sci-fi 3D style, subtle facial cyberware lines, glowing LED collar techwear jacket in their outfit colors, neon rim lighting`,
  },
  {
    slug: 'witcher',
    label: 'The Witcher',
    description: 'Orta Çağ canavar avcısı şövalye',
    description_en: 'Medieval monster hunter knight',
    icon: 'FaShieldAlt',
    color: 'slate',
    bgGradient: 'from-gray-700 to-slate-900',
    prompt: describePrompt('The Witcher medieval monster hunter'),
    imageStyle: `The Witcher 3 character portrait in CD Projekt Red dark medieval fantasy 3D style, studded leather armor in their outfit colors, silver and steel swords on back, wolf medallion`,
  },
  {
    slug: 'cs2',
    label: 'Counter-Strike 2',
    description: 'Taktiksel askeri tim operatörü',
    description_en: 'Tactical military squad operator',
    icon: 'FaUserSecret',
    color: 'emerald',
    bgGradient: 'from-emerald-700 to-green-900',
    prompt: describePrompt('Counter-Strike 2 tactical operator'),
    imageStyle: `Counter-Strike 2 agent portrait in photorealistic Source 2 3D style, tactical Kevlar vest, radio and gear in their outfit colors, face clearly visible without full mask`,
  },
];

/**
 * Görsel üretim modeline gönderilecek tam promptu oluşturur.
 * Hem fotoğraf referanslı modeller (Gemini Image) hem de ücretsiz metinden-görsele
 * modeller (Pollinations/Sana) ile yüksek doğrulukta çalışacak şekilde kişinin
 * analiz edilen görsel tanımını (`characterDescription`) ve oyun stilini birleştirir.
 *
 * @param {Object} theme - Tema objesi
 * @param {string} [styleSuffix] - Kullanıcının seçtiği ek stil ayarları (", a, b" biçiminde)
 * @param {string} [characterDescription] - Gemini 2.5 Flash tarafından çıkarılan kişi betimlemesi
 * @returns {string}
 */
export function buildImagePrompt(theme, styleSuffix = '', characterDescription = '') {
  const label = theme?.label || 'video game';
  const style = theme?.imageStyle || `${label} character render in official ${label} game art style`;
  const cleanDesc = (characterDescription || '')
    .replace(/ignore\s+(previous|all)\s+instructions/gi, '')
    .replace(/(system|user|assistant):/gi, '')
    .replace(/[*_`#{}\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const extra = (styleSuffix || '').replace(/^\s*,\s*/, '').trim();

  const parts = [
    `${style}.`,
    cleanDesc ? `Character appearance: ${cleanDesc}` : '',
    extra ? `Style direction: ${extra}.` : '',
    `Centered portrait, single character, high detail, clean studio background, no text, no watermark, no extra people.`,
  ].filter(Boolean);

  return parts.join(' ');
}

/**
 * Slug'a göre tema bulma yardımcı fonksiyonu
 * @param {string} slug - Tema slug değeri
 * @returns {Object|undefined} Tema objesi
 */
export const getThemeBySlug = (slug) => {
  return THEMES.find((theme) => theme.slug === slug);
};
