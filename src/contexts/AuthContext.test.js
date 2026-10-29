import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from 'lib/supabase';

let mockAuthListener;
jest.mock('lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  } },
}));
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
beforeEach(() => {
  localStorage.clear();
  supabase.auth.onAuthStateChange.mockImplementation((listener) => {
    mockAuthListener = listener;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
});

test('configured Supabase without a session does not create a demo account', async () => {
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.user).toBeNull();
  expect(result.current.isDemo).toBe(false);
});

test('Supabase sign-out event clears the previous user', async () => {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'real-user', user_metadata: {} } } } });
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.user?.id).toBe('real-user'));
  act(() => mockAuthListener('SIGNED_OUT', null));
  expect(result.current.user).toBeNull();
});
