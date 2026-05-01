import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;

import * as React from "react";
import * as ReactDOM from "react-dom";

import { SankeyDiagram } from "./SankeyDiagram";
import { SankeyFlowData, TipoFluxo, EsferaFluxo, DADOS_PADRAO } from "./types";

export class Visual implements IVisual {
    private container: HTMLElement;

    constructor(options: VisualConstructorOptions) {
        this.container = options.element;
        this.container.style.overflow = "hidden";
    }

    public update(options: VisualUpdateOptions): void {
        const { width, height } = options.viewport;
        const dataView = options.dataViews?.[0];

        const data    = this.parseDataView(dataView);
        const configs = this.readFormatting(dataView);

        // Calcula renda bruta a partir do nó de origem raiz (maior valor sem entrada)
        const rendaBruta = this.inferRendaBruta(data);

        ReactDOM.render(
            React.createElement(SankeyDiagram, {
                data,
                width,
                height,
                rendaBruta,
                mostrarValores:   configs.mostrarValores,
                mostrarPercentual: configs.mostrarPercentual,
                fundoEscuro:      configs.fundoEscuro,
            }),
            this.container
        );
    }

    private parseDataView(dataView: DataView | undefined): SankeyFlowData[] {
        if (!dataView?.table?.rows?.length) return DADOS_PADRAO;

        const cols = dataView.table.columns;
        const idx = {
            fonte:   cols.findIndex(c => c.roles?.fonte),
            destino: cols.findIndex(c => c.roles?.destino),
            valor:   cols.findIndex(c => c.roles?.valor),
            tipo:    cols.findIndex(c => c.roles?.tipo),
            esfera:  cols.findIndex(c => c.roles?.esfera),
        };

        if (idx.fonte < 0 || idx.destino < 0 || idx.valor < 0) return DADOS_PADRAO;

        return dataView.table.rows
            .map(row => ({
                fonte:   String(row[idx.fonte]  ?? ""),
                destino: String(row[idx.destino] ?? ""),
                valor:   Number(row[idx.valor]   ?? 0),
                tipo:   (idx.tipo  >= 0 ? String(row[idx.tipo])  : "Gasto") as TipoFluxo,
                esfera: (idx.esfera >= 0 ? String(row[idx.esfera]) : "N/A") as EsferaFluxo,
            }))
            .filter(d => d.fonte && d.destino && d.valor > 0);
    }

    private readFormatting(dataView: DataView | undefined) {
        const obj = dataView?.metadata?.objects;
        return {
            mostrarValores:    this.getBoolean(obj, "visual", "mostrarValores",   true),
            mostrarPercentual: this.getBoolean(obj, "visual", "mostrarPercentual", true),
            fundoEscuro:       this.getBoolean(obj, "visual", "fundoEscuro",      true),
        };
    }

    private getBoolean(
        obj: powerbi.DataViewObjects | undefined,
        card: string,
        prop: string,
        def: boolean
    ): boolean {
        try { return (obj as any)?.[card]?.[prop] ?? def; }
        catch { return def; }
    }

    // Nós raiz = aqueles que só aparecem como "fonte", nunca como "destino"
    private inferRendaBruta(data: SankeyFlowData[]): number {
        const destinations = new Set(data.map(d => d.destino));
        const roots = data.filter(d => !destinations.has(d.fonte));
        if (!roots.length) return 0;
        // Agrupa por fonte raiz e soma (caso haja mais de uma linha com a mesma fonte raiz)
        const totals = new Map<string, number>();
        roots.forEach(d => totals.set(d.fonte, (totals.get(d.fonte) ?? 0) + d.valor));
        return Math.max(...Array.from(totals.values()));
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.container);
    }
}
