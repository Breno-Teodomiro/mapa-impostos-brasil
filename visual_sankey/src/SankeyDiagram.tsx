import * as React from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { SankeyDiagramProps, COR_POR_TIPO, TipoFluxo } from "./types";

interface NodeDatum {
    name: string;
    tipo: TipoFluxo | string;
    esfera: string;
    // d3-sankey populates these at layout time:
    x0?: number; x1?: number;
    y0?: number; y1?: number;
    value?: number;
    index?: number;
}

interface LinkDatum {
    source: number | NodeDatum;
    target: number | NodeDatum;
    value: number;
    tipo: TipoFluxo | string;
    // d3-sankey populates these:
    width?: number;
    y0?: number; y1?: number;
}

const MARGIN = { top: 32, right: 210, bottom: 16, left: 16 };

function formatBRL(v: number): string {
    return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getNodeColor(tipo: string): string {
    return (COR_POR_TIPO as Record<string, string>)[tipo] ?? "#566573";
}

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
    data,
    width,
    height,
    rendaBruta,
    mostrarValores = true,
    mostrarPercentual = true,
    fundoEscuro = true,
}) => {
    const [tooltip, setTooltip] = React.useState<{
        x: number; y: number; texto: string;
    } | null>(null);

    const innerW = Math.max(width  - MARGIN.left - MARGIN.right,  100);
    const innerH = Math.max(height - MARGIN.top  - MARGIN.bottom, 100);

    // Build unique node list preserving insertion order
    const nodeMap = new Map<string, NodeDatum>();
    data.forEach(({ fonte, destino, tipo, esfera }) => {
        if (!nodeMap.has(fonte))   nodeMap.set(fonte,   { name: fonte,   tipo: "Renda",  esfera: "N/A" });
        if (!nodeMap.has(destino)) nodeMap.set(destino, { name: destino, tipo,           esfera });
    });
    const rawNodes: NodeDatum[] = Array.from(nodeMap.values());
    const nameToIdx = new Map(rawNodes.map((n, i) => [n.name, i]));

    const rawLinks: LinkDatum[] = data
        .filter(d => d.valor > 0 && nameToIdx.has(d.fonte) && nameToIdx.has(d.destino))
        .map(d => ({
            source: nameToIdx.get(d.fonte)!,
            target: nameToIdx.get(d.destino)!,
            value:  d.valor,
            tipo:   d.tipo,
        }));

    // Deep-clone before passing to d3-sankey (it mutates its inputs)
    const clonedNodes = rawNodes.map(n => ({ ...n }));
    const clonedLinks = rawLinks.map(l => ({ ...l }));

    const sankeyGen = sankey<NodeDatum, LinkDatum>()
        .nodeId(n => n.name)
        .nodeWidth(18)
        .nodePadding(10)
        .extent([[0, 0], [innerW, innerH]]);

    let graph: { nodes: NodeDatum[]; links: LinkDatum[] };
    try {
        graph = sankeyGen({ nodes: clonedNodes, links: clonedLinks });
    } catch {
        return (
            <svg width={width} height={height}>
                <rect width={width} height={height} fill={fundoEscuro ? "#1a1a2e" : "#f8f9fa"} />
                <text x={width / 2} y={height / 2} textAnchor="middle"
                    fill={fundoEscuro ? "#ECEFF4" : "#2C3E50"} fontSize={13}>
                    Aguardando dados do Power BI…
                </text>
            </svg>
        );
    }

    const bg         = fundoEscuro ? "#0f0f1a" : "#FAFBFC";
    const textColor  = fundoEscuro ? "#ECEFF4"  : "#2C3E50";
    const subColor   = fundoEscuro ? "#94A3B8"  : "#7F8C8D";
    const totalRenda = rendaBruta ?? data.find(d => d.tipo === "Renda")?.valor ?? 0;

    return (
        <svg
            width={width}
            height={height}
            style={{ fontFamily: "'Segoe UI', Calibri, sans-serif", cursor: "default" }}
            onMouseLeave={() => setTooltip(null)}
        >
            {/* Fundo */}
            <rect width={width} height={height} fill={bg} rx={6} />

            {/* Título */}
            <text x={MARGIN.left} y={20} fontSize={13} fontWeight={700} fill={textColor}>
                Mapa de Impostos — Família Brasileira • Teresina-PI
            </text>

            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>

                {/* ── LINKS ── */}
                {graph.links.map((link, i) => {
                    const targetNode = link.target as NodeDatum;
                    const cor = getNodeColor(link.tipo);
                    const d   = sankeyLinkHorizontal()(link as any) ?? "";
                    const lw  = Math.max(1, (link as any).width ?? 1);

                    return (
                        <path
                            key={`link-${i}`}
                            d={d}
                            fill="none"
                            stroke={cor}
                            strokeOpacity={0.35}
                            strokeWidth={lw}
                            onMouseMove={e => {
                                const src = (link.source as NodeDatum).name;
                                const tgt = (link.target as NodeDatum).name;
                                const pct = totalRenda > 0
                                    ? ` (${(link.value / totalRenda * 100).toFixed(1)}% renda bruta)`
                                    : "";
                                setTooltip({
                                    x: e.nativeEvent.offsetX,
                                    y: e.nativeEvent.offsetY,
                                    texto: `${src} → ${tgt}\n${formatBRL(link.value)}${pct}`,
                                });
                            }}
                            style={{ transition: "stroke-opacity .15s" }}
                            onMouseEnter={e => (e.currentTarget.style.strokeOpacity = "0.65")}
                            onMouseLeave={e => (e.currentTarget.style.strokeOpacity = "0.35")}
                        />
                    );
                })}

                {/* ── NÓS ── */}
                {graph.nodes.map((node, i) => {
                    const { x0 = 0, x1 = 0, y0 = 0, y1 = 0, value = 0 } = node as any;
                    const nh   = Math.max(y1 - y0, 1);
                    const cor  = getNodeColor(node.tipo);
                    const pct  = totalRenda > 0 ? (value / totalRenda * 100).toFixed(1) + "%" : "";
                    const onRight = x0 > innerW * 0.5;
                    const labelX  = onRight ? x0 - 6 : x1 + 6;
                    const anchor  = onRight ? "end"   : "start";

                    return (
                        <g key={`node-${i}`}
                            onMouseMove={e => setTooltip({
                                x: e.nativeEvent.offsetX,
                                y: e.nativeEvent.offsetY,
                                texto: `${node.name}\n${formatBRL(value)}${totalRenda > 0 ? `\n${pct} da renda bruta` : ""}`,
                            })}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <rect
                                x={x0} y={y0}
                                width={x1 - x0} height={nh}
                                fill={cor} opacity={0.92} rx={3}
                            />
                            {/* Rótulo do nó */}
                            <text
                                x={labelX} y={(y0 + y1) / 2 - (mostrarValores && nh > 24 ? 7 : 0)}
                                dy="0.35em"
                                textAnchor={anchor}
                                fontSize={Math.min(11, Math.max(8, nh * 0.38))}
                                fill={textColor}
                                style={{ pointerEvents: "none" }}
                            >
                                {node.name}
                            </text>
                            {/* Valor monetário */}
                            {mostrarValores && nh > 24 && (
                                <text
                                    x={labelX} y={(y0 + y1) / 2 + 8}
                                    dy="0.35em"
                                    textAnchor={anchor}
                                    fontSize={Math.min(10, Math.max(8, nh * 0.32))}
                                    fill={subColor}
                                    style={{ pointerEvents: "none" }}
                                >
                                    {formatBRL(value)}
                                    {mostrarPercentual && totalRenda > 0 ? `  ${pct}` : ""}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* ── LEGENDA ── */}
                {(["Direto", "Indireto", "Patrimonial", "Gasto", "Renda"] as TipoFluxo[]).map((tipo, i) => (
                    <g key={`leg-${i}`} transform={`translate(${innerW + 8}, ${i * 22})`}>
                        <rect width={12} height={12} fill={COR_POR_TIPO[tipo]} rx={2} />
                        <text x={16} y={10} fontSize={10} fill={subColor}>{tipo}</text>
                    </g>
                ))}
            </g>

            {/* ── TOOLTIP ── */}
            {tooltip && (() => {
                const lines = tooltip.texto.split("\n");
                const tw = Math.max(...lines.map(l => l.length)) * 7 + 16;
                const th = lines.length * 16 + 10;
                const tx = Math.min(tooltip.x + 12, width  - tw - 4);
                const ty = Math.min(tooltip.y + 12, height - th - 4);
                return (
                    <g transform={`translate(${tx},${ty})`} style={{ pointerEvents: "none" }}>
                        <rect width={tw} height={th} fill="#1a1a2e" opacity={0.92} rx={4} />
                        {lines.map((line, i) => (
                            <text key={i} x={8} y={18 + i * 16} fontSize={11} fill="#ECEFF4">{line}</text>
                        ))}
                    </g>
                );
            })()}
        </svg>
    );
};
