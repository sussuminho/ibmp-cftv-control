# ARQUITETURA — IBMP CFTV Control v0.8

---

## Visão geral

Aplicação PWA monolítica — todo o código (HTML + CSS + JS) está em um único arquivo:

```
IBMP_CFTV_Control_v6_5.html   ← aplicação completa (~8.000 linhas)
manifest.json                  ← metadados PWA
sw.js                          ← Service Worker (cache offline)
icon-192.png / icon-512.png    ← ícones PWA
projeto.json                   ← projeto salvo (câmeras plotadas + imagens)
```

Hospedada no GitHub Pages (HTTPS automático). Sem servidor, sem banco de dados relacional, sem dependências de runtime exceto SheetJS (CDN, somente para import XLSX).

---

## Modelo de dados

### Objeto DB (em memória, serializado no localStorage)

```javascript
DB = {
  cameras: [
    {
      'NOME CANAL':         string,   // identificador único
      'GRAVADOR':           string,
      'MODELO CÂMERA':      string,
      'MODELO GRAVADOR':    string,
      'CANAL':              string,
      'STATUS DE OPERAÇÃO': string,
      'SERIAL':             string,
      'ATIVO':              string,   // número de patrimônio
      'STATUS ATIVO':       string,
      'CRITICIDADE':        'ALTA'|'MÉDIA'|'BAIXA'  // v0.8 — padrão: 'MÉDIA'
    }
  ],
  recorders: [
    {
      'NOME DO GRAVADOR':  string,
      'MODELO':            string,
      'IP DE ACESSO':      string,
      'LOCALIZAÇÃO':       string,
      'TIPO DE GRAVADOR':  string,
      'Armazenamento':     string,
      'Observação':        string
    }
  ],
  pareceres: [
    {
      'NOME':              string,
      'Localização/Bloco': string,
      'Parecer':           string
    }
  ],
  recommended: [
    {
      'LOCAL':             string,
      'MODELO SUGERIDO':   string,
      'JUSTIFICATIVA':     string,
      'SETOR':             string
    }
  ]
}
```

### Estrutura `floors[]` — dados do editor de plantas

É o dado central do editor. Persistido em `ibmp_autosave`.

```javascript
floors = [
  {
    id:        number,          // Date.now() + random — identificador único
    name:      string,          // nome exibido na aba
    image:     HTMLImageElement|null,
    imgB64:    string|null,     // imagem em base64 para serialização
    cameras:   Cam[],           // câmeras plotadas nesta planta
    riskZones: RiskZone[],      // zonas de risco SST
    scale:     number|null,     // escala do canvas
    panX:      number,
    panY:      number,
    zoom:      number
  }
]
let activeFloor = 0;            // índice da planta ativa
const F = () => floors[activeFloor]; // acesso à planta atual — usado em toda a aplicação
```

`mkFloor(name)` — factory que cria um objeto de planta com valores padrão.

### Classe `Cam` — câmera plotada

```javascript
class Cam {
  constructor(id, name, x, y) {
    this.id   = id;
    this.name = name;   // igual a DB.cameras[n]['NOME CANAL'] — elo com o banco
    this.x    = x;
    this.y    = y;
    this.rot  = 0;      // rotação em graus
    this.fov  = 90;     // ângulo de visão
    this.ir   = 60;     // alcance infravermelho
    this.sel  = false;
    this.info = lookup(name); // resolve dados do DB na construção
  }
  // this.fn    = isFn(this.name)   — calculado em E.render()
  // this.rec   = true|false        — câmera recomendada (expansão)
}
```

**Elo crítico:** `cam.info = lookup(cam.name)` — é o que conecta a câmera plotada no canvas ao `DB.cameras`. `lookup()` retorna `{gravador, modelo, serial, ip, setor, parecer, criticidade}`. Se `name` não existe no DB, `lookup()` retorna um objeto com campos vazios mas não lança erro.

### Dados auxiliares (em memória + localStorage)

| Variável | Chave localStorage | Conteúdo |
|----------|-------------------|----------|
| `INSTALL_YEAR` | `ibmp_inventory` | `{nomeCam: anoInstalacao}` |
| `CAM_FIN` | `ibmp_inventory` | `{nomeCam: {valor, vidaUtil, dataInstalacao, garantia}}` |
| `CAM_OBS` | `ibmp_inventory` | `{nomeCam: textoObservacao}` — legado, migrado para `CAM_LOG` |
| `CAM_LOG` | `CAM_LOG` | `{nomeCam: [{id, date, text, type}]}` — tipos: `info`, `manutencao`, `incidente`, `resolvido` |
| `PRICES` | — (embutido no HTML) | `{modelo: valorEquipamentoReais}` |
| `LABOR` | — (embutido no HTML) | `{modelo: custoMaoDeObraReais}` — usado em Orçamento e relatórios |
| `LIFESPAN` | — (embutido no HTML) | `{modelo: anosVidaUtil}` |

---

## Motor do editor — `const E`

`E` é um objeto literal (não uma classe) que centraliza todo o estado e a lógica do canvas:

