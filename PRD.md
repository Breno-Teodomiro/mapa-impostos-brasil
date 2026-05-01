# 📊 PRD — Dashboard de Realidade Financeira Familiar (Brasil / Teresina-PI)

---

## 1. Objetivo do Produto

Construir um dashboard analítico que demonstre:

* Renda bruta vs renda líquida real
* Carga tributária efetiva (direta + indireta)
* Distribuição de gastos essenciais
* Capacidade de poupança / déficit
* Posicionamento socioeconômico da família

Com base em:

* Dados reais do Brasil
* Recorte regional (Nordeste / Piauí / Teresina)
* Modelo de consumo típico de classe média

---

## 2. Perfil Base da Simulação

### Composição familiar

* 2 adultos + 1 filho (<18 anos)

### Renda

* Marido: R$ 7.280
* Esposa: R$ 2.350
* **Renda bruta total: R$ 9.630 (~10k)**

---

## 3. Camadas Analíticas do Dashboard

---

### 3.1 Camada 1 — Renda e Tributação Direta

#### Cálculo:

* INSS (tabela progressiva)
* IRPF (considerando deduções: dependente + INSS)

#### Estrutura:

* Salário bruto
* (-) INSS
* (-) IR
* = **Renda líquida disponível**

#### Output esperado:

* Taxa efetiva de imposto direto (% da renda)

---

### 3.2 Camada 2 — Custos Fixos Essenciais

| Categoria           | Valor |
| ------------------- | ----- |
| Moradia             | 1.200 |
| Alimentação         | 1.600 |
| Combustível         | 900   |
| Energia             | 450   |
| Água                | 120   |
| Internet            | 129   |
| Telefonia           | 109   |
| Plano saúde         | 420   |
| Escola              | 500   |
| Farmácia            | 400   |
| Financiamento carro | 900   |
| Seguro carro        | 150   |

**Subtotal: R$ 6.878**

---

### 3.3 Ajustes Necessários (Custos Subestimados)

#### Custos adicionais obrigatórios

| Categoria             | Valor |
| --------------------- | ----- |
| Manutenção veículo    | 150   |
| Vestuário             | 250   |
| Lazer mínimo          | 300   |
| Emergências (reserva) | 300   |
| Material escolar      | 100   |
| Taxas bancárias       | 50    |

**Subtotal adicional: R$ 1.150**

---

### 3.4 Tributos Indiretos (Consumo)

Aplicação de alíquotas médias por categoria:

| Categoria    | % imposto médio |
| ------------ | --------------- |
| Alimentação  | 17%             |
| Combustível  | 40%             |
| Energia      | 45%             |
| Telecom      | 40%             |
| Medicamentos | 33%             |
| Veículos     | 30%             |

#### Objetivo:

Calcular:

* Valor de imposto embutido por categoria
* Total de carga tributária indireta mensal

---

### 3.5 Camada 3 — Impostos Patrimoniais

| Imposto       | Valor mensal |
| ------------- | ------------ |
| IPVA          | 250          |
| Licenciamento | 20           |
| IPTU          | 100          |

**Total: R$ 370**

---

## 4. Consolidação Financeira

### Fórmula principal

```
Renda líquida
- Custos essenciais
- Custos adicionais
- Impostos indiretos
- Impostos patrimoniais
= Resultado final (superávit ou déficit)
```

---

## 5. Camada de Inteligência (Insights)

---

### 5.1 Carga Tributária Total

Separação:

* Tributação direta (INSS + IR)
* Tributação indireta (consumo)
* Tributação patrimonial

#### Indicadores:

* % sobre renda total
* Valor absoluto

---

### 5.2 Distribuição da Renda

Visualizações:

* Gráfico de pizza (destino da renda)
* Gráfico de barras (peso por categoria)

---

### 5.3 Capacidade Financeira

KPIs:

* % de comprometimento da renda
* Margem líquida
* Capacidade de poupança

---

## 6. Benchmark Socioeconômico

### Objetivo:

Posicionar a família em termos de renda relativa

### Referência (aproximada):

| Faixa          | Renda |
| -------------- | ----- |
| Top 10% Brasil | ~8k+  |
| Top 5%         | ~12k+ |

### Classificação estimada:

* Brasil: Top ~8%–12%
* Nordeste: Top ~5%
* Piauí: Top ~3%–5%
* Teresina: Top ~5%

### Insight-chave:

Família está entre as mais ricas estatisticamente, porém com baixa capacidade de sobra financeira.

---

## 7. Estrutura do Dashboard

---

### Página 1 — Visão Geral

* Renda líquida
* Total de gastos
* Saldo final
* % de carga tributária

---

### Página 2 — Tributação

* Direta vs indireta
* Peso real dos impostos

---

### Página 3 — Consumo

* Distribuição por categoria
* Ranking de impacto

---

### Página 4 — Comparativo Social

* Percentil de renda
* Comparação Brasil / Nordeste / Piauí / Teresina

---

### Página 5 — Simulação

#### Inputs:

* Renda
* Moradia
* Educação
* Consumo

#### Outputs:

* Saldo final
* % de impostos
* Classe social estimada

---

## 8. Regras Técnicas

* Agregar dados no menor grão necessário
* Separar modelo em:

  * Fato financeiro
  * Dimensão de categorias
  * Dimensão tributária
* Aplicar impostos via tabela de lookup (não hardcode)
* Evitar duplicidade de cálculos (modelo OLAP eficiente)

---

## 9. Evoluções Futuras

* Simulação de cenários:

  * Aluguel vs financiamento
  * Escola pública vs privada
* Criação de indicador proprietário:

### Índice de Pressão Financeira Familiar (IPFF)

---

## 10. Conclusão Estratégica

O dashboard deve responder:

> Por que famílias com renda relativamente alta ainda apresentam baixa capacidade de poupança?

Principais fatores:

* Alta carga tributária indireta
* Elevado custo de vida urbano
* Forte concentração de despesas fixas

---
