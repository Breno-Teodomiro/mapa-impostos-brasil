# Medidas DAX — Mapa de Impostos Familiar

## 1. Parâmetros What-If (criar via Modelagem > Novo Parâmetro)

```
Nome: Salario_Marido_Param
Tipo: Número decimal
Mín: 1.412   Máx: 30.000   Incremento: 100   Padrão: 7.280

Nome: Salario_Esposa_Param
Tipo: Número decimal
Mín: 0   Máx: 20.000   Incremento: 100   Padrão: 2.350

Nome: Dependentes_Param
Tipo: Número inteiro
Mín: 0   Máx: 5   Incremento: 1   Padrão: 1
```

---

## 2. Tabela de Faixas INSS 2024 (criar como tabela calculada)

```dax
Tabela_INSS_2024 =
DATATABLE(
    "faixa", INTEGER,
    "limite_inferior", CURRENCY,
    "limite_superior", CURRENCY,
    "aliquota", DOUBLE,
    {
        { 1, 0,       1412.00, 0.075 },
        { 2, 1412.01, 2666.68, 0.09  },
        { 3, 2666.69, 4000.03, 0.12  },
        { 4, 4000.04, 7786.02, 0.14  }
    }
)
```

---

## 3. Tabela de Faixas IRPF 2024 (criar como tabela calculada)

```dax
Tabela_IRPF_2024 =
DATATABLE(
    "faixa", INTEGER,
    "limite_superior", CURRENCY,
    "aliquota", DOUBLE,
    "deducao_parcela", CURRENCY,
    {
        { 1, 2259.20,  0.000,  0.00   },
        { 2, 2826.65,  0.075,  169.44 },
        { 3, 3751.05,  0.150,  381.44 },
        { 4, 4664.68,  0.225,  662.77 },
        { 5, 999999.0, 0.275,  896.00 }
    }
)
```

---

## 4. Medidas — INSS Progressivo

```dax
-- Calcula INSS progressivo para qualquer salário
_INSS_Calc = 
VAR sal = [Salario_Marido_Param Value] + [Salario_Esposa_Param Value]
RETURN
    MIN(sal, 1412.00)                              * 0.075 +
    MAX(MIN(sal, 2666.68) - 1412.00, 0)            * 0.09  +
    MAX(MIN(sal, 4000.03) - 2666.68, 0)            * 0.12  +
    MAX(MIN(sal, 7786.02) - 4000.03, 0)            * 0.14

-- INSS do Marido isolado
INSS_Marido = 
VAR sal = [Salario_Marido_Param Value]
RETURN
    MIN(sal, 1412.00)                              * 0.075 +
    MAX(MIN(sal, 2666.68) - 1412.00, 0)            * 0.09  +
    MAX(MIN(sal, 4000.03) - 2666.68, 0)            * 0.12  +
    MAX(MIN(sal, 7786.02) - 4000.03, 0)            * 0.14

-- INSS da Esposa isolado
INSS_Esposa = 
VAR sal = [Salario_Esposa_Param Value]
RETURN
    MIN(sal, 1412.00)                              * 0.075 +
    MAX(MIN(sal, 2666.68) - 1412.00, 0)            * 0.09  +
    MAX(MIN(sal, 4000.03) - 2666.68, 0)            * 0.12  +
    MAX(MIN(sal, 7786.02) - 4000.03, 0)            * 0.14

-- INSS Total Família
INSS_Total_Familia = [INSS_Marido] + [INSS_Esposa]

-- Alíquota efetiva INSS Marido
INSS_Aliq_Efetiva_Marido_Pct = 
DIVIDE([INSS_Marido], [Salario_Marido_Param Value], 0) * 100
```

---

## 5. Medidas — IRPF

```dax
-- Base de cálculo IRPF Marido
-- (salário − INSS − dedução por dependente R$189,59/mês)
IRPF_Base_Marido = 
MAX(
    [Salario_Marido_Param Value] - [INSS_Marido] 
    - (189.59 * [Dependentes_Param Value]),
    0
)

-- IRPF Marido
IRPF_Marido = 
VAR base = [IRPF_Base_Marido]
VAR imposto = 
    SWITCH(
        TRUE(),
        base <= 2259.20, 0,
        base <= 2826.65, base * 0.075  - 169.44,
        base <= 3751.05, base * 0.15   - 381.44,
        base <= 4664.68, base * 0.225  - 662.77,
                         base * 0.275  - 896.00
    )
RETURN MAX(imposto, 0)

-- Base de cálculo IRPF Esposa
-- (dependentes declarados pelo marido — esposa não deduz)
IRPF_Base_Esposa = 
MAX([Salario_Esposa_Param Value] - [INSS_Esposa], 0)

-- IRPF Esposa
IRPF_Esposa = 
VAR base = [IRPF_Base_Esposa]
VAR imposto = 
    SWITCH(
        TRUE(),
        base <= 2259.20, 0,
        base <= 2826.65, base * 0.075  - 169.44,
        base <= 3751.05, base * 0.15   - 381.44,
        base <= 4664.68, base * 0.225  - 662.77,
                         base * 0.275  - 896.00
    )
RETURN MAX(imposto, 0)

-- IRPF Total Família
IRPF_Total_Familia = [IRPF_Marido] + [IRPF_Esposa]

-- Alíquota efetiva IRPF Marido
IRPF_Aliq_Efetiva_Marido_Pct = 
DIVIDE([IRPF_Marido], [Salario_Marido_Param Value], 0) * 100
```

