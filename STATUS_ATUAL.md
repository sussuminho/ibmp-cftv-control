# STATUS ATUAL — IBMP CFTV Control

**Versão:** v0.8  
**Data:** Junho 2026  
**Responsável:** Luan Hachiguti — Segurança do Trabalho / IBMP  
**Arquivo principal:** `IBMP_CFTV_Control_v6_5.html`  
**Hospedagem:** GitHub Pages (HTTPS automático)

---

## Funcionalidades ativas

### Editor de Plantas
- Importação de planta baixa (PDF via PDF.js embutido, ou imagem)
- Plotagem de câmeras com drag, rotação e FOV ajustável
- Câmeras recomendadas (expansão) em laranja tracejado
- Zonas de risco SST com grau 1–5
- Minimap e zoom por scroll
- Múltiplas plantas (abas)
- `printFloorMap()` — impressão da planta em qualidade original com câmeras plotadas

### Banco de Dados
- Importação via XLSX (SheetJS CDN)
- Abas mapeadas: Câmeras, Gravadores, Parecer, Referência de Preços, Câmeras Recomendadas
- Campos por câmera: Nome, Gravador, Modelo, Canal, Serial, Patrimônio, Status, Observação, **Criticidade**
- Campos por gravador: Nome, Modelo, IP, Tipo, Armazenamento, Localização, Observação
- Persistência em `localStorage` (`ibmp_inventory`)
- Dados auxiliares: `INSTALL_YEAR`, `CAM_FIN`, `CAM_OBS`, `CAM_LOG`
- `PRICES` — tabela de preço de equipamento por modelo (embutida no HTML)
- `LABOR` — tabela de custo de mão de obra por modelo (embutida no HTML); usada no Orçamento e nos relatórios
- `LIFESPAN` — tabela de vida útil em anos por modelo (embutida no HTML); usada em `calcFinancial()` e nas categorias gerenciais de substituição

### Campo Criticidade (v0.8 — Etapa 2)
- Valores: **ALTA** / **MÉDIA** / **BAIXA**
- Padrão: MÉDIA (retrocompatível com bancos sem o campo)
- Select colorido no painel de info da câmera
- Badge vermelho "ALTA" visível na lista lateral
- Filtros por criticidade na barra de filtros
- Exportado na planilha XLSX
- Exibido na Lista CFTV (PDF)
- Mapeado no import XLSX (`CRITICIDADE`, `Criticidade`, `PRIORIDADE`)

### Vida Útil — Categorias Gerenciais (v0.8 — Etapa 1)
- **Urgente** — substituição em até 12 meses
- **Planejamento** — 12 a 24 meses
- **Longo Prazo** — acima de 24 meses
- Exibido na Timeline e no Relatório Técnico

### Sistema de Logs por Câmera
- Cada câmera possui histórico de ocorrências em `CAM_LOG`
- Tipos de log: `info`, `manutencao`, `incidente`, `resolvido`
- Exibidos com cores distintas no painel lateral da câmera
- Filtro **Log** na barra de filtros — mostra apenas câmeras com pelo menos 1 registro
- Badge de contagem de logs visível na lista lateral (número de entradas)
- Entradas antigas em `CAM_OBS` são migradas automaticamente para `CAM_LOG` na primeira abertura

### Abas de Visualização
| Aba | Descrição | Função JS |
|-----|-----------|-----------|
| Editor | Plotagem e edição de plantas | `E.render()` |
| Dashboard | KPIs globais, donut, barras, cobertura por planta | `renderDash()` |
| **Manutenção** (v0.8) | Inoperantes, criticidade ALTA, expansões, substituições ≤12m | `renderManut()` |
| Monitor | Grade de câmeras com status ao vivo | `renderMonitor()` |
| Orçamento | Custo de substituição (equipamento + mão de obra) das câmeras inativas | `renderBudget()` |
| Cobertura | Detalhamento dos gravadores | `renderCoverage()` |
| Timeline | Horizonte de substituição por categoria gerencial | `renderTimeline()` |

### Relatórios disponíveis
| Relatório | Formato | Observações |
|-----------|---------|-------------|
| Relatório Técnico | HTML → PDF | Timbrado; planta + inativas + **Matriz de Criticidade** (v0.8) |
| Relatório Executivo | HTML → PDF | 1 página; KPIs + mapa + **breakdown criticidade inoperantes** (v0.8) |
| **Relatório de Gravadores** (v0.8) | HTML → PDF | Timbrado; KPIs + ranking de falhas + cards por gravador |
| Lista de Inventário | HTML → PDF | Tabela completa A4 paisagem com coluna Criticidade |
| Exportar Planilha | XLSX / CSV | Coluna Criticidade incluída |
| **Imprimir Planta** | HTML → PDF | Planta em resolução original com câmeras plotadas (`printFloorMap()`) |

### Salvamento e Sincronização
- **Autosave local** — projeto salvo automaticamente no `localStorage` (`ibmp_autosave`) a cada edição (debounce 3s)
- **Salvar no GitHub** — `saveToCloud()` envia o `projeto.json` via GitHub API (PUT) usando token configurado pelo usuário; antes de enviar, salva cópia local em `ibmp_projeto_bkp`
- **Autoload** — ao abrir o sistema no GitHub Pages, o app tenta carregar `projeto.json` do repositório automaticamente via `fetch()`; se não encontrado, exibe a tela de boas-vindas
- **Exportar/Importar projeto** — botões para salvar e abrir arquivo `.json` localmente

### Autenticação
- SHA-256 via `crypto.subtle.digest()`
- Senha: `Ibmp@2026` (hash hardcoded)
- Sessão em `sessionStorage` — requer login ao reabrir aba

### Interface Mobile
- Layout mobile dedicado com KPIs, busca e filtros no topo
- Bottom sheet para detalhes da câmera
- Dropdowns de Visualizações e Relatórios adaptados para toque
- Dashboard mobile nativo (não espelha o desktop)

### PWA
- Service Worker (`sw.js`) para uso offline
- Manifest para instalação como app
- Atualização: incrementar `CACHE_NAME` no `sw.js`

---

## Persistência — chaves localStorage

| Chave | Conteúdo |
|-------|----------|
| `ibmp_inventory` | Banco completo: câmeras (com CRITICIDADE), gravadores, pareceres, recomendadas, anos de instalação, dados financeiros, observações |
| `CAM_LOG` | Histórico de logs por câmera: `{camName: [{id, date, text, type}]}` |
| `ibmp_autosave` | Autosave do projeto: plantas, câmeras plotadas, imagens, logs e banco |
| `ibmp_projeto_bkp` | Backup local gerado por `saveToCloud()` antes de enviar ao GitHub |

---

## Limitações conhecidas

- Sem backend — dados ficam no localStorage do navegador (sem sincronização entre dispositivos)
- Export PDF via `window.print()` — qualidade depende do navegador
- Import XLSX requer conexão (SheetJS via CDN) — único ponto sem suporte offline
- Salvamento GitHub requer token pessoal configurado manualmente pelo usuário
- Sem histórico de indicadores automático (previsto para v0.9)
