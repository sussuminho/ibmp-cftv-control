# ROADMAP — IBMP CFTV Control

---

## ✅ v0.8 — Gestão Operacional (Junho 2026) — CONCLUÍDA

### Etapa 1 — Vida Útil por Categorias Gerenciais
- [x] Substituição das barras por ano por 3 categorias: Urgente / Planejamento / Longo Prazo
- [x] Cálculo em meses a partir da data atual
- [x] Atualizado na Timeline (app) e no Relatório Técnico (PDF)

### Etapa 2 — Criticidade das Câmeras
- [x] Campo CRITICIDADE: ALTA / MÉDIA / BAIXA (padrão: MÉDIA)
- [x] Select colorido no painel de info da câmera
- [x] Badge "ALTA" na lista lateral
- [x] Filtros por criticidade na barra de filtros
- [x] Coluna Criticidade no export XLSX
- [x] Coluna Criticidade na Lista CFTV (PDF)
- [x] Mapeamento no import XLSX
- [x] Normalização retroativa para bancos sem o campo

### Etapa 3 — Dashboard de Manutenção
- [x] Nova aba independente "Manutenção"
- [x] 4 KPI cards: inoperantes totais, ALTA criticidade, expansões, substituições ≤12m
- [x] Seção: inoperantes agrupados por criticidade (ALTA / MÉDIA / BAIXA)
- [x] Seção: substituições urgentes com prazo em meses
- [x] Seção: expansões recomendadas com preço estimado
- [x] Integrado ao sistema de navegação VIEW_ORDER (pills ← →)

### Etapa 4 — Relatório de Gravadores
- [x] Nova função `exportGravadores()` com timbrado institucional
- [x] Página 1: KPIs globais + ranking de falhas (pior → melhor)
- [x] Página 2: card por gravador com indicadores e barra operacional
- [x] Marca inferida automaticamente do modelo
- [x] Botão no menu Relatórios (desktop e mobile)

### Etapa 5 — Criticidade nos Relatórios
- [x] Relatório Executivo: breakdown ALTA/MÉDIA/BAIXA no KPI "Inoperantes"
- [x] Relatório Executivo: criticidade inline no Sumário de Atenção
- [x] Relatório Técnico: nova seção "Matriz de Criticidade" (tabela com % inoperância)

---

## ✅ Versões anteriores (concluídas)

### v6.5 — Base imediata da v0.8 (Maio 2026)
- Bugs corrigidos da sessão anterior: Fabricante "VIP" no Excel, contagem zero de câmeras nos gravadores, nomes garbled "Bloco OB-01" na Lista, campo Observação ausente no import de gravadores
- Relatório Técnico corrigido: marca+modelo do gravador ao invés do nome dado pelo usuário
- Todas as views verificadas e estáveis antes de iniciar a v0.8

### v6.4 (Maio 2026)
- Impressão de planta: eliminada página em branco no final (page-break-after removido da última planta)
- Navegação entre views: eliminado flash da planta baixa ao trocar de aba (view-overlay via opacity/visibility)

### v6.3 (Maio 2026)
- PDF.js v5.6.205 embutido — importação de planta baixa funciona 100% offline, sem CDN externo
- Câmeras Recomendadas: plotagem com ícone laranja tracejado (?) e banco de exemplos pré-carregado

### v6.2 (Maio 2026)
- Banco de dados embutido com 72 câmeras e 7 gravadores reais do IBMP
- `lookup()` corrigido: parecer cruza canal + gravador (elimina falsos positivos)
- Botão "Imprimir Lista" como linha própria (não cortado em telas menores)

### v6.1 (Maio 2026)
- Autenticação com senha `Ibmp@2026` e sessão por `sessionStorage`
- Autoload de `projeto.json` ao abrir o sistema (GitHub Pages)
- Botão Salvar integrado com GitHub API (PUT) — `saveToCloud()`
- View mobile dedicada com KPIs, busca, filtros e bottom sheet
- Dropdowns de Visualizações e Relatórios no mobile
- Dashboard mobile nativo (sem copiar HTML do desktop)
- Banco de dados importado do Excel com preços por modelo (`PRICES`, `LABOR`)

### v5.0 (2025) — Sistema base
- Plotagem de câmeras em planta baixa no Canvas (motor `E`, classe `Cam`)
- Banco de dados via Excel (3 abas: câmeras, gravadores, pareceres)
- 3 status de câmera: Operante / Manutenção / Inoperante
- Painel lateral com dados técnicos e histórico de logs
- Gestão patrimonial com depreciação linear por modelo
- Zonas de Risco SST no mapa com grau de severidade
- Histórico de ocorrências por câmera (`CAM_LOG`)
- 3 relatórios PDF (Técnico, Executivo, Lista), exportação JSON, autosave
- `printFloorMap()` — impressão da planta com câmeras em qualidade original
- Tema claro/escuro, PWA offline com Service Worker

---

## 🔜 v0.9 — Histórico e Inteligência Operacional (previsão: 2º semestre 2026)

### Etapa 1 — Histórico de Indicadores
- [ ] Snapshot automático ao gerar relatório (data, total, ativas, inativas, taxa)
- [ ] Exibição do histórico na Timeline ou aba dedicada
- [ ] Comparativo mês a mês (delta de câmeras ativas)

### Etapa 2 — Melhorias no Relatório de Gravadores
- [ ] Incluir câmeras inativas listadas por gravador
- [ ] Incluir indicador de criticidade das câmeras por gravador

### Etapa 3 — Filtros avançados no Dashboard de Manutenção
- [ ] Filtrar por bloco/planta
- [ ] Filtrar por gravador
- [ ] Exportar lista filtrada como XLSX

### Etapa 4 — Gestão de Manutenções
- [ ] Registrar data de intervenção em câmeras inativas
- [ ] Marcar câmera como "Em manutenção" (estado intermediário)
- [ ] Calcular MTTR (tempo médio de reparo)

---

## 💡 Backlog (sem versão definida)

- Histórico de snapshots exportável como planilha
- Relatório de Criticidade dedicado (ALTA prioridade)
- Notificação de câmeras próximas do prazo de substituição
- Suporte a múltiplos usuários / controle de acesso por perfil
- Modo offline completo (SheetJS embutido, sem CDN)
- Sincronização multi-dispositivo (requer backend ou GitHub API ampliado)
