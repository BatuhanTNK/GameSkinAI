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
    prompt: `You are a Minecraft skin artist. Analyze this person's photo carefully.
    Describe a Minecraft character skin that resembles this person:
    - Pixel art style, blocky 8-bit aesthetic
    - Identify the person's hair color, eye color, skin tone, and clothing colors
    - Describe the skin layout: head (face features, hair), body (shirt/clothing color), arms, legs
    - Keep it to 64x64 pixel skin format description
    - Mention specific pixel color codes (hex) for main colors
    - Output format: Brief character description + color palette + style notes
    Keep the response under 200 words.`,
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
];

/**
 * Slug'a göre tema bulma yardımcı fonksiyonu
 * @param {string} slug - Tema slug değeri
 * @returns {Object|undefined} Tema objesi
 */
export const getThemeBySlug = (slug) => {
  return THEMES.find((theme) => theme.slug === slug);
};
