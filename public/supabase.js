import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = 'https://jtbwfvtalanakndzrgij.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0YndmdnRhbGFuYWtuZHpyZ2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzQ4NjksImV4cCI6MjA2MjgxMDg2OX0.8EEuJuEhDz71ol6Arsys8SbTJ2mBksUiHXKXoBDDdLU';          // Settings ▸ API

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true }
});

// ======== LOGIN ======== //
const loginForm   = document.getElementById('loginForm');
const loginErr    = document.getElementById('error');
const gSignInBtn  = document.getElementById('googleSignIn');

gSignInBtn?.addEventListener('click', () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/dashboard.html` }
  })  // se o usuário não existir, ele será criado automaticamente
);

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginErr.textContent = '';

  const email    = e.target.email.value.trim().toLowerCase();
  const password = e.target.password.value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) loginErr.textContent = error.message;
  else        location.href = '/dashboard.html';
});

// ======== SIGN‑UP ======== //
const signupForm   = document.getElementById('signupForm');
const signupErr    = document.getElementById('regError');
const gSignUpBtn   = document.getElementById('googleSignUp');

gSignUpBtn?.addEventListener('click', () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/dashboard.html` }
  })
);

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupErr.textContent = '';

  const email    = e.target.regEmail.value.trim().toLowerCase();
  const password = e.target.regPass.value;
  const dob      = e.target.dob.value;

  // 1) cria usuário
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return signupErr.textContent = error.message;

  // 2) grava data de nascimento via RPC ou chamada REST
  await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${data.user.id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ dob })
  });

  // 3) redireciona
  location.href = '/dashboard.html';
});

// ======== CALLBACK GUARD ======== //
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session && location.pathname === '/index.html') {
    location.href = '/dashboard.html';
  }
})();