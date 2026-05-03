# Sprints — Mapa de Impostos Familiar

## Convenções

- Cada sprint termina com **commit** e **atualização de memória**
- Critério de aceitação deve ser validado ANTES do commit
- Status: `[ ]` pendente · `[x]` completo · `[~]` em andamento · `[!]` bloqueado

---

## Sprint 0 — Fundação do Projeto ✅

**Objetivo:** Repositório, estrutura e ambiente configurados.

**Critério de aceitação:**
- [ ] `git init` executado e primeiro commit realizado
- [ ] `.gitignore` cobrindo node_modules, .pbix, .tmp
- [ ] `.claude/settings.json` com allowlist de comandos frequentes
- [ ] Estrutura de pastas completa e confirmada
- [ ] GitHub remote configurado (push sem erro)

**Entregáveis já criados:**
- `dados/` — 6 CSVs do modelo dimensional
- `dax/medidas_completas.md` — todas as medidas prontas
- `tema_mapa_impostos.json` — theme Dark Premium
- `design/estrutura_dashboard.md` — wireframes e UX completo
- `visual_sankey/` — projeto pbiviz completo (React + D3)
- `CLAUDE.md`, `SPRINTS.md`, `.gitignore`, `.claude/settings.json`

**Commit:** `chore: setup inicial — modelo de dados, DAX, tema e visual Sankey`

---

## Sprint 1 — Modelo de Dados no Power BI ✅

**Objetivo:** Importar todos os CSVs, validar relacionamentos e confirmar que os dados estão corretos antes de escrever qualquer medida.

**Quality Gate — validar ANTES de avançar:**
- [ ] Abrir cada CSV no Power BI e verificar:
  - `dim_tributos` → 20 linhas, sem valores nulos em `sigla`
  - `dim_categorias` → 18 linhas, `valor_mensal_base` numérico
  - `dim_cadeia_producao` → 6 linhas, `ordem` de 1 a 6
  - `fato_renda_familia` → 3 linhas (Marido, Esposa, Família)
  - `fato_gastos_mensais` → 18 linhas, `imposto_embutido + custo_real = valor_total`
  - `fato_cascata_tributaria` → 18 linhas, cascata por etapa coerente
- [ ] Criar relacionamentos:
  - `dim_categorias[id]` → `fato_gastos_mensais[id_categoria]` (1:N)
  - `dim_categorias[id]` → `fato_cascata_tributaria[id_categoria]` (1:N)
- [ ] Verificação numérica: soma de `fato_gastos_mensais[valor_total]` = R$8.028
- [ ] Criar os 3 parâmetros What-If (conforme seção 1 de `dax/medidas_completas.md`)

**Hotfix aplicado (224f55c):**
- `dim_tributos.csv` e `fato_renda_familia.csv` corrigidos — campos `observacao` com vírgulas agora entre aspas
- `dax/power_query_M_corrigido.md` gerado com código M ajustado (UTF-8 + QuoteStyle + type number)
- ⚠️ Pendente: substituir código M no Power Query Editor para as duas tabelas afetadas

**Entregáveis:**
- `Report_Mapa_Impostos_Brasil.pbix` salvo na pasta do projeto ✅
- Print/screenshot da View de Modelo mostrando os relacionamentos
- Parâmetros What-If funcionando (sliders aparecem no canvas)

**Commit:** `feat(dados): modelo star schema importado e relacionamentos validados`

---

## Sprint 2 — DAX: Renda e Tributação Direta

**Objetivo:** Implementar e validar INSS + IRPF com os valores exatos do PRD.

**Quality Gate — validar contra valores conhecidos:**
| Medida | Valor esperado | Tolerância |
|--------|---------------|-----------|
| `INSS_Marido` | R$ 838,02 | ± R$ 0,10 |
| `INSS_Esposa` | R$ 190,32 | ± R$ 0,10 |
| `INSS_Total_Familia` | R$ 1.028,34 | ± R$ 0,20 |
| `IRPF_Marido` | R$ 823,41 | ± R$ 0,10 |
| `IRPF_Esposa` | R$ 0,00 | exato |
| `Renda_Liquida_Total` | R$ 7.778,25 | ± R$ 0,50 |
| `Aliq_Efetiva_Direta_Pct` | 19,23% | ± 0,1% |

- [ ] Criar cartão simples para cada medida e confirmar os valores acima
- [ ] Testar parâmetro: alterar salário do marido para R$5.000 → INSS recalcula corretamente
- [ ] Testar parâmetro: alterar nº dependentes para 2 → IRPF reduz

