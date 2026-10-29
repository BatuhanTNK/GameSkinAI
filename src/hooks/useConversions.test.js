import { act, renderHook, waitFor } from '@testing-library/react';
import { useConversions } from './useConversions';
import { supabase } from 'lib/supabase';

jest.mock('contexts/AuthContext', () => {
  const user = { id: '11111111-1111-4111-8111-111111111111', user_metadata: {} };
  return { useAuth: () => ({ user }) };
});
jest.mock('lib/supabase', () => ({ isSupabaseConfigured: true, supabase: { from: jest.fn() } }));

let query;
beforeEach(() => {
  localStorage.clear();
  query = {
    select: jest.fn(() => query), eq: jest.fn(() => query), insert: jest.fn(() => query),
    order: jest.fn().mockResolvedValue({ data: [], error: null }), single: jest.fn(),
  };
  supabase.from.mockReturnValue(query);
});

test('failed database insert does not create a successful local conversion', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  query.single.mockResolvedValue({ data: null, error: { message: 'RLS denied' } });
  const { result } = renderHook(() => useConversions());
  await waitFor(() => expect(result.current.loading).toBe(false));
  let saved;
  await act(async () => { saved = await result.current.addConversion({ theme_slug: 'minecraft' }); });
  expect(saved).toEqual({ data: null, error: 'RLS denied' });
  expect(result.current.conversions).toEqual([]);
  expect(localStorage.getItem('gameskinai_conversions')).toBeNull();
  log.mockRestore();
});

test('successful database insert caches the real server ID', async () => {
  const record = { id: 'database-record-id', theme_slug: 'minecraft' };
  query.single.mockResolvedValue({ data: record, error: null });
  const { result } = renderHook(() => useConversions());
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { await result.current.addConversion({ theme_slug: 'minecraft' }); });
  expect(result.current.conversions[0].id).toBe(record.id);
  expect(JSON.parse(localStorage.getItem('gameskinai_conversions'))[0].id).toBe(record.id);
});
