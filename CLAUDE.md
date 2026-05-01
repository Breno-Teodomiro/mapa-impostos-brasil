# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mapa de Impostos Familiar** — Power BI dashboard que expõe a carga tributária real de uma família brasileira de classe média (Teresina-PI), incluindo o efeito de **imposto sobre imposto em cascata**: tributos embutidos em cada etapa da cadeia produtiva (Indústria → Distribuidor → Varejista → Consumidor) somados aos tributos diretos sobre a renda (INSS + IRPF) e patrimoniais (IPVA, IPTU, Licenciamento).

**Tese central:** família no top 8–12% da renda no Brasil tem carga tributária efetiva próxima de 46% da renda bruta e resultado mensal negativo.

**Stack:** Power BI Desktop + DAX + Custom Visual (pbiviz, React, TypeScript, D3 Sankey)

**Perfil base (PRD):** Marido R$7.280 + Esposa R$2.350 = R$9.630 bruto / mês / 1 filho

## Estrutura do Projeto

```
dados/               → Tabelas CSV (star schema)
  dim_tributos.csv          — todos os tributos com tipo/esfera/alíquota
  dim_categorias.csv        — categorias de gasto + alíquota indireta efetiva
  dim_cadeia_producao.csv   — etapas Indústria→Distribuidor→Varejo→Consumidor
  fato_renda_familia.csv    — INSS/IRPF calculados por membro
  fato_gastos_mensais.csv   — gastos com imposto embutido isolado por categoria
  fato_cascata_tributaria.csv — decomposição de imposto por etapa de cadeia

dax/
  medidas_completas.md  — todas as medidas DAX prontas para copiar no Power BI

visual_sankey/        → Projeto pbiviz (Custom Visual)
  src/visual.tsx          — classe Visual (IVisual) — parse DataView + render React
  src/SankeyDiagram.tsx   — componente React com D3 Sankey + tooltip
  src/types.ts            — interfaces, paleta de cores, DADOS_PADRAO
  capabilities.json       — data roles: Fonte, Destino, Valor, Tipo, Esfera
  pbiviz.json / tsconfig.json / package.json
  INSTALACAO.md           — passo a passo para build e configuração no Power BI
```

## Comandos do Visual Customizado

```bash
cd visual_sankey
npm install          # instalar dependências
npm run start        # dev mode (live reload via Power BI Desktop)
npm run build        # gera dist/mapaImpostosSankey.pbiviz
```

## Modelo de Dados

### Fluxo do Sankey (tabela calculada DAX `Fluxo_Sankey`)
Cada linha = um fluxo `fonte → destino → valor`. A tabela é criada via DAX (seção 11 do arquivo `dax/medidas_completas.md`) e alimenta o visual customizado.

### Hierarquia do fluxo
```
Renda Bruta
  → INSS (Direto / Federal)
  → IRPF (Direto / Federal)
  → Renda Líquida
      → [Categorias de gasto] (Gasto)
          → [Imposto Indireto embutido] (Indireto / Mix)
      → IPVA / IPTU / Licenciamento (Patrimonial / Estadual|Municipal)
```

### Parâmetros What-If
- `Salario_Marido_Param` (padrão R$7.280)
- `Salario_Esposa_Param` (padrão R$2.350)
- `Dependentes_Param` (padrão 1)

### Cálculo INSS 2024 (progressivo — 4 faixas)
| Faixa | Até | Alíquota |
|-------|-----|----------|
| 1 | R$1.412,00 | 7,5% |
| 2 | R$2.666,68 | 9% |
| 3 | R$4.000,03 | 12% |
| 4 | R$7.786,02 | 14% |

### Cálculo IRPF 2024 (base = salário − INSS − R$189,59/dependente)
| Faixa | Até | Alíquota | Dedução parcela |
|-------|-----|----------|-----------------|
| Isento | R$2.259,20 | 0% | R$0 |
| 1 | R$2.826,65 | 7,5% | R$169,44 |
| 2 | R$3.751,05 | 15% | R$381,44 |
| 3 | R$4.664,68 | 22,5% | R$662,77 |
| 4 | Acima | 27,5% | R$896,00 |

### Números consolidados do perfil base
| Item | Valor |
|------|-------|
| Renda bruta total | R$9.630 |
| INSS total família | R$1.028,34 |
| IRPF total família | R$823,41 |
| **Tributação direta (19,2%)** | **R$1.851,75** |
| Renda líquida | R$7.778,25 |
| Total gastos mensais | R$8.028 |
| Impostos patrimoniais | R$370 |
| Impostos indiretos embutidos | ~R$2.214 |
| **Carga total efetiva (~46%)** | **~R$4.436** |
| Resultado final | ~−R$620 (déficit) |

## Alíquotas Indiretas por Categoria (embutidas no preço)
| Categoria | Total | Federal | Estadual | Municipal |
|-----------|-------|---------|----------|-----------|
| Alimentação | 26% | 9% | 17% | 0% |
| Combustível | 43% | 25% | 18% | 0% |
| Energia Elétrica | 44% | 5% | 37% | 2% |
| Telecom | 40% | 16% | 24% | 0% |
| Medicamentos | 32% | 20% | 12% | 0% |
| Vestuário | 35% | 20% | 15% | 0% |
| Veículos (financ.) | 30% | 18% | 12% | 0% |

## Paleta de Cores do Visual Sankey
| Cor | Tipo |
|-----|------|
| #E74C3C Vermelho | Imposto Direto (INSS/IRPF) |
| #E67E22 Laranja | Imposto Indireto (embutido) |
| #9B59B6 Roxo | Imposto Patrimonial |
| #3498DB Azul | Gasto / Consumo |
| #27AE60 Verde | Renda |

## Evoluções Futuras (V2)
- Simulação: aluguel vs. financiamento, escola pública vs. privada
- **Índice de Pressão Financeira Familiar (IPFF)** — indicador proprietário
- V2 em Python/Streamlit ou React/Node se Power BI não comportar toda a interatividade
