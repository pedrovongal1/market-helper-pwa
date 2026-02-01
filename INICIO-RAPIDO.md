# ⚡ INÍCIO RÁPIDO - MARKET HELPER PWA

**Tempo estimado:** 30 minutos  
**Nível:** Iniciante

---

## 🎯 O QUE VOCÊ VAI FAZER

1. ✅ Criar projeto no Supabase (banco de dados grátis)
2. ✅ Subir código no GitHub
3. ✅ Deploy no Vercel (hospedagem grátis)
4. ✅ Testar app funcionando

**Resultado:** App instalável funcionando 100% grátis!

---

## 📱 PASSO A PASSO

### PARTE 1: SUPABASE (10 min)

#### 1.1 - Criar conta
- Acesse: https://supabase.com
- Clique "Start your project"
- Login com GitHub (mais rápido)

#### 1.2 - Criar projeto
- Clique "New Project"
- Name: `market-helper`
- Password: Crie uma senha forte
- Region: `South America (São Paulo)`
- Clique "Create new project"
- ⏰ Aguarde 2-3 minutos

#### 1.3 - Configurar banco
- Quando carregar, clique "SQL Editor" (menu lateral)
- Clique "New query"
- Abra o arquivo `supabase-schema.sql` deste projeto
- Copie TUDO e cole no editor
- Clique "Run" (ou Ctrl+Enter)
- ✅ Deve aparecer "Success"

#### 1.4 - Pegar chaves
- Clique "Settings" → "API"
- Copie:
  - **Project URL:** `https://xxx.supabase.co`
  - **anon public:** `eyJ...` (chave grande)
- 📝 Cole num bloco de notas (vai usar depois)

---

### PARTE 2: GITHUB (5 min)

#### 2.1 - Criar repositório
- Acesse: https://github.com
- Clique no **+** → "New repository"
- Repository name: `market-helper-pwa`
- Public
- ✅ "Add a README file"
- Clique "Create repository"

#### 2.2 - Upload arquivos
- No repo, clique "Add file" → "Upload files"
- Arraste TODOS os arquivos deste projeto
- Commit message: "Primeiro commit"
- Clique "Commit changes"
- ✅ Arquivos enviados!

---

### PARTE 3: VERCEL (10 min)

#### 3.1 - Criar conta
- Acesse: https://vercel.com
- Clique "Sign Up"
- Login com GitHub (mais rápido)

#### 3.2 - Importar projeto
- Clique "Add New..." → "Project"
- Autorize Vercel a ver seus repos
- Selecione `market-helper-pwa`
- Clique "Import"

#### 3.3 - Configurar

**Framework:** Vite  
**Build Command:** `npm run build`  
**Output Directory:** `dist`

**Environment Variables:**
- Clique "Environment Variables"
- Adicione:

  Nome: `VITE_SUPABASE_URL`  
  Valor: (cole a URL do Supabase)

  Nome: `VITE_SUPABASE_ANON_KEY`  
  Valor: (cole a chave anon)

#### 3.4 - Deploy
- Clique "Deploy"
- ⏰ Aguarde 2-3 minutos
- ✅ "Congratulations!"

---

### PARTE 4: TESTAR (5 min)

#### 4.1 - Abrir app
- Vercel mostra sua URL: `https://market-helper-pwa.vercel.app`
- Clique "Visit"
- 🎉 **App abre!**

#### 4.2 - Criar conta
- Clique "Cadastrar"
- Preencha email e senha
- Clique "Criar Conta"
- ✅ Login automático!

#### 4.3 - Criar lista
- Clique "Nova Lista"
- Nome: "Teste"
- Orçamento: R$ 100
- Adicione alguns produtos
- Clique "Salvar"
- ✅ Lista criada!

#### 4.4 - Verificar banco
- Volte no Supabase
- Clique "Table Editor"
- Clique "listas"
- ✅ Sua lista está lá!

---

## 🎊 PRONTO!

Você tem um PWA profissional funcionando!

**Próximos passos:**

1. **Testar instalação mobile**
   - Abra URL no celular
   - "Adicionar à tela inicial"
   - ✅ Ícone aparece!

2. **Compartilhar com amigos**
   - Envie a URL
   - Peça feedback

3. **Ler README completo**
   - Tem muito mais funcionalidades
   - Customizações
   - Melhorias

---

## 🆘 PROBLEMAS?

### "Supabase URL not found"
→ Vercel → Settings → Environment Variables  
→ Verifique se colou certo  
→ Redeploy

### "Build failed"
→ GitHub → Verifique se todos arquivos foram enviados  
→ Principalmente `package.json`

### "App não abre"
→ F12 → Console  
→ Veja qual erro  
→ Geralmente é variável de ambiente

---

## 💡 DICAS

- **Teste sempre em aba anônima** após mudanças
- **Limpe cache** se algo não atualizar (Ctrl+Shift+Del)
- **Veja Console** (F12) para debug
- **Leia README.md** para funcionalidades completas

---

## 📞 PRECISA DE AJUDA?

Abra uma issue no GitHub:
https://github.com/SEU_USUARIO/market-helper-pwa/issues

---

**Parabéns! Você criou um PWA profissional! 🚀**

Custo total: **R$ 0,00**  
Tempo: **30 minutos**  
Resultado: **App instalável funcionando!**
