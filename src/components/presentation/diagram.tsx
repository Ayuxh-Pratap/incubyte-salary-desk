import "server-only";
import diagrams from "../../../docs/presentation-diagrams.json";
import { REPOSITORY } from "@/server/presentation/catalog";
type Node = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  shape: string;
};
type Edge = {
  from: string;
  to: string;
  label: string;
  path: string;
  x: number;
  y: number;
};
type Graph = {
  width: number;
  height: number;
  nodes: Node[];
  edges: Edge[];
  boundaries?: { x: number; y: number; w: number; h: number; label: string }[];
};
function GraphNode({ node }: { node: Node }) {
  const { x, y, w, h, shape } = node,
    center = x + w / 2;
  const style = {
    fill: shape === "result" ? "var(--status-signal-soft)" : "var(--inset)",
    stroke: shape === "result" ? "var(--primary)" : "var(--input)",
    strokeWidth: 1,
  };
  const offset = shape === "store" ? 43 : 31;
  return (
    <g>
      {shape === "decision" ? (
        <polygon
          points={`${center},${y} ${x + w},${y + h / 2} ${center},${y + h} ${x},${y + h / 2}`}
          style={style}
        />
      ) : shape === "store" ? (
        <>
          <path
            d={`M${x} ${y + 14} C${x} ${y - 4},${x + w} ${y - 4},${x + w} ${y + 14} V${y + h - 14} C${x + w} ${y + h + 4},${x} ${y + h + 4},${x} ${y + h - 14} Z`}
            style={style}
          />
          <path
            d={`M${x} ${y + 14} C${x} ${y + 32},${x + w} ${y + 32},${x + w} ${y + 14}`}
            fill="none"
            stroke="var(--input)"
          />
        </>
      ) : (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={shape === "input" ? h / 2 : 10}
          style={style}
          strokeDasharray={shape === "note" ? "4 4" : undefined}
        />
      )}
      <text
        x={shape === "decision" ? center : x + 18}
        y={shape === "decision" ? y + h / 2 - 5 : y + offset}
        textAnchor={shape === "decision" ? "middle" : undefined}
        fill="var(--foreground)"
        fontSize="16"
        fontWeight="500"
      >
        {node.title}
      </text>
      {node.lines.map((line, i) => (
        <text
          key={line}
          x={shape === "decision" ? center : x + 18}
          y={
            shape === "decision"
              ? y + h / 2 + 17 + i * 18
              : y + offset + 23 + i * 21
          }
          textAnchor={shape === "decision" ? "middle" : undefined}
          fill="var(--foreground-2)"
          fontSize="14"
        >
          {line}
        </text>
      ))}
    </g>
  );
}
export function Diagram({ id }: { id: keyof typeof diagrams }) {
  const diagram = diagrams[id];
  if (!("graph" in diagram))
    return (
      <figure
        aria-label={diagram.title}
        className="my-8 rounded-xl bg-card p-5 shadow-panel md:p-7"
      >
        <figcaption>
          <h3 className="text-heading font-medium">{diagram.title}</h3>
          <p className="mt-2 text-ui leading-relaxed text-foreground-2">
            {diagram.description}
          </p>
        </figcaption>
        <ol className="mt-6 grid gap-x-8 md:grid-cols-2 xl:grid-cols-3">
          {diagram.nodes.map((node) => (
            <li key={node.commit} className="relative border-l pl-5 pb-7">
              <span
                aria-hidden
                className="absolute top-1 -left-1 size-2 rounded-full bg-primary"
              />
              <p className="text-ui font-medium">{node.title}</p>
              <p className="mt-2 text-meta leading-relaxed text-foreground-2">
                {node.body}
              </p>
              <p className="mt-2 text-meta text-muted-foreground">
                {node.published ? (
                  <a
                    className="underline underline-offset-4"
                    href={`${REPOSITORY}/commit/${node.commit}`}
                  >
                    {node.commit} ↗
                  </a>
                ) : (
                  <span>{node.commit} · local review</span>
                )}
              </p>
            </li>
          ))}
        </ol>
      </figure>
    );
  const graph: Graph = diagram.graph,
    arrow = `case-${id}-arrow`;
  return (
    <figure
      aria-label={diagram.title}
      className="my-8 min-w-0 rounded-xl bg-card shadow-panel"
    >
      <figcaption className="p-5 pb-0 md:px-7 md:pt-7">
        <h3 className="text-heading font-medium">{diagram.title}</h3>
        <p className="mt-2 max-w-[95ch] text-ui leading-relaxed text-foreground-2">
          {diagram.description}
        </p>
        <p className="mt-3 text-meta text-muted-foreground">
          Scroll horizontally when space is tight. A text version follows.
        </p>
      </figcaption>
      <div
        role="region"
        aria-label={`${diagram.title} diagram, horizontally scrollable`}
        tabIndex={0}
        className="my-4 overflow-x-auto rounded-lg px-3 md:px-5"
      >
        <svg
          role="img"
          aria-labelledby={`${id}-title ${id}-description`}
          viewBox={`0 0 ${graph.width} ${graph.height}`}
          className="block w-full min-w-[1120px] xl:min-w-0"
          style={{ fontFamily: "inherit" }}
        >
          <title id={`${id}-title`}>{diagram.title}</title>
          <desc id={`${id}-description`}>
            {diagram.description} Connections and alternative outcomes are also
            listed in the text version.
          </desc>
          <defs>
            <marker
              id={arrow}
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 Z" fill="var(--foreground-faint)" />
            </marker>
          </defs>
          {graph.boundaries?.map((boundary) => (
            <g key={boundary.label}>
              <rect
                x={boundary.x}
                y={boundary.y}
                width={boundary.w}
                height={boundary.h}
                rx="12"
                fill="none"
                stroke="var(--border)"
                strokeDasharray="4 5"
              />
              <text
                x={boundary.x + 16}
                y={boundary.y - 14}
                fontSize="12"
                fill="var(--muted-foreground)"
              >
                {boundary.label}
              </text>
            </g>
          ))}
          {graph.edges.map((edge) => (
            <g key={`${edge.from}-${edge.to}`}>
              <path
                d={edge.path}
                fill="none"
                stroke="var(--foreground-faint)"
                strokeWidth="1.5"
                markerEnd={`url(#${arrow})`}
                strokeLinejoin="round"
              />
              <text
                x={edge.x}
                y={edge.y}
                textAnchor="middle"
                fill="var(--foreground-2)"
                stroke="var(--card)"
                strokeWidth="6"
                paintOrder="stroke"
                fontSize="12"
              >
                {edge.label}
              </text>
            </g>
          ))}
          {graph.nodes.map((node) => (
            <GraphNode key={node.id} node={node} />
          ))}
        </svg>
      </div>
      <details className="border-t px-5 py-4 text-meta md:px-7">
        <summary className="cursor-pointer font-medium">
          Read this flow in text
        </summary>
        <ol className="mt-4 grid gap-3 text-foreground-2 md:grid-cols-2">
          {graph.edges.map((edge) => (
            <li key={`${edge.from}-${edge.to}`}>
              <strong className="font-medium text-foreground">
                {graph.nodes.find((n) => n.id === edge.from)!.title}
              </strong>{" "}
              → <span>{edge.label}</span> →{" "}
              <strong className="font-medium text-foreground">
                {graph.nodes.find((n) => n.id === edge.to)!.title}
              </strong>
            </li>
          ))}
        </ol>
        {graph.nodes
          .filter((n) => n.shape === "note")
          .map((node) => (
            <p key={node.id} className="mt-3 text-foreground-2">
              {node.title}: {node.lines.join(" · ")}
            </p>
          ))}
      </details>
    </figure>
  );
}
