/**
 * @fileoverview Mevcut kullanıcının admin yetkisini kontrol eden hook.
 * Demo modda yerel test için admin kabul edilir; Supabase'de profiles.is_admin okunur.
 */

import { useState, useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { checkIsAdmin } from 'lib/admin';

/**
 * Admin yetki kontrolü hook'u.
 * @returns {{isAdmin: boolean, adminChecked: boolean}}
 */
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await checkIsAdmin(user);
      if (!cancelled) {
        setIsAdmin(result);
        setAdminChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { isAdmin, adminChecked };
}
