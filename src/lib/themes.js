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
    description_en: 'Pixel art style block character',
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
    description_en: 'Round head, blocky body style',
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
    description_en: 'Space astronaut style character',
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
    description_en: 'Classic JRPG pixel character',
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
    description_en: 'Cute farming game character',
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
    description_en: 'Fortnite style 3D warrior',
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
    description_en: 'CJ style classic low-poly character',
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
    description_en: 'Anime style Pokémon trainer',
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
    description_en: 'Tactical agent in Valorant style',
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
  // Yeni Eklenen Temalar
  {
    slug: 'brawl-stars',
    label: 'Brawl Stars',
    description: 'Renkli 3D mobil brawler karakter',
    description_en: 'Colorful 3D mobile brawler character',
    icon: 'FaGamepad',
    color: 'purple',
    bgGradient: 'from-purple-600 to-indigo-700',
    prompt: `You are a Brawl Stars character designer. Analyze this person's photo.
    Design a 3D Brawl Stars brawler character based on this person:
    - Chunky, stylized cartoon 3D model with bold outlines and vibrant colors
    - Match their hairstyle, facial features, skin tone, and clothing style
    - Give them a unique brawler weapon or gadget matching their vibe
    - Detail their Super ability and brawler role (Damage Dealer, Tank, Support, Assassin)
    Keep the response under 200 words.`,
  },
  {
    slug: 'clash-royale',
    label: 'Clash Royale',
    description: 'Karikatürize 3D krallık savaşçısı',
    description_en: 'Cartoonish 3D kingdom warrior',
    icon: 'FaCrown',
    color: 'amber',
    bgGradient: 'from-amber-500 to-yellow-600',
    prompt: `You are a Clash Royale / Clash of Clans character designer. Analyze this person's photo.
    Create a Clash-style kingdom troop card based on this person:
    - Supercell signature 3D cartoon art style with expressive faces and crown accents
    - Custom armor/tunic matching their outfit colors
    - Give them an iconic troop title (e.g., "The Royal Archer", "Elixir Knight")
    - Include troop rarity (Epic/Legendary) and elixir cost
    Keep the response under 200 words.`,
  },
  {
    slug: 'lol',
    label: 'LoL Champion',
    description: 'Epik MOBA şampiyonu ve büyü zırhı',
    description_en: 'Epic MOBA champion and magic armor',
    icon: 'FaDragon',
    color: 'blue',
    bgGradient: 'from-blue-600 to-cyan-700',
    prompt: `You are a League of Legends concept artist. Analyze this person's photo.
    Design a playable LoL Champion based on this person:
    - High-fantasy Riot splash art style with dramatic lighting and glowing magical effects
    - Detailed armor, robes, or weaponry reflecting their outfit colors
    - Specify their lane/role (Top, Jungle, Mid, ADC, Support) and champion title
    - Outline passive and ultimate abilities (R) inspired by their persona
    Keep the response under 200 words.`,
  },
  {
    slug: 'apex',
    label: 'Apex Legend',
    description: 'Futuristik battle royale pilotu',
    description_en: 'Futuristic battle royale pilot',
    icon: 'FaCrosshairs',
    color: 'red',
    bgGradient: 'from-red-600 to-orange-700',
    prompt: `You are an Apex Legends character designer. Analyze this person's photo.
    Design a new Apex Legend based on this person:
    - Gritty, futuristic sci-fi battle royale hero design (Respawn style)
    - High-tech jump kit, mechanical armor plates, and visor matching their clothing
    - Define their Legend class (Recon, Assault, Skirmisher, Support, Controller)
    - Detail Tactical and Ultimate abilities
    Keep the response under 200 words.`,
  },
  {
    slug: 'lego',
    label: 'LEGO Minifigure',
    description: 'Plastik blok ikonik minifigür stili',
    description_en: 'Iconic plastic block minifigure style',
    icon: 'FaCube',
    color: 'yellow',
    bgGradient: 'from-yellow-400 to-amber-500',
    prompt: `You are a LEGO minifigure designer. Analyze this person's photo.
    Create an official LEGO minifigure model inspired by this person:
    - Classic yellow or accurate skin-tone LEGO minifigure head with painted face expression
    - Cylindrical head, stud top, trapezoidal plastic torso, and blocky legs
    - Print their exact shirt pattern, logos, and pants onto the plastic torso and leg prints
    - Include a custom plastic LEGO hairpiece/hat accessory
    Keep the response under 200 words.`,
  },
  {
    slug: 'fall-guys',
    label: 'Fall Guys',
    description: 'Renkli peluş fasulye kostümü',
    description_en: 'Colorful plush bean costume',
    icon: 'FaSmile',
    color: 'pink',
    bgGradient: 'from-pink-500 to-rose-600',
    prompt: `You are a Fall Guys costume designer. Analyze this person's photo.
    Design a Fall Guys bean character costume based on this person:
    - Round bean-shaped jellybean body with two cute black dot eyes and faceplate
    - Whimsical plush costume outfit translating their hair, glasses, shirt, and shoes into a fun bean cosplay
    - Vibrant glossy textures and obstacle-course ready vibe
    Keep the response under 150 words.`,
  },
  {
    slug: 'genshin',
    label: 'Genshin Impact',
    description: 'Anime 3D cel-shaded kahraman',
    description_en: 'Anime 3D cel-shaded hero',
    icon: 'FaGem',
    color: 'teal',
    bgGradient: 'from-teal-400 to-emerald-600',
    prompt: `You are a Genshin Impact character designer. Analyze this person's photo.
    Create a 5-star playable Genshin Impact anime character based on this person:
    - Beautiful HoYoverse 3D cel-shaded anime aesthetic with intricate layered outfits
    - Assign an Element (Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo) matching their outfit color
    - Choose weapon type (Sword, Claymore, Polearm, Bow, Catalyst)
    - Describe their elemental vision gem location and burst animation
    Keep the response under 200 words.`,
  },
  {
    slug: 'cyberpunk',
    label: 'Cyberpunk 2077',
    description: 'Neon siber protez ve deri ceket',
    description_en: 'Neon cyberware and leather jacket',
    icon: 'FaBolt',
    color: 'yellow',
    bgGradient: 'from-yellow-400 to-cyan-500',
    prompt: `You are a Cyberpunk 2077 character concept artist. Analyze this person's photo.
    Design a Night City mercenary (V-style) based on this person:
    - Dark futuristic sci-fi aesthetic with glowing neon accents and Kiroshi optics
    - Cybernetic face/arm implants, LED collar jacket, street-kid/corpo fashion
    - Match hair style, tattoos, facial hair, and clothing colors
    - Detail signature cyberware weapons (Mantis Blades, Monowire, Smart Smartguns)
    Keep the response under 200 words.`,
  },
  {
    slug: 'witcher',
    label: 'The Witcher',
    description: 'Orta Çağ canavar avcısı şövalye',
    description_en: 'Medieval monster hunter knight',
    icon: 'FaShieldAlt',
    color: 'slate',
    bgGradient: 'from-gray-700 to-slate-900',
    prompt: `You are a Witcher universe character designer. Analyze this person's photo.
    Design a Witcher monster hunter or sorcerer character matching this person:
    - Gritty dark medieval fantasy aesthetic (CD Projekt Red style)
    - Studded leather jacket, steel shoulder pauldrons, double swords (steel & silver)
    - Match facial features, hair, beard, scars, and cat-like Witcher eyes
    - Detail signature Witcher Sign magic spell (Aard, Igni, Quen, Yrden, Axii)
    Keep the response under 200 words.`,
  },
  {
    slug: 'cs2',
    label: 'Counter-Strike 2',
    description: 'Taktiksel askeri tim operatörü',
    description_en: 'Tactical military squad operator',
    icon: 'FaUserSecret',
    color: 'emerald',
    bgGradient: 'from-emerald-700 to-green-900',
    prompt: `You are a Counter-Strike 2 agent designer. Analyze this person's photo.
    Design a CS2 tactical agent (CT or T squad) based on this person:
    - Photorealistic Source 2 tactical military gear (ballistic helmet, Kevlar vest, radio, goggles)
    - Outfit color scheme matching their clothes translated into camo/black tactical wear
    - Match face shape, eyes, hair/beard under tactical gear
    - Include custom gloves, patches, and equipment belt details
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