---

## 6. Medidas — Renda

```dax
-- Renda Bruta Total
Renda_Bruta_Total = 
[Salario_Marido_Param Value] + [Salario_Esposa_Param Value]

-- Tributação Direta Total
Tributacao_Direta_Total = [INSS_Total_Familia] + [IRPF_Total_Familia]

-- Renda Líquida Total
Renda_Liquida_Total = 
[Renda_Bruta_Total] - [Tributacao_Direta_Total]

-- Alíquota efetiva direta sobre renda bruta
Aliq_Efetiva_Direta_Pct = 
DIVIDE([Tributacao_Direta_Total], [Renda_Bruta_Total], 0) * 100
```

---

## 7. Medidas — Gastos e Impostos Indiretos

```dax
-- Total de gastos (tabela fato_gastos_mensais)
Total_Gastos_Mensais = SUM(fato_gastos_mensais[valor_total])

-- Total impostos indiretos embutidos nos gastos
Total_Imposto_Indireto_Embutido = SUM(fato_gastos_mensais[imposto_embutido])

-- Total custo real (sem impostos embutidos)
Total_Custo_Real = SUM(fato_gastos_mensais[custo_real])

-- Alíquota efetiva indireta (sobre total gasto)
Aliq_Indireta_Efetiva_Pct = 
DIVIDE([Total_Imposto_Indireto_Embutido], [Total_Gastos_Mensais], 0) * 100

-- Imposto indireto Federal
Imposto_Indireto_Federal = SUM(fato_gastos_mensais[imp_federal])

-- Imposto indireto Estadual
Imposto_Indireto_Estadual = SUM(fato_gastos_mensais[imp_estadual])

-- Imposto indireto Municipal
Imposto_Indireto_Municipal = SUM(fato_gastos_mensais[imp_municipal])
```

---

## 8. Medidas — Impostos Patrimoniais

```dax
-- Definição fixa (pode criar tabela dim_patrimonial separada)
Imposto_Patrimonial_IPVA       = 250
Imposto_Patrimonial_IPTU       = 100
Imposto_Patrimonial_Licenciamento = 20

-- Total Patrimonial
Total_Patrimonial = 
[Imposto_Patrimonial_IPVA] + 
[Imposto_Patrimonial_IPTU] + 
[Imposto_Patrimonial_Licenciamento]
```

---

## 9. Medidas — Carga Tributária Total (O número que choca)

```dax
-- Carga tributária absoluta total
Carga_Total_Tributos = 
[Tributacao_Direta_Total] + 
[Total_Imposto_Indireto_Embutido] + 
[Total_Patrimonial]

-- Carga efetiva total sobre a renda BRUTA
-- Esta é a métrica central do dashboard
Carga_Efetiva_Sobre_Renda_Bruta_Pct = 
DIVIDE([Carga_Total_Tributos], [Renda_Bruta_Total], 0) * 100

-- Decomposição da carga (para gráfico de barras empilhadas)
Pct_Carga_Direta   = DIVIDE([Tributacao_Direta_Total],          [Renda_Bruta_Total], 0) * 100
Pct_Carga_Indireta = DIVIDE([Total_Imposto_Indireto_Embutido],  [Renda_Bruta_Total], 0) * 100
Pct_Carga_Patrimon = DIVIDE([Total_Patrimonial],                [Renda_Bruta_Total], 0) * 100
```

---

## 10. Medidas — Resultado Final

```dax
-- Déficit ou Superávit mensal
Resultado_Final = 
[Renda_Liquida_Total] - [Total_Gastos_Mensais] - [Total_Patrimonial]

-- Comprometimento da renda líquida com gastos (%)
Comprometimento_Renda_Liquida_Pct = 
DIVIDE([Total_Gastos_Mensais] + [Total_Patrimonial], [Renda_Liquida_Total], 0) * 100

-- Margem de poupança real (% da renda bruta)
Margem_Poupanca_Pct = 
DIVIDE([Resultado_Final], [Renda_Bruta_Total], 0) * 100
```

---

## 11. Tabela Calculada — Fluxo para o Visual Sankey

