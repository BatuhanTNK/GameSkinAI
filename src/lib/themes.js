/**
 * @fileoverview Oyun tema tanımları ve AI prompt şablonları.
 * Her tema, kullanıcının fotoğrafını farklı bir oyun tarzına dönüştürmek için
 * Gemini API'ye gönderilecek özel prompt içerir.
 */

export const THEMES = [
  {
    slug: 'minecraft',
    label: 'Minecraft Skin',
    description: 'Piksel sanat tarzı blok karakter',
    icon: 'FaCube',
    color: 'green',
    bgGradient: 'from-green-500 to-emerald-600',
    prompt: `Analyze this person's photo very carefully and extract their visual features for a Minecraft skin.

IMPORTANT: You MUST respond with ONLY a raw JSON object matching the requested keys exactly. Do not output any markdown code blocks, backticks, or other text outside of the JSON structure.

Use EXACTLY this flat JSON format:
{
  "description": "A brief user-friendly character description of the Minecraft character skin that resembles this person, max 80 words.",
  "skinColor": "#HEX",
  "hairColor": "#HEX",
  "hairStyle": "short or medium or long",
  "eyeColor": "#HEX",
  "shirtColor": "#HEX (dominant color of their shirt/jersey)",
  "shirtColor2": "#HEX (secondary color of their shirt stripes, empty string if solid)",
  "sleeveLength": "short or long",
  "pantsColor": "#HEX (color of their shorts/pants)",
  "pantsLength": "short or long (use short if they wear shorts, long if long pants)",
  "shoesColor": "#HEX",
  "hasBeard": true or false,
  "beardColor": "#HEX (empty string if no beard)",
  "accessory": "headband or glasses or hat or none",
  "accessoryColor": "#HEX (empty string if none)"
}

Rules:
- skinColor: Match the person's actual skin tone precisely (e.g. #C68642 for medium brown, #FFDFC4 for fair, #8D5524 for dark)
- hairColor: Match the actual hair color you see
- shirtColor: Match the dominant color of their shirt/clothing (e.g. #dd6b20 for orange)
- shirtColor2: If their shirt has stripes, you MUST identify the stripe color (e.g. #ffffff for white stripes).
- pantsColor: Match the dominant color of their pants/shorts (e.g. #111e38 for dark blue shorts)
- All color values MUST be valid 6-digit hex starting with #`
  },
  {
    slug: 'roblox',
    label: 'Roblox Avatar',
    description: 'Yuvarlak kafa, blok vücut tarzı',
    icon: 'FaGamepad',
    color: 'red',
    bgGradient: 'from-red-500 to-rose-600',
    prompt: `You are a Roblox avatar designer. Analyze this person's photo.
    Create a Roblox-style avatar description matching this person:
    - Characteristic round head, blocky proportions
    - Cartoonish, colorful style
    - Match hair color, eye color, and outfit to the person
    - Describe face accessories, clothing items, and color scheme
    - Roblox avatar uses simple geometric shapes and bright colors
    Keep the response under 200 words.`,
  },
  {
    slug: 'among-us',
    label: 'Among Us',
    description: 'Uzay astronot tarzı karakter',
    icon: 'FaUserAstronaut',
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-600',
    prompt: `You are an Among Us character designer. Analyze this person's photo.
    Create an Among Us crewmate design inspired by this person:
    - Classic Among Us bean-shaped body with visor
    - Choose a suit color that matches or complements the person's clothing
    - Add a matching hat or accessory that reflects their personality/appearance
    - Describe the color scheme: suit color, visor color, any pet
    - Keep the iconic Among Us silhouette
    Keep the response under 150 words.`,
  },
  {
    slug: 'pixel-rpg',
    label: 'Pixel RPG Hero',
    description: 'Klasik JRPG piksel karakter',
    icon: 'FaDragon',
    color: 'yellow',
    bgGradient: 'from-yellow-500 to-amber-600',
    prompt: `You are a pixel art RPG character designer. Analyze this person's photo.
    Design a classic JRPG pixel art character based on this person:
    - 16-bit or 32-bit pixel art style (Final Fantasy, Zelda inspired)
    - Match the person's hair, eye color, and complexion
    - Choose an RPG class that fits their appearance (Warrior, Mage, Archer, etc.)
    - Describe equipment, clothing, and color palette
    - Include character stats flavor text (e.g., "The Brave Warrior of the East")
    Keep the response under 200 words.`,
  },
  {
    slug: 'stardew',
    label: 'Stardew Valley',
    description: 'Çiftlik oyunu tarzı sevimli karakter',
    icon: 'FaSeedling',
    color: 'teal',
    bgGradient: 'from-teal-500 to-cyan-600',
    prompt: `You are a Stardew Valley character designer. Analyze this person's photo.
    Create a Stardew Valley-style farmer character based on this person:
    - Cute, charming pixel art style with warm colors
    - Match hair color, eye color, and skin tone
    - Choose a farmer outfit that reflects their personality
    - Add a seasonal accessory (hat, tool, pet)
    - Describe the character's farm specialty (crops, animals, fishing, mining)
    - Warm, cozy aesthetic with earthy color palette
    Keep the response under 200 words.`,
  },
  {
    slug: 'fortnite',
    label: 'Fortnite Skin',
    description: 'Fortnite tarzı 3D model savaşçı',
    icon: 'FaCrosshairs',
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    prompt: `You are a Fortnite skin designer. Analyze this person's photo.
    Create a Fortnite character outfit description matching this person:
    - Stylized 3D action hero look
    - Vibrant and modern battle royale outfit matching their clothing colors
    - Cool tactical gear, boots, and gloves
    - Match their hairstyle, hair color, and facial expression
    - Add a unique Fortnite back bling accessory (backpack) that fits their style
    Keep the response under 200 words.`,
  },
  {
    slug: 'gta-sa',
    label: 'GTA San Andreas',
    description: 'CJ tarzı klasik low-poly karakter',
    icon: 'FaCar',
    color: 'orange',
    bgGradient: 'from-orange-500 to-amber-600',
    prompt: `You are a GTA San Andreas character artist. Analyze this person's photo.
    Design a 2004-style low-polygon 3D character matching this person:
    - Classic PS2-era low-poly aesthetic
    - Los Santos street fashion matching their actual clothes (jeans, tank top, t-shirt, chains, sneakers)
    - Match hair color, facial features, and build
    - Emphasize San Andreas nostalgic textures (slightly pixelated but iconic)
    Keep the response under 200 words.`,
  },
  {
    slug: 'pokemon',
    label: 'Pokémon Trainer',
    description: 'Anime tarzı Pokémon antrenörü',
    icon: 'FaCircle',
    color: 'red',
    bgGradient: 'from-red-500 to-rose-600',
    prompt: `You are a Pokémon character designer. Analyze this person's photo.
    Design an anime-style Pokémon Trainer based on this person:
    - Classic Pokémon anime art style (Nintendo/GameFreak style)
    - Custom trainer cap, vest/jacket, and bag reflecting the colors of their outfit
    - Match hair color, style, eye color, and face shape
    - Mention their signature Pokémon companion that would match their personality
    Keep the response under 200 words.`,
  },
  {
    slug: 'valorant',
    label: 'Valorant Agent',
    description: 'Valorant stilinde taktiksel ajan',
    icon: 'FaShieldAlt',
    color: 'purple',
    bgGradient: 'from-purple-500 to-indigo-600',
    prompt: `You are a Valorant character designer. Analyze this person's photo.
    Design a playable Valorant Agent based on this person:
    - Futuristic cell-shaded tactical art style (Riot Games style)
    - Tactical vest, armor, straps, and high-tech utility belts
    - Color scheme matching their clothing precisely
    - Describe their class (Duelist, Initiator, Controller, or Sentinel)
    - Detail their unique signature abilities (e.g. fire, wind, shadow, tech)
    Keep the response under 200 words.`,
  },
];

/**
 * Slug'a göre tema bulma yardımcı fonksiyonu
 * @param {string} slug - Tema slug değeri
 * @returns {Object|undefined} Tema objesi
 */
export const getThemeBySlug = (slug) => {
  return THEMES.find((theme) => theme.slug === slug);
};
