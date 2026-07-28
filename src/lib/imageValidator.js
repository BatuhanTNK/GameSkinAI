/**
 * @fileoverview Fotoğraf dosyası güvenlik ve magic byte doğrulayıcısı.
 * İstemci tarafında sahte MIME tiplerini ve zararlı dosya yüklemelerini engeller.
 */

/**
 * Dosyanın ilk byte'larını (magic bytes) okuyarak gerçek bir görsel dosyası (JPEG, PNG, WEBP)
 * olup olmadığını kontrol eder.
 * 
 * @param {File|Blob} file - Doğrulanacak dosya
 * @returns {Promise<{isValid: boolean, detectedType: string|null, error: string|null}>}
 */
export async function validateImageMagicBytes(file) {
  if (!file) {
    return { isValid: false, detectedType: null, error: 'Dosya bulunamadı.' };
  }

  // İlk 12 byte'ı oku
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length < 4) {
      return { isValid: false, detectedType: null, error: 'Geçersiz veya bozuk dosya.' };
    }

    // JPEG / JPG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { isValid: true, detectedType: 'image/jpeg', error: null };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4E &&
      bytes[3] === 0x47
    ) {
      return { isValid: true, detectedType: 'image/png', error: null };
    }

    // WEBP: 52 49 46 46 ... 57 45 42 50 ("RIFF" ... "WEBP")
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes.length >= 12 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return { isValid: true, detectedType: 'image/webp', error: null };
    }

    return {
      isValid: false,
      detectedType: null,
      error: 'Dosya içeriği geçerli bir resim (JPEG, PNG, WEBP) formatında değil.',
    };
  } catch (err) {
    console.error('Magic byte doğrulama hatası:', err);
    return {
      isValid: false,
      detectedType: null,
      error: 'Dosya biçimi doğrulanamadı.',
    };
  }
}
