# Instalação e Build do Visual Sankey

## Pré-requisitos
- Node.js 18+ instalado
- Power BI Desktop com modo desenvolvedor habilitado
- Conta Power BI Pro (já confirmado)

## 1. Instalar dependências

```bash
cd visual_sankey
npm install
```

## 2. Modo desenvolvimento (live reload no Power BI Desktop)

```bash
npm run start
# ou: npx pbiviz start
```

No Power BI Desktop:
- Arquivo → Opções → Segurança → habilitar "Visuais do desenvolvedor"
- Inserir → Mais visuais → Visual do desenvolvedor

## 3. Gerar pacote .pbiviz para distribuição

```bash
npm run build
# ou: npx pbiviz package
```

O arquivo `dist/mapaImpostosSankey.pbiviz` será gerado.

No Power BI Desktop:
- Inserir → Mais visuais → Importar visual de arquivo → selecionar o .pbiviz

## 4. Conectar dados no Power BI

### Passo A — Importar as tabelas CSV

Página inicial → Obter Dados → Texto/CSV:
- `dados/dim_tributos.csv`
- `dados/dim_categorias.csv`
- `dados/dim_cadeia_producao.csv`
- `dados/fato_renda_familia.csv`
- `dados/fato_gastos_mensais.csv`
- `dados/fato_cascata_tributaria.csv`

### Passo B — Criar parâmetros What-If

Modelagem → Novo Parâmetro (seguir as especificações em `dax/medidas_completas.md` seção 1)

### Passo C — Criar as medidas DAX

Copiar todas as medidas de `dax/medidas_completas.md` para o Power BI Desktop
(selecionar tabela relevante antes de colar cada medida)

### Passo D — Criar a tabela Fluxo_Sankey

Modelagem → Nova Tabela → colar o DAX da seção 11 de `dax/medidas_completas.md`

### Passo E — Configurar o visual Sankey

Arrastar o visual Sankey para o canvas e mapear:
- **Fonte**   → coluna `fonte`   da tabela `Fluxo_Sankey`
- **Destino** → coluna `destino` da tabela `Fluxo_Sankey`
- **Valor**   → coluna `valor`   da tabela `Fluxo_Sankey`
- **Tipo**    → coluna `tipo`    da tabela `Fluxo_Sankey`
- **Esfera**  → coluna `esfera`  da tabela `Fluxo_Sankey`

## Estrutura de cores do visual

| Cor       | Tipo de fluxo    |
|-----------|------------------|
| Vermelho  | Imposto Direto   |
| Laranja   | Imposto Indireto |
| Roxo      | Patrimonial      |
| Azul      | Gasto / Consumo  |
| Verde     | Renda            |
