import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Database } from './database.types';

type Attorney = Database['public']['Tables']['attorneys']['Row'];
type Deposition = Database['public']['Tables']['depositions']['Row'];

export function useAttorney() {
  const [attorney, setAttorney] = useState<Attorney | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttorney() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('attorneys')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setAttorney(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchAttorney();
  }, []);

  return { attorney, loading, error };
}

export function useDepositions() {
  const [depositions, setDepositions] = useState<Deposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDepositions() {
      try {
        const { data, error } = await supabase
          .from('depositions')
          .select('*')
          .order('deposition_date', { ascending: true });

        if (error) throw error;
        setDepositions(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDepositions();
  }, []);

  return { depositions, loading, error };
}