**Entregáveis:**
- Página temporária "Validação DAX" com os cartões dos valores acima (pode deletar depois)

**Commit:** `feat(dax): medidas de INSS e IRPF validadas contra valores do PRD`

---

## Sprint 3 — DAX: Consumo, Cascata e Carga Total

**Objetivo:** Implementar medidas de gastos, impostos indiretos e patrimoniais, e calcular a carga tributária total efetiva.

**Quality Gate — validar:**
| Medida | Valor esperado |
|--------|---------------|
| `Total_Gastos_Mensais` | R$ 8.028,00 |
| `Total_Imposto_Indireto_Embutido` | R$ 2.215,30 (aprox.) |
| `Total_Patrimonial` | R$ 370,00 |
| `Carga_Total_Tributos` | ~R$ 4.436,00 |
| `Carga_Efetiva_Sobre_Renda_Bruta_Pct` | ~46,1% |
| `Resultado_Final` | ~−R$ 620,00 |

- [ ] Valores dentro da tolerância (±R$5 em totais)
- [ ] `Pct_Carga_Direta + Pct_Carga_Indireta + Pct_Carga_Patrimon` ≈ 46%
- [ ] `Percentil_Brasil_Estimado` retorna "Top 10%" para R$9.630

**Commit:** `feat(dax): medidas de consumo, cascata e carga tributária total`

---

## Sprint 4 — Tabela Fluxo_Sankey

**Objetivo:** Criar a tabela calculada DAX que alimenta o visual Sankey.

**Quality Gate:**
- [ ] Tabela `Fluxo_Sankey` criada com 5 colunas: `fonte`, `destino`, `valor`, `tipo`, `esfera`
- [ ] Contagem de linhas: pelo menos 30 linhas
- [ ] Sem erros de DAX ao criar a tabela
- [ ] Soma de todos os fluxos saindo de "Renda Bruta" = R$9.630 (± R$1)
- [ ] Verificar: `fonte = "Renda Bruta"` → 3 linhas (INSS, IRPF, Renda Líquida)
- [ ] Verificar: linhas com `tipo = "Indireto"` ≥ 10

**Commit:** `feat(dax): tabela calculada Fluxo_Sankey para visual customizado`

---

## Sprint 5 — Build e Integração do Visual Sankey

**Objetivo:** Compilar o pbiviz, importar no Power BI e conectar à tabela `Fluxo_Sankey`.

**Passos:**
```bash
cd visual_sankey
npm install          # instalar dependências
npm run build        # gerar dist/mapaImpostosSankey.pbiviz
```

**Quality Gate:**
- [ ] `npm install` sem erros críticos
- [ ] `npm run build` gera o arquivo `.pbiviz` em `dist/`
- [ ] Importar `.pbiviz` no Power BI Desktop (Inserir → Mais visuais → Importar)
- [ ] Visual aparece no painel de visuais sem erro
- [ ] Arrastar para o canvas → renderiza o diagrama Sankey com dados padrão (PRD)
- [ ] Conectar a tabela `Fluxo_Sankey`: Fonte → destino → Valor → Tipo → Esfera
- [ ] Sankey exibe o fluxo correto com as cores do tema (vermelho/laranja/roxo/azul/verde)

**Commit:** `feat(visual): visual Sankey customizado compilado e integrado`

---

## Sprint 6 — Tema e Estrutura de Páginas

**Objetivo:** Aplicar o tema Dark Premium e criar toda a estrutura de páginas antes de populá-las.

**Passos:**
1. Importar `tema_mapa_impostos.json` (Exibição → Temas → Procurar)
2. Criar as páginas (renomear conforme abaixo)
3. Configurar fundo de página: Formatar → Plano de Fundo → `#0f0f1a`
4. Criar bookmarks (Exibição → Marcadores → Adicionar)
5. Criar barra de navegação fixa (retângulo + 5 botões)

**Estrutura de páginas a criar:**
| Nome da aba | Tipo | Uso |
|-------------|------|-----|
| `01_Impacto` | Normal | Hero page |
| `02_Tributacao` | Normal | Direto vs Indireto |
| `03_Cascata` | Normal | Cascata por categoria |
| `03_Drill_Categoria` | Normal | Drill-through detalhe |
| `04_Social` | Normal | Comparativo socioeconômico |
| `05_Simulacao` | Normal | Simulação paramétrica |
| `TT_Tributacao` | Dica de ferramenta | Tooltip INSS/IRPF |
| `TT_Categoria` | Dica de ferramenta | Tooltip categorias de gasto |
| `TT_Deficit` | Dica de ferramenta | Tooltip déficit |

