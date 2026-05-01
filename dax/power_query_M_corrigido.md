# Power Query M — Código Corrigido para dim_tributos

Cole no **Editor Avançado** do Power Query (botão "Editor Avançado" na aba Página Inicial).

## dim_tributos

```powerquery
let
    Fonte = Csv.Document(
        File.Contents("C:\PROJETOS\PROJETO_IMPOSTOS\dados\dim_tributos.csv"),
        [
            Delimiter = ",",
            Columns = 8,
            Encoding = 65001,
            QuoteStyle = QuoteStyle.Csv
        ]
    ),
    #"Cabeçalhos Promovidos" = Table.PromoteHeaders(Fonte, [PromoteAllScalars = true]),
    #"Tipo Alterado" = Table.TransformColumnTypes(
        #"Cabeçalhos Promovidos",
        {
            {"id",               Int64.Type},
            {"nome",             type text},
            {"sigla",            type text},
            {"tipo",             type text},
            {"esfera",           type text},
            {"aliquota_nominal", type number},
            {"incide_sobre",     type text},
            {"observacao",       type text}
        }
    )
in
    #"Tipo Alterado"
```

---

## fato_renda_familia

```powerquery
let
    Fonte = Csv.Document(
        File.Contents("C:\PROJETOS\PROJETO_IMPOSTOS\dados\fato_renda_familia.csv"),
        [
            Delimiter = ",",
            Columns = 15,
            Encoding = 65001,
            QuoteStyle = QuoteStyle.Csv
        ]
    ),
    #"Cabeçalhos Promovidos" = Table.PromoteHeaders(Fonte, [PromoteAllScalars = true]),
    #"Tipo Alterado" = Table.TransformColumnTypes(
        #"Cabeçalhos Promovidos",
        {
            {"id_membro",                  Int64.Type},
            {"membro",                     type text},
            {"salario_bruto",              type number},
            {"inss_f1_ate_1412",           type number},
            {"inss_f2_1412_2667",          type number},
            {"inss_f3_2667_4000",          type number},
            {"inss_f4_4000_7786",          type number},
            {"inss_total",                 type number},
            {"inss_aliq_efetiva_pct",      type number},
            {"irpf_base_calculo",          type number},
            {"irpf_deducao_dependentes",   type number},
            {"irpf_valor",                 type number},
            {"irpf_aliq_efetiva_pct",      type number},
            {"renda_liquida",              type number},
            {"num_dependentes_declarados", Int64.Type},
            {"observacao",                 type text}
        }
    )
in
    #"Tipo Alterado"
```

---

## Como aplicar

1. No Power BI Desktop, painel direito → clique na tabela (ex: `dim_tributos`)
2. Aba **Página Inicial** → **Transformar Dados** (abre o Power Query Editor)
3. Com a tabela selecionada → **Página Inicial** → **Editor Avançado**
4. Selecionar todo o conteúdo e colar o código acima
5. Clicar **Concluído** → **Fechar e Aplicar**
6. Repetir para `fato_renda_familia`

## Diferenças em relação ao código gerado automaticamente

| Problema original | Correção aplicada |
|-------------------|-------------------|
| `Csv.Document([Content])` sem encoding | `Encoding = 65001` (UTF-8 explícito) |
| Sem `QuoteStyle` | `QuoteStyle = QuoteStyle.Csv` (lê campos com aspas corretamente) |
| `aliquota_nominal` como `Int64.Type` | `type number` (suporta 27.5, 0.65, 0.5 etc.) |
| `Table.RemoveRowsWithErrors` removendo dados | Removido — erros agora não ocorrem |
| Leitura via `Folder.Files` + filtro | `File.Contents` direto (mais simples e estável) |
