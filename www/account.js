(() => {
 const client = window.supabase?.createClient('https://ppxcqjmdqrpkyrknrpkm.supabase.co', 'sb_publishable_pWyMpk-xcrR4qt0gZtHpnQ_gYlbqkF3');
 const button = $('readerAccount');
 let account, pending, working, conflict;
 const paint = text => { button.textContent = text; };
 const snapshot = () => {
   const {cache, lastBackup, ...rest} = data;
   return rest;
 };
 const canonical = value => Array.isArray(value) ? value.map(canonical) :
   value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k,canonical(value[k])])) : value;
 async function fingerprint(payload) {
   const bytes = new TextEncoder().encode(JSON.stringify(canonical(payload)));
   return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n => n.toString(16).padStart(2,'0')).join('');
 }
 function showLocal() {
   load();
   renderAll();
   syncNative();
 }
 async function sync(choice) {
   if (!account || working || (conflict && !choice)) return;
   const id = account.id;
   working = true;
   paint('Sincronizando…');
   try {
     const stored = appStorage.getItem(KEY);
     const draft = snapshot();
     const hash = await fingerprint(draft);
     const meta = JSON.parse(appStorage.getItem('sync_meta') || 'null');
     if (id !== account?.id) return;
     const table = () => client.from('reader_state');
     const {data:remote,error} = await table().select('revision,payload').eq('user_id',id).maybeSingle();
     if (error) throw error;
     if (id !== account?.id) return;
     let revision = remote?.revision;
     let baseline = hash;
     if (remote && (choice === 'remote' || !stored || meta?.hash === hash)) {
       if (choice !== 'remote' && appStorage.getItem(KEY) !== stored) return queue();
       if (meta?.revision !== revision || choice === 'remote' || !stored) {
         appStorage.setItem(KEY,JSON.stringify(remote.payload));
         showLocal();
         baseline = await fingerprint(snapshot());
       }
     } else if (remote && (choice === 'local' ? conflict?.revision !== revision : meta?.revision !== revision)) {
       conflict = remote;
       paint('Resolver versões dos dados');
       return;
     } else if (!remote || meta?.hash !== hash) {
       const saved = remote
         ? await table().update({revision:revision+1,payload:draft}).eq('user_id',id).eq('revision',revision).select('revision').maybeSingle()
         : await table().insert({user_id:id,payload:draft}).select('revision').single();
       if (id !== account?.id) return;
       if (saved.error?.code === '23505' || !saved.error && !saved.data) {
         conflict = null;
         return queue();
       }
       if (saved.error) throw saved.error;
       revision = saved.data.revision;
       if (!appStorage.getItem(KEY)) appStorage.setItem(KEY,JSON.stringify(draft));
     }
     if (id !== account?.id) return;
     appStorage.setItem('sync_meta',JSON.stringify({revision,hash:baseline}));
     conflict = null;
     paint('Conta sincronizada');
     if (await fingerprint(snapshot()) !== baseline) queue();
   } catch (error) {
     if (id === account?.id) paint('Sincronização pendente · Tentar novamente');
     console.warn('Falha na sincronização',error.code || error.name);
   } finally { working = false; }
 }
 function queue() {
   clearTimeout(pending);
   if (account) pending = setTimeout(() => sync(),700);
 }
 window.queueReaderSync = queue;
 window.openReaderAccount = () => {
   if (!client) return toast('Conecte-se à internet e recarregue o app para entrar.');
   if (account) {
     openModal('Sua conta','<p>'+esc(account.email)+'</p><p>'+esc(button.textContent)+'</p>'+
       (conflict ? '<p>O aparelho e a nuvem têm alterações. Exporte uma cópia antes de escolher a versão.</p><button class="btn ghost" id="syncCopy">Exportar cópia</button> <button class="btn" id="syncLocal">Manter dados do aparelho</button> <button class="btn ghost" id="syncCloud">Manter dados da nuvem</button>' : '<button class="btn" id="syncNow">Sincronizar agora</button>')+
       ' <button class="btn ghost" id="syncExit">Sair</button>');
     for(const [id,action] of Object.entries({syncCopy:exportData,syncLocal:()=>sync('local'),syncCloud:()=>sync('remote'),syncNow:()=>sync(),syncExit:async()=>{
       const {error} = await client.auth.signOut({scope:'local'});
       if(error) toast('Não foi possível sair. Tente novamente.');
     }})) {
       if($(id)) $(id).onclick = () => { if(id !== 'syncCopy') closeModal(); action(); };
     }
     return;
   }
   openModal('Conta EntrePaginas','<form id="readerLogin"><div class="field"><label for="readerEmail">E-mail</label><input id="readerEmail" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="readerPassword">Senha</label><input id="readerPassword" name="password" type="password" minlength="6" autocomplete="current-password" required></div><p id="readerMessage" role="status"></p><button class="btn" value="login">Entrar</button> <button class="btn ghost" value="signup">Criar conta</button></form>');
   $('readerLogin').onsubmit = async event => {
     event.preventDefault();
     const form = event.currentTarget, message = $('readerMessage');
     if(form.dataset.busy) return;
     form.dataset.busy = '1';
     message.textContent = 'Aguarde…';
     const credentials = {email:form.elements.email.value.trim(),password:form.elements.password.value};
     const signup = event.submitter?.value === 'signup';
     try {
       const {error} = await (signup ? client.auth.signUp(credentials) : client.auth.signInWithPassword(credentials));
       message.textContent = error ? (signup ? 'Não foi possível criar a conta. Confira o e-mail e tente novamente.' : 'Confira seu e-mail, senha e a confirmação do cadastro.') : (signup ? 'Confirme pelo e-mail e volte para entrar.' : 'Abrindo sua conta…');
     } catch { message.textContent = 'Sem conexão. Tente novamente.'; }
     finally { delete form.dataset.busy; }
   };
 };
 paint(client ? 'Entre para sincronizar' : 'Conta indisponível offline');
 if (!client) return;
 client.auth.onAuthStateChange((_event,session) => setTimeout(() => {
   const next = session?.user;
   if(next?.id !== account?.id) {
     account = next;
     conflict = null;
     storageScope = next ? 'reader:'+next.id+':' : '';
     closeModal();
     showPage('home');
     showLocal();
     paint(next ? 'Conectando sua conta…' : 'Entre para sincronizar');
   }
   queue();
 },0));
 window.addEventListener('online',queue);
 document.addEventListener('visibilitychange',() => { if(!document.hidden) queue(); });
 setInterval(() => { if(!document.hidden && !document.querySelector('.modal.open')) sync(); },15000);
})();
