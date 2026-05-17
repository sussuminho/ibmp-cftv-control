# 🚀 IBMP CFTV Control — Guia de Deploy PWA

> **Versão 6.0 | Segurança do Trabalho IBMP**

---

## 📦 Arquivos que você recebeu

```
IBMP_CFTV_Control_v6_PWA.html   ← App principal (modificado para PWA)
manifest.json                    ← Metadados de instalação
sw.js                            ← Service Worker (funciona offline)
icon-192.png                     ← Ícone 192×192px
icon-512.png                     ← Ícone 512×512px
icon-ibmp-cftv.svg               ← Ícone vetorial (para redesign futuro)
```

> **Importante:** Todos os arquivos devem ficar **na mesma pasta**.  
> O sistema só funciona como PWA instalável quando servido via HTTPS.

---

## OPÇÃO A — GitHub Pages (gratuito, HTTPS automático)

### Pré-requisitos
- Conta no GitHub (gratuita: github.com)
- Git instalado no computador **ou** uso direto pelo navegador

### Passo a passo (via navegador — sem instalar nada)

1. Acesse [github.com](https://github.com) e faça login (ou crie conta)

2. Clique em **"New repository"** (botão verde)
   - Nome: `ibmp-cftv-control`
   - Visibilidade: **Private** (recomendado para sistema interno)
   - Clique em **"Create repository"**

3. Na página do repositório, clique em **"uploading an existing file"**

4. Arraste os 6 arquivos para a área de upload:
   - `IBMP_CFTV_Control_v6_PWA.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`

5. Clique em **"Commit changes"**

6. Vá em **Settings** → **Pages** (menu lateral esquerdo)

7. Em **"Source"**, selecione:
   - Branch: `main`
   - Pasta: `/ (root)`
   - Clique em **"Save"**

8. Aguarde ~2 minutos. A URL será exibida no topo:
   ```
   https://SEU-USUARIO.github.io/ibmp-cftv-control/IBMP_CFTV_Control_v6_PWA.html
   ```

9. Acesse essa URL no Chrome — aparecerá o banner **"Instalar"** automaticamente!

---

## OPÇÃO B — Servidor IIS Interno (rede do IBMP)

### Pré-requisitos
- Windows Server com IIS habilitado
- Certificado SSL (HTTPS) instalado — **obrigatório para PWA**
- Acesso administrativo ao IIS

### Passo a passo

1. **Crie uma pasta** no servidor, ex: `C:\inetpub\wwwroot\cftv\`

2. **Copie os 5 arquivos** para essa pasta

3. No **IIS Manager**:
   - Clique com botão direito em **Sites** → **"Add Website"**
   - Site name: `IBMP-CFTV`
   - Physical path: `C:\inetpub\wwwroot\cftv`
   - Binding: HTTPS, porta 443, selecione o certificado SSL

4. **Configure o MIME type** do arquivo `.json` (se ainda não existir):
   - Em "MIME Types" do IIS, adicione:
     - Extension: `.json`
     - MIME type: `application/json`

5. **Configure o MIME type** do Service Worker:
   - Extension: `.js`
   - MIME type: `application/javascript`

6. **Adicione o header de Service Worker** (em `web.config`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="Service-Worker-Allowed" value="/" />
      </customHeaders>
    </httpProtocol>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
    </staticContent>
  </system.webServer>
</configuration>
```

7. Acesse `https://intranet.ibmp.local/cftv/IBMP_CFTV_Control_v6_PWA.html`

---

## OPÇÃO C — Uso local sem servidor (sem instalação PWA)

Se não quiser hospedar, ainda é possível usar **sem os benefícios de PWA**:

1. Crie uma pasta `IBMP_CFTV` no computador
2. Coloque todos os arquivos juntos
3. Abra o `IBMP_CFTV_Control_v6_PWA.html` direto no Chrome

⚠ Neste modo: funciona normalmente, mas o banner de instalação não aparece e o offline não é garantido (depende do cache do navegador).

---

## 📱 Como instalar após hospedar

### No computador (Windows/Mac — Chrome ou Edge)
1. Abra a URL no Chrome ou Edge
2. Aparecerá o banner verde **"Instalar IBMP CFTV Control"** no canto inferior
3. Clique em **"Instalar"**
4. O app aparece na área de trabalho e no menu Iniciar

### No celular (Android)
1. Abra no Chrome Mobile
2. Menu (⋮) → **"Adicionar à tela inicial"**
3. Confirme — aparece como app na tela inicial

### No iPhone/iPad
1. Abra no Safari (obrigatório no iOS)
2. Botão compartilhar (□↑) → **"Adicionar à Tela de Início"**

---

## 🔄 Como atualizar o sistema no futuro

1. Abra o `sw.js`
2. Mude o número da versão na linha:
   ```js
   const CACHE_NAME = 'ibmp-cftv-v6';
   ```
   Para `v7`, `v8`, etc.
3. Suba os arquivos novamente
4. Na próxima abertura, o sistema detecta a nova versão automaticamente

---

## 🔒 Substituindo o ícone pelo logo oficial do IBMP

Se tiver o logo IBMP em PNG de alta resolução:

1. Redimensione para **512×512px** e salve como `icon-512.png`
2. Redimensione para **192×192px** e salve como `icon-192.png`
3. Substitua os arquivos na pasta de deploy
4. Recomendado: fundo escuro (`#0f1923`) ou transparente

---

## ❓ Dúvidas frequentes

**O banner de instalação não aparece**  
→ Verifique se está acessando via HTTPS. Em HTTP o PWA não funciona.

**Diz "Service Worker falhou ao registrar"**  
→ O `sw.js` precisa estar na mesma pasta que o HTML. Confirme o upload.

**O app não atualiza após mudança de versão**  
→ Feche e reabra o app. Ou: F12 → Application → Service Workers → "Update".

**Funciona offline mas as fontes Google não carregam**  
→ Normal — as fontes do Google precisam de internet na primeira abertura. Depois ficam cacheadas.

---

*IBMP CFTV Control v6 PWA — Segurança do Trabalho IBMP*  
*Desenvolvido por Luan Hachiguti*
