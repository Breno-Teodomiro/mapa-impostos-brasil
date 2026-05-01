export type TipoFluxo = "Direto" | "Indireto" | "Patrimonial" | "Gasto" | "Renda";
export type EsferaFluxo = "Federal" | "Estadual" | "Municipal" | "Mix" | "N/A";

export interface SankeyFlowData {
    fonte: string;
    destino: string;
    valor: number;
    tipo: TipoFluxo;
    esfera: EsferaFluxo;
}

export interface SankeyDiagramProps {
    data: SankeyFlowData[];
    width: number;
    height: number;
    rendaBruta?: number;
    mostrarValores?: boolean;
    mostrarPercentual?: boolean;
    fundoEscuro?: boolean;
}

// Paleta de cores do visual — cada tipo de fluxo tem cor própria
export const COR_POR_TIPO: Record<TipoFluxo | string, string> = {
    Direto:      "#E74C3C",   // Vermelho — imposto direto (INSS/IR)
    Indireto:    "#E67E22",   // Laranja — imposto embutido no consumo
    Patrimonial: "#9B59B6",   // Roxo — IPVA, IPTU, licenciamento
    Gasto:       "#3498DB",   // Azul — gasto de consumo
    Renda:       "#27AE60",   // Verde — renda disponível
};

// Cores de destaque por esfera governamental (usadas nos tooltips)
export const COR_POR_ESFERA: Record<EsferaFluxo | string, string> = {
    Federal:   "#C0392B",
    Estadual:  "#8E44AD",
    Municipal: "#1A5276",
    Mix:       "#D35400",
    "N/A":     "#566573",
};

// Dados padrão do PRD (renderizados quando não há dados do Power BI)
export const DADOS_PADRAO: SankeyFlowData[] = [
    // Renda bruta → tributação direta e renda líquida
    { fonte: "Renda Bruta R$9.630",    destino: "INSS — Federal",           valor: 1028.34, tipo: "Direto",      esfera: "Federal"   },
    { fonte: "Renda Bruta R$9.630",    destino: "IRPF — Federal",           valor:  823.41, tipo: "Direto",      esfera: "Federal"   },
    { fonte: "Renda Bruta R$9.630",    destino: "Renda Líquida R$7.778",    valor: 7778.25, tipo: "Renda",       esfera: "N/A"       },
    // Renda líquida → categorias de gasto
    { fonte: "Renda Líquida R$7.778",  destino: "Alimentação",              valor: 1600.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Moradia",                  valor: 1200.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Combustível",              valor:  900.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Financiamento Carro",      valor:  900.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Escola",                   valor:  500.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Energia Elétrica",         valor:  450.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Saúde",                    valor:  420.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Farmácia",                 valor:  400.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Telecom",                  valor:  238.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Vestuário",                valor:  250.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Lazer",                    valor:  300.00, tipo: "Gasto",       esfera: "N/A"       },
    { fonte: "Renda Líquida R$7.778",  destino: "Outros",                   valor:  620.00, tipo: "Gasto",       esfera: "N/A"       },
    // Impostos patrimoniais (saem direto da renda líquida)
    { fonte: "Renda Líquida R$7.778",  destino: "IPVA — Estadual",          valor:  250.00, tipo: "Patrimonial", esfera: "Estadual"  },
    { fonte: "Renda Líquida R$7.778",  destino: "IPTU — Municipal",         valor:  100.00, tipo: "Patrimonial", esfera: "Municipal" },
    { fonte: "Renda Líquida R$7.778",  destino: "Licenciamento — Estadual", valor:   20.00, tipo: "Patrimonial", esfera: "Estadual"  },
    // Impostos indiretos embutidos em cada categoria de gasto
    { fonte: "Alimentação",            destino: "Imp. Indir. — Alim.",      valor:  416.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Moradia",                destino: "Imp. Indir. — Mor.",       valor:  216.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Combustível",            destino: "Imp. Indir. — Comb.",      valor:  387.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Financiamento Carro",    destino: "Imp. Indir. — Veíc.",      valor:  270.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Escola",                 destino: "Imp. Indir. — Educ.",      valor:  110.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Energia Elétrica",       destino: "Imp. Indir. — Energ.",     valor:  198.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Saúde",                  destino: "Imp. Indir. — Saúde",      valor:   92.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Farmácia",               destino: "Imp. Indir. — Farm.",      valor:  128.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Telecom",                destino: "Imp. Indir. — Tel.",       valor:   95.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Vestuário",              destino: "Imp. Indir. — Vest.",      valor:   88.00, tipo: "Indireto",    esfera: "Mix"       },
    { fonte: "Lazer",                  destino: "Imp. Indir. — Laz.",       valor:   84.00, tipo: "Indireto",    esfera: "Mix"       },
];
