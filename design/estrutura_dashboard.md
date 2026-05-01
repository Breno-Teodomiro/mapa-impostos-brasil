# Estrutura do Dashboard — Mapa de Impostos

## Configurações Globais

**Resolução:** 1280 × 720 px (padrão widescreen 16:9)
**Tema:** importar `tema_mapa_impostos.json`
**Fonte global:** Segoe UI
**Fundo de página:** #0f0f1a (configurar em: Formatar Página → Plano de Fundo → cor personalizada)

---

## Barra de Navegação (componente fixo — repetir em todas as páginas)

**Posição:** Topo, altura 44px, largura 100%
**Fundo da barra:** retângulo #1a1a2e com borda inferior #2D2D44

```
┌──────────────────────────────────────────────────────────────────┐
│  💡 MAPA DE IMPOSTOS    [Impacto] [Tributação] [Cascata] [Social] [Simulação]  │
└──────────────────────────────────────────────────────────────────┘
```

**Implementação dos botões de navegação:**
- Inserir → Botão → Espaço em branco
- Preencher texto (Segoe UI 11px, cor #94A3B8, hover: #ECEFF4)
- Fundo: transparente / hover: #2D2D44
- Ação: Marcador → selecionar o bookmark correspondente
- Criar os bookmarks ANTES dos botões para poder vinculá-los

**Bookmarks a criar** (Exibição → Marcadores → Adicionar):
| Nome do bookmark | Página de destino |
|-----------------|-------------------|
| BM_Impacto | Página 1 — Visão de Impacto |
| BM_Tributacao | Página 2 — Tributação |
| BM_Cascata | Página 3 — Cascata por Consumo |
| BM_Social | Página 4 — Comparativo Social |
| BM_Simulacao | Página 5 — Simulação |

---

## Página 1 — Visão de Impacto (Hero Page)

**Objetivo:** chocar na primeira olhada. O número "46%" precisa ser a primeira coisa vista.

```
┌──── BARRA DE NAV (44px) ──────────────────────────────────────────┐
│                                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  46,1%      │  │  R$ 4.436   │  │  - R$ 620   │  │ TOP 10% │ │
│  │ da renda    │  │ em impostos │  │  déficit/mês │  │ Brasil  │ │
│  │ é imposto   │  │   /mês      │  │             │  │         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                                    │
│  ┌─── VISUAL SANKEY CUSTOMIZADO ────────────────────────────────┐ │
│  │                                                              │ │
│  │  Renda Bruta → INSS / IRPF / Renda Líquida                 │ │
│  │  Renda Líquida → Categorias → Impostos Embutidos           │ │
│  │  (ocupa ~85% da altura restante da página)                  │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

**Visuais desta página:**

| Visual | Medida DAX | Formato |
|--------|-----------|---------|
| Card — Carga % | `Carga_Efetiva_Sobre_Renda_Bruta_Pct` | "#0,0%", vermelho se >40 |
| Card — Valor total | `Carga_Total_Tributos` | "R$ #.##0", vermelho |
| Card — Déficit | `Resultado_Final` | "R$ #.##0", vermelho se <0 |
| Card — Percentil | `Percentil_Brasil_Estimado` | texto |
| Sankey customizado | `Fluxo_Sankey` (tabela) | visual importado |

**Formatação condicional dos cards:**
- Regra: se valor < 0 → fonte #E74C3C; se > 0 → fonte #27AE60

---

## Página 2 — Tributação Direta vs Indireta

**Objetivo:** Decompor os R$4.436 por tipo e esfera governamental.

```
┌──── BARRA DE NAV ─────────────────────────────────────────────────┐
│                                                                    │
│  ┌── Título ────────────────────────────────────────────────────┐ │
│  │  "Onde vai cada Real de imposto que você paga?"             │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌── Rosca (Donut) ──────┐  ┌── Barra empilhada 100% ─────────┐  │
│  │                       │  │                                  │  │
│  │  Direto  19%  (verm.) │  │  Federal   Estadual  Municipal  │  │
│  │  Indireto 23% (laran.)│  │  por tipo de imposto            │  │
│  │  Patrimonial 4% (roxo)│  │                                  │  │
│  │                       │  │                                  │  │
│  └───────────────────────┘  └──────────────────────────────────┘  │
│                                                                    │
│  ┌── Tabela detalhada ──────────────────────────────────────────┐  │
│  │  Tributo | Tipo | Esfera | Valor R$ | % Renda Bruta         │  │
│  │  INSS    | Dir. | Fed.   | R$1.028  | 10,7%                 │  │
│  │  IRPF    | Dir. | Fed.   | R$  823  |  8,5%                 │  │
│  │  Alim.   | Ind. | Mix    | R$  416  |  4,3%  ...            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

**Visuais desta página:**

| Visual | Tipo PBI | Campos |
|--------|----------|--------|
| Rosca | Gráfico de Rosca | Legenda: `tipo` / Valores: medida de carga por tipo |
| Barra 100% empilhada | Barra 100% | Eixo: tipo / Legenda: esfera / Valores: valor |
| Tabela | Tabela | tributo, tipo, esfera, valor, pct_renda |

**Medidas auxiliares para a Página 2:**
```dax
-- Criar como medidas na tabela fato_gastos_mensais ou medidas gerais

Carga_Federal =
    [INSS_Total_Familia] + [IRPF_Total_Familia] +
    [Imposto_Indireto_Federal]

Carga_Estadual =
    [Total_Patrimonial] * 0.73 +  -- IPVA + Licenciamento
    [Imposto_Indireto_Estadual]

Carga_Municipal =
    [Total_Patrimonial] * 0.27 +  -- IPTU
    [Imposto_Indireto_Municipal]
```

---

## Página 3 — Cascata por Categoria de Consumo

**Objetivo:** Mostrar quanto de cada R$1 gasto em cada categoria é imposto embutido.

```
┌──── BARRA DE NAV ─────────────────────────────────────────────────┐
│                                                                    │
│  ┌── Barra horizontal empilhada (Custo Real vs Imposto) ────────┐ │
│  │                                                              │ │
│  │  Combustível  ████████████░░░░ 43% imposto                  │ │
│  │  Energia      ██████████░░░░░░ 44% imposto                  │ │
│  │  Vestuário    █████████░░░░░░░ 35% imposto                  │ │
│  │  Alimentação  ███████░░░░░░░░░ 26% imposto                  │ │
│  │  ...                                                        │ │
│  │  (Barras: azul=custo real / laranja=imposto)                │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌── Seletor de categoria ──┐  ┌── Detalhe etapas cadeia ──────┐  │
│  │  [lista/slicer]          │  │  Matéria Prima  R$ XX          │  │
│  │  Alimentação ✓           │  │  Indústria      R$ XX          │  │
│  │  Combustível             │  │  Distribuição   R$ XX          │  │
│  │  Energia                 │  │  Varejo         R$ XX          │  │
│  │  ...                     │  │  Logística      R$ XX          │  │
│  └──────────────────────────┘  └────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

**Visuais desta página:**

| Visual | Tipo PBI | Campos |
|--------|----------|--------|
| Barra Horiz. Empilhada | Barra empilhada | Eixo: categoria / Séries: custo_real, imposto_embutido |
| Slicer categoria | Slicer lista | Campo: categoria de `dim_categorias` |
| Detalhe cascata | Barra simples | Eixo: etapa da cadeia / Valores: imposto por etapa |

**Drill-through:**
- Clicar com botão direito em qualquer barra → "Drill-through: Detalhe da Categoria"
- Página drill `Pag_Drill_Categoria`:
  - Título dinâmico: `SELECTEDVALUE(dim_categorias[categoria])`
  - Barras: imposto por etapa (ind./dist./varejo/log.)
  - Tabela: tributos presentes naquela categoria
  - Card: custo real vs imposto em R$ e %
  - Botão "Voltar" (Inserir → Botão → Voltar)

---

## Página 4 — Comparativo Socioeconômico

**Objetivo:** Revelar o paradoxo — família rica em termos relativos, mas sem folga financeira.

```
┌──── BARRA DE NAV ─────────────────────────────────────────────────┐
│                                                                    │
│  ┌── Headline ──────────────────────────────────────────────────┐ │
│  │  "Top 10% do Brasil. Renda negativa no fim do mês."         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌── KPIs Percentil ──────────────────────────────────────────┐   │
│  │  Brasil: TOP 10%  |  Nordeste: TOP 5%  |  Piauí: TOP 3%   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌── Gauge: comprometimento ──┐  ┌── Card narrativo ────────────┐  │
│  │                            │  │                              │  │
│  │   [░░░░░░░░░░]  103%       │  │  "Para cada R$100 que a     │  │
│  │  comprometimento           │  │   família recebe líquido,   │  │
│  │  da renda líquida          │  │   gasta R$103 em obrigações" │  │
│  │                            │  │                              │  │
│  └────────────────────────────┘  └──────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

**Visuais desta página:**

| Visual | Tipo PBI | Campos |
|--------|----------|--------|
| Caixa de texto (headline) | Caixa de texto | estático, fonte 20px bold branco |
| Cards percentil | Card (×3) | Medidas `Percentil_Brasil_Estimado` etc. |
| Medidor gauge | Medidor | Valor: `Comprometimento_Renda_Liquida_Pct`, Max: 150 |
| Card narrativo | Caixa de texto | texto com fonte 13px, cor #94A3B8 |

---

## Página 5 — Simulação

**Objetivo:** Permitir que o usuário explore o impacto de diferentes rendas.

```
┌──── BARRA DE NAV ─────────────────────────────────────────────────┐
│                                                                    │
│  ┌── Sliders (What-If Parameters) ─────────────────────────────┐  │
│  │  Salário Marido:  ──────●────────  R$ 7.280                 │  │
│  │  Salário Esposa:  ──●──────────── R$ 2.350                  │  │
│  │  Dependentes:     ●───────────── 1                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌── KPIs recalculados ────────────────────────────────────────┐   │
│  │  Renda bruta | INSS | IRPF | Renda líquida | Carga% | Saldo│   │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌── Sankey (mesmo visual, dados recalculados) ─────────────────┐  │
│  │                                                              │  │
│  │  (O visual Sankey deve estar conectado à Fluxo_Sankey        │  │
│  │   que usa as medidas com os parâmetros What-If)              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

> **Importante:** Para o Sankey reagir aos parâmetros, a tabela calculada `Fluxo_Sankey`
> deve referenciar as medidas `[Salario_Marido_Param Value]` etc., não valores fixos.
> A tabela calculada em DAX **não** recalcula com slicers — use uma **tabela de medidas** 
> ou estruture o visual Sankey para ler medidas individualmente (alternativa: criar 
> medidas de contexto e usar um visual nativo de barra empilhada na Página 5 como
> substituto do Sankey para a simulação).

---

## Tooltip Pages (Páginas de Dica de Ferramenta)

Para criar: Nova Página → Formatar Página → Tipo de Página = "Dica de Ferramenta"

### TT_Tributacao_Direta
**Vinculada a:** Cards de INSS e IRPF (Página 1 e 2)
**Conteúdo:**
- Tabela de faixas INSS 2024 com linha atual destacada
- KPI: "Sua alíquota efetiva de INSS: X%"
- Texto: "A alíquota nominal é 14%, mas a progressividade reduz para X% sobre o total"

### TT_Imposto_Categoria
**Vinculada a:** Barras da Página 3 (Cascata por Categoria)
**Conteúdo:**
- Mini-barra: Federal / Estadual / Municipal para a categoria selecionada
- Texto: "Tributos presentes: ICMS, PIS, COFINS, INSS Patronal..."
- Card: "R$ XX de cada R$100 gastos aqui são impostos"

### TT_Combustivel_Detalhe
**Vinculada a:** Barra ou card de Combustível especificamente
**Conteúdo:**
- Breakdown por litro: CIDE R$0,52 + ICMS R$1,68 + PIS/COFINS R$0,53 = R$2,73/L
- Card: "43% do que você paga no posto é imposto"
- Mini-gráfico de cascata (Indústria → Distribuidora → Posto → Você)

### TT_Deficit
**Vinculada a:** Card de Déficit (Página 1)
**Conteúdo:**
- Waterfall simples: Renda Líquida → −Gastos → −Patrimonial → Saldo
- Texto explicativo do déficit

---

## Sequência de Implementação Recomendada

1. **Importar tema JSON** → visual imediatamente transformado
2. **Criar páginas (5 + drill + 4 tooltips)** → estrutura completa
3. **Importar CSVs** → modelo de dados
4. **Criar parâmetros What-If** → sliders da Página 5
5. **Copiar medidas DAX** → cálculos
6. **Criar tabela Fluxo_Sankey** → alimenta o Sankey
7. **Buildar e importar o .pbiviz** → visual Sankey customizado
8. **Configurar bookmarks** → navegação
9. **Configurar drill-through** → Página 3
10. **Configurar tooltip pages** → hover experience
