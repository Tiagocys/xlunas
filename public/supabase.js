import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = 'https://jtbwfvtalanakndzrgij.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0YndmdnRhbGFuYWtuZHpyZ2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzQ4NjksImV4cCI6MjA2MjgxMDg2OX0.8EEuJuEhDz71ol6Arsys8SbTJ2mBksUiHXKXoBDDdLU';          // Settings ▸ API

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true }
});

/* ——————————————————————————————————————————
   1. Função que decide a rota pós-login
——————————————————————————————————————————*/
function go(path){
  if (location.pathname !== path) location.href = path;
}

async function afterLogin(session) {
  const { data, error } = await supabase
    .from('users')
    .select('name, last_name, username, dob, avatar_url')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error(error);
    return alert('Erro ao verificar perfil.');
  }

  // 1) Se vier do Google e avatar_url estiver vazio, puxa de user_metadata
  const { data: { user } } = await supabase.auth.getUser();
  const pic = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  if (pic && !data.avatar_url) {
    await supabase
      .from('users')
      .update({ avatar_url: pic })
      .eq('id', user.id);
    data.avatar_url = pic;
  }

  // 2) Verifica campos obrigatórios
  const needsInfo = !data.name || !data.last_name ||
                    !data.username || !data.dob;

  const target = needsInfo ? '/complete-profile' : '/dashboard';
  if (location.pathname !== target) {
    location.href = target;
  }
}



/* ───────────────────────────────────────────────────────────────
   2. Roda uma única verificação de sessão *exceto* em /complete-profile.html
─────────────────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const path = location.pathname.toLowerCase();
  if (
    path === '/complete-profile'   ||
    path === '/complete-profile.html' ||
    path === '/forgot-password'    ||
    path === '/forgot-password.html' ||
    path === '/reset-password'     ||
    path === '/reset-password.html' ||
    path === '/upload'              ||
    path === '/upload.html'         ||
    path === '/verify'              ||
    path === '/verify.html'
  ) {
    return;
  }


  await afterLogin(session);
});


/* ——————————————————————————————————————————
   3. LOGIN (e-mail + senha)
——————————————————————————————————————————*/
const loginForm  = document.getElementById('loginForm');
const loginErr   = document.getElementById('error');
const gSignInBtn = document.getElementById('googleSignIn');

gSignInBtn?.addEventListener('click', () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}` }   // volta para mesma página
  })
);

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginErr.textContent = '';

  const { email, password } = e.target;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value.trim().toLowerCase(),
    password: password.value
  });

  if (error) return loginErr.textContent = error.message;
  await afterLogin(data.session);       // <── AQUI
});

/* ——————————————————————————————————————————
   4. REGISTRO (form clássico)
——————————————————————————————————————————*/
const signupForm = document.getElementById('signupForm');
const signupErr  = document.getElementById('regError');
const gSignUpBtn = document.getElementById('googleSignUp');

gSignUpBtn?.addEventListener('click', () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}` }
  })
);

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupErr.textContent = '';

  const { regEmail, regPass, dob } = e.target;
  const { data, error } = await supabase.auth.signUp({
    email: regEmail.value.trim().toLowerCase(),
    password: regPass.value
  });

  if (error) return signupErr.textContent = error.message;

  // grava infos extras e marca profile_complete = true
  await supabase.from('users')
    .update({ dob: dob.value, profile_complete: true })
    .eq('id', data.user.id);

  await afterLogin(data.session);       // <── AQUI
});