```dax
-- ATENÇÃO: Esta tabela alimenta o visual personalizado Sankey
-- Cada linha representa um fluxo: Fonte → Destino → Valor

Fluxo_Sankey =
VAR renda_bruta  = [Renda_Bruta_Total]
VAR inss         = [INSS_Total_Familia]
VAR irpf         = [IRPF_Total_Familia]
VAR renda_liq    = [Renda_Liquida_Total]
VAR ipva         = [Imposto_Patrimonial_IPVA]
VAR iptu         = [Imposto_Patrimonial_IPTU]
VAR licenc       = [Imposto_Patrimonial_Licenciamento]
RETURN
UNION(
    -- Renda bruta → impostos diretos e renda líquida
    ROW("fonte", "Renda Bruta",    "destino", "INSS (Federal)",   "valor", inss,      "tipo", "Direto",    "esfera", "Federal"),
    ROW("fonte", "Renda Bruta",    "destino", "IRPF (Federal)",   "valor", irpf,      "tipo", "Direto",    "esfera", "Federal"),
    ROW("fonte", "Renda Bruta",    "destino", "Renda Líquida",    "valor", renda_liq, "tipo", "Renda",     "esfera", "N/A"),
    -- Renda líquida → categorias de gasto
    ROW("fonte", "Renda Líquida",  "destino", "Alimentação",           "valor", 1600, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Moradia",               "valor", 1200, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Combustível",           "valor",  900, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Financiamento Carro",   "valor",  900, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Energia Elétrica",      "valor",  450, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Saúde",                 "valor",  420, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Escola",                "valor",  500, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Farmácia",              "valor",  400, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Telecom",               "valor",  238, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Vestuário",             "valor",  250, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Lazer",                 "valor",  300, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Seguro Carro",          "valor",  150, "tipo", "Gasto", "esfera", "N/A"),
    ROW("fonte", "Renda Líquida",  "destino", "Outros Gastos",         "valor",  720, "tipo", "Gasto", "esfera", "N/A"),
    -- Impostos patrimoniais (saem da renda líquida diretamente)
    ROW("fonte", "Renda Líquida",  "destino", "IPVA (Estadual)",       "valor", ipva,  "tipo", "Patrimonial", "esfera", "Estadual"),
    ROW("fonte", "Renda Líquida",  "destino", "IPTU (Municipal)",      "valor", iptu,  "tipo", "Patrimonial", "esfera", "Municipal"),
    ROW("fonte", "Renda Líquida",  "destino", "Licenciamento (Estad.)", "valor", licenc,"tipo","Patrimonial", "esfera", "Estadual"),
    -- Impostos indiretos embutidos em cada categoria
    ROW("fonte", "Alimentação",         "destino", "Imposto Indir. — Alim.",  "valor",  416, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Moradia",             "destino", "Imposto Indir. — Mor.",   "valor",  216, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Combustível",         "destino", "Imposto Indir. — Comb.",  "valor",  387, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Financiamento Carro", "destino", "Imposto Indir. — Veíc.", "valor",  270, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Energia Elétrica",    "destino", "Imposto Indir. — Energ.", "valor",  198, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Saúde",               "destino", "Imposto Indir. — Saúde", "valor",   92, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Escola",              "destino", "Imposto Indir. — Educ.", "valor",  110, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Farmácia",            "destino", "Imposto Indir. — Farm.", "valor",  128, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Telecom",             "destino", "Imposto Indir. — Tel.",  "valor",   95, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Vestuário",           "destino", "Imposto Indir. — Vest.", "valor",   88, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Lazer",               "destino", "Imposto Indir. — Laz.",  "valor",   84, "tipo", "Indireto", "esfera", "Mix"),
    ROW("fonte", "Outros Gastos",       "destino", "Imposto Indir. — Outros","valor",   53, "tipo", "Indireto", "esfera", "Mix")
)
```

> **Como usar:** Criar esta tabela calculada em "Modelagem > Nova Tabela". Em seguida, no visual Sankey customizado, mapear as colunas: `fonte → Fonte`, `destino → Destino`, `valor → Valor`, `tipo → Tipo`, `esfera → Esfera`.

---

## 12. Benchmark Socioeconômico (KPIs de Cartão)

```dax
Percentil_Brasil_Estimado = 
VAR renda = [Renda_Bruta_Total]
RETURN
    SWITCH(
        TRUE(),
        renda > 22000, "Top 1%",
        renda > 12000, "Top 5%",
        renda > 8000,  "Top 10%",
        renda > 5000,  "Top 20%",
        renda > 3000,  "Top 40%",
        "Abaixo da mediana"
    )

Percentil_Nordeste_Estimado = 
VAR renda = [Renda_Bruta_Total]
RETURN
    SWITCH(
        TRUE(),
        renda > 12000, "Top 1%",
        renda > 6000,  "Top 5%",
        renda > 4000,  "Top 10%",
        renda > 2500,  "Top 20%",
        "Abaixo da mediana"
    )
```