```javascript
const E = {
  c:    null,    // elemento <canvas>
  ctx:  null,    // CanvasRenderingContext2D
  tool: 'select',// modo atual: 'select' | 'cam' | 'erase' | 'zone'
  sel:  null,    // câmera Cam selecionada no momento (ou null)
  // ...demais propriedades internas (pan, zoom, drag state, etc.)

  init()     // inicializa canvas, eventos de mouse/touch
  render()   // redesenha tudo: imagem de fundo, câmeras, FOV, zonas, seleção
  doSel(cam) // seleciona câmera: atualiza E.sel e chama showInfo(cam)
}
```

`E.render()` é chamado em toda operação que muda o estado visual. Atualiza `cam.fn = isFn(cam.name)` em cada frame para refletir alterações no banco.

---

## Estrutura de abas (modos)

```
_mode  →  view-overlay visível  →  função render
────────────────────────────────────────────────────
'editor'    →  (canvas)         →  E.render()
'dash'      →  view-dash        →  renderDash()
'manut'     →  view-manut       →  renderManut()      ← v0.8
'monitor'   →  view-monitor     →  renderMonitor()
'budget'    →  view-budget      →  renderBudget()
'coverage'  →  view-coverage    →  renderCoverage()
'timeline'  →  view-timeline    →  renderTimeline()
```

`VIEW_ORDER = ['dash','manut','budget','coverage','timeline']` — ordem das pills de navegação entre views.

> **Nota:** `'editor'` e `'monitor'` não integram `VIEW_ORDER` — são acessados via botão dedicado no header, não pelas pills ← →.

`setMode(m)` — alterna o modo: ativa o overlay correto, chama o render correspondente, gerencia visibilidade do painel direito e do canvas.

---

## Funções-chave

### Funções de renderização de views

| Função | View | Descrição |
|--------|------|-----------|
| `renderDash()` | Dashboard | KPIs globais, gráficos donut e barras, cobertura por planta |
| `renderManut()` | Manutenção | Inoperantes por criticidade, substituições urgentes, expansões (v0.8) |
| `renderMonitor()` | Monitor | Grade de câmeras com thumb de status e busca rápida |
| `renderBudget()` | Orçamento | Custo de substituição (equipamento + mão de obra) das câmeras inativas |
| `renderCoverage()` | Cobertura | Detalhamento dos gravadores: câmeras por canal, % operacional |
| `renderTimeline()` | Timeline | Horizonte de substituição por categoria gerencial (Urgente/Planejamento/Longo Prazo) |

Todas são invocadas por `setMode(m)` ao trocar de aba e leem diretamente de `DB` e `floors[]`.

---

### Editor e dados de plantas

| Função | Descrição |
|--------|-----------|
| `const F = () => floors[activeFloor]` | Acesso à planta ativa — usada em toda função de render |
| `allCams()` | `floors.flatMap(f => f.cameras)` — todas as câmeras de todas as plantas |
| `mkFloor(name)` | Cria objeto de planta com valores padrão |
| `capturePlantImg(fl, showRec)` | Renderiza a planta `fl` em um canvas offscreen e retorna JPEG base64; `showRec=true` inclui câmeras recomendadas em laranja — usado em todos os relatórios que incluem imagem de planta |
| `saveFileAs(blob, suggestedName)` | Cria URL de objeto, abre nova janela, aguarda `postMessage('ready-to-print')` do filho e dispara `window.print()` — padrão único para geração de todos os PDFs |

### Banco de dados e consultas

| Função | Descrição |
|--------|-----------|
| `lookup(nome)` | Resolve nome de câmera → `{gravador, modelo, serial, ip, setor, parecer, criticidade}` cruzando `DB.cameras`, `DB.recorders` e `DB.pareceres` |
| `isFn(nome)` | Retorna `true` se câmera está funcional (parecer não contém "não") |
| `_camBrand(modelo)` | Infere fabricante de câmera pelo prefixo do modelo |
| `_recBrand(modelo)` | Infere fabricante de gravador pelo prefixo do modelo |
| `calcFinancial(nome)` | Calcula valor atual, % vida consumida e ano de troca recomendado com base em `INSTALL_YEAR`, `LIFESPAN` e `PRICES` |

### Criticidade (v0.8)

| Função/Constante | Descrição |
|-----------------|-----------|
| `_CRIT_COLOR` | `{ALTA:'#dc2626', MÉDIA:'#d97706', BAIXA:'#16a34a'}` |
| `_CRIT_BG` | Fundos correspondentes para cada criticidade |
| `_applyCritStyle(sel)` | Aplica cor ao `<select>` de criticidade no painel |
| `saveCriticidade(val)` | Persiste no `DB.cameras`, atualiza `E.sel.info`, salva no localStorage |

### Vida Útil — Categorias Gerenciais (v0.8)

Cálculo central (usado em `renderTimeline()` e `exportPDF()`):

```javascript
const _mesesAte = c => c.trocaYear != null
  ? (c.trocaYear - currentYear) * 12 - _mes + 1
  : null;

// Categorias:
// m <= 12          → Urgente      (vermelho)
// 12 < m <= 24     → Planejamento (âmbar)
// m > 24           → Longo Prazo  (verde)
```

