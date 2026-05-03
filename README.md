# 🗺️ Mapa de Impostos Familiar

> **Dashboard Power BI** que expõe a carga tributária real de uma família brasileira de classe média — incluindo o imposto invisível embutido em cada produto que compramos.

---

## 📌 Tese Central

Uma família no **top 10% de renda do Brasil** (R$ 9.630/mês bruto) paga **~46% de carga tributária efetiva** e termina o mês com **déficit de R$ 620** — mesmo sendo considerada de alta renda.

| Tipo | Valor | % da renda |
|------|-------|-----------|
| Tributação Direta (INSS + IRPF) | R$ 1.851 | 19,2% |
| Tributação Indireta (embutida nos preços) | R$ 2.215 | 23,0% |
| Tributação Patrimonial (IPVA + IPTU + Licenc.) | R$ 370 | 3,8% |
| **Carga Total** | **R$ 4.436** | **46,1%** |

---

## 🏗️ Arquitetura

```
Power BI Desktop (PBIR format)
├── Modelo Semântico (TMDL)
│   ├── Tabelas CSV (star schema)
│   ├── Medidas DAX (INSS, IRPF, carga tributária, Sankey)
│   └── Medidas HTML Content (visuais interativos)
└── Relatório (PBIR JSON)
    ├── 01_Impacto  — KPIs + Sankey + Ticker
    ├── 02_Tributacao — Rosca + Barras F/E/M
    ├── 03_Cascata  — Imposto embutido por categoria
    ├── 04_Social   — Contexto socioeconômico
    ├── 05_Simulacao — What-If paramétrico
    └── Tooltips e Drill-through
```

### Perfil base (PRD)
- **Marido:** R$ 7.280/mês · **Esposa:** R$ 2.350/mês · **1 filho**
- **Cidade:** Teresina-PI
- **Posição:** Top 8–12% da renda nacional

---

## 🎨 Stack Visual

Todos os visuais são implementados via **HTML Content visual** (marketplace) com medidas DAX retornando HTML/CSS/JS:

| Visual | Técnica | Medida DAX |
|--------|---------|-----------|
| KPI Cards | HTML/CSS glassmorphism | `HTML_KPIs_Hero` |
| Ticker CNN | CSS animation | `HTML_Ticker_Hero` |
| Sankey | JS puro + SVG DOM API | `HTML_Sankey_Hero` |
| Rosca tributação | CSS conic-gradient | `HTML_Tributacao_Hero` |
| Barras cascata | CONCATENATEX → HTML | `HTML_Cascata_Hero` |
| Contexto social | Gauge + cards | `HTML_Social_Hero` |
| Simulação what-if | Waterfall + tabela | `HTML_Simulacao_Hero` |
| Título/navbar | Logo gradiente | `HTML_Navbar_Title` |
| Drill categoria | Cards + barras | `HTML_Drill_Categoria` |
| Tooltips (3) | Cards compactos | `HTML_TT_Categoria/Deficit/Tributacao` |

**Design system:** background `#0f0f1a` · glassmorphism `rgba(255,255,255,0.05)` · Inter/system-ui

---

## 📊 Modelo de Dados

```
dim_tributos          — 20 tributos (tipo, esfera, alíquota)
dim_categorias        — categorias de gasto + alíquota indireta
dim_cadeia_producao   — etapas Indústria→Distribuidor→Varejo→Consumidor
fato_renda_familia    — INSS/IRPF por membro da família
fato_gastos_mensais   — gastos com imposto embutido por categoria
fato_cascata_tributaria — imposto por etapa da cadeia produtiva
Fluxo_Sankey          — tabela calculada DAX (31 linhas para o Sankey)
```

---

## 🚀 Como abrir

```bash
# Abrir o relatório no Power BI Desktop
Report_Mapa_Impostos_Brasil.pbip
```

> Requer Power BI Desktop (versão Enhanced Report Format / PBIR habilitado).  
> Para publicar no Service: File → Publicar → selecionar workspace.

---

## ⚠️ Armadilhas conhecidas

| Problema | Solução |
|----------|---------|
| Locale PT-BR multiplica decimais por 100 | `Table.TransformColumnTypes(..., "en-US")` em todas as tabelas numéricas |
| TMDL: aspas simples causam parse error | Banidas de todos os strings HTML; `"` escapado como `""` via `dq()` |
| CONCATENATEX: vírgula = separador de argumento | Usar `UNICHAR(44)` para vírgula literal; evitar `"","` fora de strings |
| CDN d3 trava no HTML Content visual | Sankey implementado em JS puro (sem CDN) com DOM API |
| JS bloqueado ao clicar no visual no Desktop | Normal — funciona em modo visualização e no Power BI Service |

---

## 📅 Status das Sprints

| Sprint | Entregável | Status |
|--------|-----------|--------|
| 0–6 | Fundação, dados, DAX, tema, layout | ✅ |
| 7 | 01_Impacto: KPIs + Sankey + Ticker | ✅ |
| 8 | 02_Tributacao: rosca + barras | ✅ |
| 9 | 03_Cascata: imposto embutido | ✅ |
| 10 | 04_Social + 05_Simulacao | ✅ |
| 11 | Navbar, drill-through, tooltips (em andamento) | 🔄 |
| 12 | Publicação final | ⬜ |

---

## 🔢 Cálculos INSS 2024 (progressivo)

| Faixa | Até | Alíquota |
|-------|-----|----------|
| 1 | R$ 1.412,00 | 7,5% |
| 2 | R$ 2.666,68 | 9,0% |
| 3 | R$ 4.000,03 | 12,0% |
| 4 | R$ 7.786,02 | 14,0% |

## 🔢 Cálculos IRPF 2024

| Faixa | Até | Alíquota | Dedução |
|-------|-----|----------|---------|
| Isento | R$ 2.259,20 | 0% | — |
| 1 | R$ 2.826,65 | 7,5% | R$ 169,44 |
| 2 | R$ 3.751,05 | 15% | R$ 381,44 |
| 3 | R$ 4.664,68 | 22,5% | R$ 662,77 |
| 4 | Acima | 27,5% | R$ 896,00 |

---

*Dados baseados em legislação tributária brasileira vigente em 2024.*