**Quality Gate:**
- [ ] Tema importado → visuais de teste estão no fundo escuro
- [ ] 9 páginas criadas com os nomes corretos
- [ ] Bookmarks criados: BM_Impacto, BM_Tributacao, BM_Cascata, BM_Social, BM_Simulacao
- [ ] Barra de navegação em todas as páginas normais com botões funcionando
- [ ] Fundo `#0f0f1a` em todas as páginas normais

**Commit:** `feat(layout): tema Dark Premium, estrutura de páginas e navegação por bookmarks`

---

## Sprint 7 — Página 01_Impacto (Hero Page)

**Objetivo:** Construir a página principal que choca na primeira olhada.

**Layout a implementar (conforme `design/estrutura_dashboard.md`):**
- 4 KPI Cards (carga %, valor absoluto, déficit, percentil)
- Visual Sankey (ocupa ~85% da altura)

**Quality Gate:**
- [ ] KPI "Carga %" exibe 46,1% em vermelho (formatação condicional)
- [ ] KPI "Déficit" exibe −R$ 620 em vermelho
- [ ] Sankey conectado e exibindo fluxo correto com todas as categorias
- [ ] Barra de navegação presente e funcional
- [ ] Revisar em modo Apresentação (F5) — visual sem cortes ou sobreposições
- [ ] Screenshot salvo em `design/screenshots/01_impacto.png`

**Commit:** `feat(pag1): página hero com KPIs e Sankey`

---

## Sprint 8 — Página 02_Tributacao

**Objetivo:** Decompor os impostos por tipo e esfera governamental.

**Visuais a construir:**
- Gráfico de Rosca (donut) — distribuição por tipo
- Barra 100% empilhada — Federal/Estadual/Municipal por tipo
- Tabela detalhada — tributo, tipo, esfera, valor, % renda

**Quality Gate:**
- [ ] Rosca exibe 3 fatias: Direto (~19%), Indireto (~23%), Patrimonial (~4%)
- [ ] Barras 100% mostram Federal dominando no total
- [ ] Tabela com formatação alternada e total em rodapé
- [ ] Tooltip TT_Tributacao vinculado aos cards de INSS/IRPF
- [ ] Screenshot salvo em `design/screenshots/02_tributacao.png`

**Commit:** `feat(pag2): tributação direta vs indireta`

---

## Sprint 9 — Página 03_Cascata + Drill-through

**Objetivo:** Mostrar o imposto embutido por categoria e a cascata da cadeia produtiva.

**Visuais a construir:**
- Barra horizontal empilhada (custo real vs imposto embutido)
- Slicer de categoria
- Barra de etapas da cadeia (detalhe da categoria selecionada)
- Página de drill-through `03_Drill_Categoria`
- Tooltip TT_Categoria

**Quality Gate:**
- [ ] Barra mostra Combustível e Energia com as maiores % de imposto (~43-44%)
- [ ] Selecionando "Alimentação" → detalhe mostra as etapas Indústria/Dist./Varejo
- [ ] Drill-through funciona: clique com botão direito → "Detalhe da Categoria" → abre página correta
- [ ] Botão "Voltar" na página de drill funciona
- [ ] Tooltip aparece ao passar mouse na barra
- [ ] Screenshot salvo em `design/screenshots/03_cascata.png`

**Commit:** `feat(pag3): cascata por categoria com drill-through`

---

## Sprint 10 — Páginas 04_Social e 05_Simulacao ✅ 2026-05-02

**Objetivo:** Contexto socioeconômico e simulação paramétrica.

**Implementado:**
- `HTML_Social_Hero` — headline impactante, 3 cards de posição (Brasil/Nordeste/Piauí), gauge renda vs gastos, 3 facts (déficit/carga/meses)
- `HTML_Simulacao_Hero` — 4 input cards (salários/dependentes/total bruto), barra waterfall por tipo de tributo, tabela breakdown + resultado colorido; reativo aos parâmetros What-If

