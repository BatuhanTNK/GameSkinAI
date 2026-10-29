import { analyzeAndConvert, generateImage } from './gemini';
import { invokeEdgeFunction } from './supabase';

jest.mock('./supabase', () => ({ isSupabaseConfigured: true, invokeEdgeFunction: jest.fn() }));
afterEach(() => jest.resetAllMocks());

test('live analysis failure reaches the UI instead of returning demo data', async () => {
  invokeEdgeFunction.mockRejectedValue(new Error('Supabase unavailable'));
  await expect(analyzeAndConvert('photo', 'image/png', 'Minecraft', true)).rejects.toThrow('Supabase unavailable');
});

test('missing analysis output is not successful', async () => {
  invokeEdgeFunction.mockResolvedValue({});
  await expect(analyzeAndConvert('photo', 'image/png', 'Minecraft')).rejects.toThrow('açıklaması döndürmedi');
});

test('image production error reaches the UI without a third party fallback', async () => {
  invokeEdgeFunction.mockRejectedValue(new Error('Gemini quota'));
  await expect(generateImage('character')).rejects.toThrow('Gemini quota');
});

test('generated PNG is a usable data URL for variations and storage', async () => {
  invokeEdgeFunction.mockResolvedValue({ imageBase64: 'cG5n', mimeType: 'image/png' });
  await expect(generateImage('character')).resolves.toBe('data:image/png;base64,cG5n');
});

test('transient image service failure retries once without repeating analysis', async () => {
  invokeEdgeFunction
    .mockRejectedValueOnce(Object.assign(new Error('Görsel servisi şu anda meşgul.'), { status: 500 }))
    .mockResolvedValueOnce({ imageBase64: 'cG5n', mimeType: 'image/png' });
  await expect(generateImage('character')).resolves.toBe('data:image/png;base64,cG5n');
  expect(invokeEdgeFunction).toHaveBeenCalledTimes(2);
  expect(invokeEdgeFunction).toHaveBeenNthCalledWith(2, 'convert', { action: 'generateImage', prompt: 'character' });
});

test('persistent server failure stops after two attempts', async () => {
  invokeEdgeFunction.mockRejectedValue(Object.assign(new Error('Image service down'), { status: 503 }));
  await expect(generateImage('character')).rejects.toThrow('Image service down');
  expect(invokeEdgeFunction).toHaveBeenCalledTimes(2);
});

test('authentication failure is not retried', async () => {
  invokeEdgeFunction.mockRejectedValue(Object.assign(new Error('Login required'), { status: 401 }));
  await expect(generateImage('character')).rejects.toThrow('Login required');
  expect(invokeEdgeFunction).toHaveBeenCalledTimes(1);
});
