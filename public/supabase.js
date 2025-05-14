import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = 'https://YOUR‑PROJECT.supabase.co';
const SUPABASE_KEY  = 'public‑anon‑key';          // Settings ▸ API
const supabase      = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true }
});

const form   = document.getElementById('loginForm');
const errorP = document.getElementById('error');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorP.textContent = '';

  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    errorP.textContent = error.message;
  } else {
    // redireciona para a área logada
    window.location.href = '/dashboard.html';
  }
});