**Quality Gate — Página 4:**
- [x] KPIs de percentil exibem: Brasil Top 10%, Nordeste Top 5%, Piauí Top 3%
- [x] Gauge de comprometimento proporcional (verde renda / vermelho gastos)
- [x] Headline "Top 10% do Brasil. Renda negativa no fim do mes." legível
- [ ] Screenshot salvo em `design/screenshots/04_social.png`

**Quality Gate — Página 5:**
- [x] 4 input cards com valores base (Marido/Esposa/Dependentes/Total)
- [x] Barra waterfall com segmentos coloridos por tipo de tributo
- [x] KPIs recalculam via [Valor Salario_Marido_Param] etc.
- [ ] Screenshot salvo em `design/screenshots/05_simulacao.png`

**Commit:** `feat(sprint10): HTML_Social_Hero e HTML_Simulacao_Hero`

---

## Sprint 11 — Polimento UX Final 🔄 2026-05-03

**Objetivo:** Título, tooltips, drill-through e revisão visual geral.

**Entregues (commits e228167 + fa815ae):**
- `HTML_Navbar_Title` — logo R$ + título em todas as 6 páginas normais
- `HTML_Drill_Categoria` — detalhe por categoria (drill-through da 03_Cascata)
- `HTML_TT_Categoria` — tooltip da página 03_Cascata (imposto embutido por cat.)
- `HTML_TT_Deficit` — tooltip déficit (renda bruta/líquida/comprometida/carga)
- `HTML_TT_Tributacao` — tooltip composição tributária (direto/indireto/patrimonial)
- 10 visual.json criados (6 navbars + 1 drill + 3 tooltips)

**Armadilha TMDL resolvida nesta sprint:**
- VAR/RETURN de medidas multi-linha: **3 tabs** obrigatório (não 2)
- `displayFolder`/`lineageTag`: **2 tabs** (filho do `measure` em 1 tab)
- Desktop DEVE estar FECHADO ao editar TMDL/JSON diretamente

**Checklist pendente:**
- [ ] Configurar drill-through na página 03_Cascata (botão direito → Drill through → 03_Drill_Categoria)
- [ ] Configurar tooltips nos visuais: Format → Tooltip → Type = "Report page"
- [ ] Testar bookmarks de navegação (BM_Impacto → BM_Simulacao)
- [ ] Sliders da Página 5 testados nos extremos (mín/máx)
- [ ] Verificar cores e legibilidade em 1280×720
- [ ] Screenshots finais salvos em `design/screenshots/`

**Commits:** `e228167` (displayFolder 1→2 tabs) · `fa815ae` (VAR 2→3 tabs + drill binding)

---

## Sprint 12 — Publicação e Documentação

**Objetivo:** Publicar no Power BI Service e finalizar documentação.

**Passos:**
1. Arquivo → Publicar → Power BI Service
2. Configurar acesso (compartilhar workspace)
3. Anotar a URL pública do relatório

**Quality Gate:**
- [ ] Relatório publicado e acessível no browser
- [ ] Visual Sankey customizado renderiza no Service (não só no Desktop)
- [ ] URL do relatório anotada no CLAUDE.md
- [ ] README atualizado com instrução de acesso

**Commit:** `deploy: relatório publicado no Power BI Service`

---

## Métricas de Progresso

| Sprint | Status | Data início | Data fim | Commit |
|--------|--------|-------------|----------|--------|
| 0 — Fundação | ✅ | 2026-05-01 | 2026-05-01 | 43014e9 |
| 1 — Dados | ✅ | 2026-05-01 | 2026-05-01 | — |
| 2 — DAX Renda | ✅ | 2026-05-02 | 2026-05-02 | — |
| 3 — DAX Consumo | ✅ | 2026-05-02 | 2026-05-02 | — |
| 4 — Fluxo Sankey | ✅ | 2026-05-02 | 2026-05-02 | — |
| 5 — Build Visual | ✅ | 2026-05-02 | 2026-05-02 | — |
| 6 — Tema/Layout | ✅ | 2026-05-01 | 2026-05-01 | — |
| 7 — Página 1 | ✅ | 2026-05-02 | 2026-05-02 | — |
| 8 — Página 2 | ✅ | 2026-05-02 | 2026-05-02 | — |
| 9 — Página 3 | ✅ | 2026-05-02 | 2026-05-02 | — |
| 10 — Páginas 4+5 | ✅ | 2026-05-02 | 2026-05-02 | — |
| 11 — Polimento | 🔄 | 2026-05-03 | — | fa815ae |
| 12 — Publicação | ⬜ | — | — | — |
