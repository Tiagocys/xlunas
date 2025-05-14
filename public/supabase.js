import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = 'https://jtbwfvtalanakndzrgij.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0YndmdnRhbGFuYWtuZHpyZ2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzQ4NjksImV4cCI6MjA2MjgxMDg2OX0.8EEuJuEhDz71ol6Arsys8SbTJ2mBksUiHXKXoBDDdLU';          // Settings ▸ API
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
