# Site dos 40 Anos da Paróquia Senhor Santo Cristo dos Milagres

Site comemorativo dos 40 anos da Paróquia Senhor Santo Cristo dos Milagres em Tiradentes, SP.

## 🚀 Deploy no Netlify

### Pré-requisitos
1. Conta no [Netlify](https://netlify.com)
2. Conta no [Supabase](https://supabase.com)
3. Repositório no GitHub/GitLab

### Passos para Deploy

#### 1. Configurar Supabase
1. Crie um projeto no Supabase
2. Execute as migrações SQL da pasta `supabase/migrations/`
3. Configure o bucket de storage:
   ```sql
   -- Execute no SQL Editor do Supabase
   insert into storage.buckets (id, name, public) values ('parish-photos', 'parish-photos', true);
   
   create policy "Public Access" on storage.objects for select using (bucket_id = 'parish-photos');
   create policy "Authenticated users can upload" on storage.objects for insert with check (bucket_id = 'parish-photos' and auth.role() = 'authenticated');
   create policy "Authenticated users can update" on storage.objects for update using (bucket_id = 'parish-photos' and auth.role() = 'authenticated');
   create policy "Authenticated users can delete" on storage.objects for delete using (bucket_id = 'parish-photos' and auth.role() = 'authenticated');
   ```

#### 2. Deploy no Netlify

**Opção A: Deploy via Git (Recomendado)**
1. Faça push do código para GitHub/GitLab
2. No Netlify, clique em "New site from Git"
3. Conecte seu repositório
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
5. Deploy automático será configurado

**Opção B: Deploy Manual**
1. Execute `npm run build` localmente
2. Faça upload da pasta `dist` no Netlify
3. Configure as variáveis de ambiente no painel do Netlify

#### 3. Configurações Importantes

**Variáveis de Ambiente no Netlify:**
- Vá para Site settings > Environment variables
- Adicione:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

**Configurações de Build:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `18`

### 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── admin/          # Painel administrativo
│   ├── layout/         # Componentes de layout
│   ├── sections/       # Seções da página
│   └── ui/            # Componentes de UI
├── lib/
│   └── supabase.ts    # Configuração do Supabase
└── App.tsx            # Componente principal
```

### 🔧 Funcionalidades

- **Carrossel de Slides**: Gerenciável via painel admin
- **Galeria de Fotos**: Upload e categorização de imagens
- **Linha do Tempo**: Eventos históricos da paróquia
- **Painel Administrativo**: Gerenciamento completo do conteúdo
- **Responsivo**: Funciona em todos os dispositivos

### 🔐 Acesso Administrativo

1. Clique no ícone de engrenagem no canto inferior direito
2. Faça login ou crie uma conta de administrador
3. Gerencie todo o conteúdo do site

### 📞 Suporte

Para dúvidas sobre o sistema, entre em contato com o desenvolvedor.

---

**Desenvolvido com ❤️ para a Paróquia Senhor Santo Cristo dos Milagres**