### Persistência

| Função | Descrição |
|--------|-----------|
| `saveLocalInventory()` | Serializa `DB` + auxiliares (`INSTALL_YEAR`, `CAM_FIN`, `CAM_OBS`) em `ibmp_inventory` |
| `loadLocalInventory()` | Carrega banco; aplica `CRITICIDADE='MÉDIA'` em registros sem o campo |
| `scheduleAutoSave()` | Debounce 3s — persiste plants + câmeras + DB em `ibmp_autosave` |
| `saveToCloud()` | Salva backup em `ibmp_projeto_bkp` (localStorage), depois envia `projeto.json` ao GitHub via API REST (PUT com token do usuário) |
| `buildProjectJSON()` | Serializa `floors` (com imagens em base64), `CAM_LOG` e inventário em um objeto JSON para `projeto.json` |

### Relatórios

| Função | Relatório gerado |
|--------|-----------------|
| `exportPDF(selectedFloors)` | Relatório Técnico — timbrado, plantas via `capturePlantImg()`, inativas, **Matriz de Criticidade** |
| `exportExecutivo(selectedFloors)` | Relatório Executivo — 1 página, KPIs, mapa, **breakdown criticidade** |
| `exportGravadores()` | **Relatório de Gravadores** (v0.8) — ranking + cards por gravador |
| `printList()` | Lista de Inventário — tabela A4 paisagem com coluna Criticidade |
| `printFloorMap()` | Planta em resolução original com câmeras plotadas |
| `doExportCSV(escopo, formato)` | Planilha XLSX/CSV com coluna Criticidade |

Todos usam `saveFileAs(blob, filename)` para abrir o PDF em nova janela.

### Dashboard de Manutenção (v0.8)

`renderManut()` computa, a partir de `DB.cameras`:
- `inop` — câmeras onde `!isFn(nome)`
- `inopAlta/Media/Baixa` — inoperantes por criticidade
- `subst12` — câmeras com `_mesesAte(nome) <= 12`
- `recList` — `DB.recommended`

---

## Fluxo de import XLSX

```
Arquivo .xlsx
    ↓ FileReader → Uint8Array
    ↓ XLSX.read() (SheetJS CDN)
    ↓ findSheet() — detecta aba por nome normalizado (aceita variações de acento)
    ↓ sheet_to_json()
    ↓ Mapeamento de campos (nomes flexíveis + fallbacks)
    ↓ DB.cameras  → CRITICIDADE mapeado de CRITICIDADE|Criticidade|PRIORIDADE (default 'MÉDIA')
    ↓ DB.recorders, DB.pareceres, DB.recommended
    ↓ INSTALL_YEAR, CAM_FIN, PRICES, LIFESPAN, LABOR
    ↓ loadLocalInventory() → normaliza CRITICIDADE ausente → 'MÉDIA'
    ↓ saveLocalInventory() → persiste em ibmp_inventory
```

---

## Fluxo de geração de PDF

```
exportPDF() / exportExecutivo() / exportGravadores() / printList() / printFloorMap()
    ↓ Coleta dados do DB e das plantas selecionadas
    ↓ capturePlantImg(fl, showRec) → JPEG base64 (para relatórios com planta)
    ↓ Monta string HTML com CSS inline (TIMBRADO_B64 como <img> base64)
    ↓ new Blob([html], {type:'text/html'})
    ↓ saveFileAs(blob, filename)
         ↓ URL.createObjectURL(blob)
         ↓ window.open(url) → nova janela
         ↓ aguarda postMessage('ready-to-print') do filho
         ↓ window.print() na janela filha
    ↓ Usuário usa Ctrl+P → "Salvar como PDF"
```

---

## Fluxo de salvamento no GitHub

```
saveToCloud()
    ↓ buildProjectJSON() → objeto com floors (base64), CAM_LOG, inventário
    ↓ localStorage.setItem('ibmp_projeto_bkp', JSON) — backup local
    ↓ getGhConfig() → {token, user, repo} (configurado pelo usuário)
    ↓ fetch('https://api.github.com/repos/{user}/{repo}/contents/projeto.json', {
         method: 'PUT',
         headers: { Authorization: 'token {token}' },
         body: { message, content: btoa(JSON), sha: sha_atual }
       })
    ↓ GitHub Pages serve o projeto.json atualizado
    ↓ Próxima abertura: fetch('projeto.json') → autoload
```

---

## Autenticação

```javascript
crypto.subtle.digest('SHA-256', encoded)
    ↓ hash hex comparado com hash hardcoded no código
    ↓ sessionStorage.setItem('auth', 'ok')
    ↓ sessão dura até fechar a aba
```

---

## PWA / Offline

- `sw.js` faz cache de todos os assets na instalação
- Atualização: incrementar `CACHE_NAME` no `sw.js`
- SheetJS (import XLSX) requer internet — único ponto sem suporte offline completo
- `projeto.json` é servido pelo GitHub Pages e cacheado pelo Service Worker após o primeiro carregamento
