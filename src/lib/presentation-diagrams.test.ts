import { describe, it, expect } from "vitest";
import diagrams from "../../docs/presentation-diagrams.json";
type Graph = {
  width: number;
  height: number;
  nodes: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    shape?: string;
  }[];
  edges: { from: string; to: string; label: string }[];
};
const data = diagrams as unknown as Record<
  string,
  { kind: string; graph?: Graph }
>;
describe("case-study flowchart integrity", () => {
  it("connects named nodes inside each diagram canvas", () => {
    for (const diagram of Object.values(data).filter(
      (d) => d.kind !== "timeline",
    )) {
      expect(diagram.graph).toBeDefined();
      const graph = diagram.graph!;
      const ids = new Set(graph.nodes.map((n) => n.id));
      expect(ids.size).toBe(graph.nodes.length);
      expect(graph.edges.length).toBeGreaterThan(0);
      for (const edge of graph.edges) {
        expect(ids.has(edge.from)).toBe(true);
        expect(ids.has(edge.to)).toBe(true);
        expect(edge.label.length).toBeGreaterThan(0);
      }
      for (const node of graph.nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.x + node.w).toBeLessThanOrEqual(graph.width);
        expect(node.y + node.h).toBeLessThanOrEqual(graph.height);
      }
    }
  });
  it("shows alternative outcomes for validation, conflicts and freshness decisions", () => {
    for (const key of ["salary", "cache"]) {
      const graph = data[key].graph!;
      expect(graph).toBeDefined();
      const decisions = graph.nodes.filter((n) => n.shape === "decision");
      expect(decisions.length).toBeGreaterThan(0);
      for (const decision of decisions)
        expect(
          graph.edges.filter((e) => e.from === decision.id).length,
        ).toBeGreaterThanOrEqual(2);
    }
  });
  it("does not present the environment marker as an employee foreign key", () => {
    const graph = data.model.graph!;
    expect(graph).toBeDefined();
    expect(
      graph.edges.filter((e) => e.from === "employees" || e.to === "employees"),
    ).toHaveLength(4);
    expect(
      graph.edges.some(
        (e) => e.from === "environment" || e.to === "environment",
      ),
    ).toBe(false);
  });
});
