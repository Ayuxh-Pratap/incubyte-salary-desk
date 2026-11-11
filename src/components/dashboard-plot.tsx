"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import {
  Chart,
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
export const seriesTokens = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-5",
  "--foreground-2",
  "--foreground-faint",
];
Chart.register(
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
);
type Instance = Chart<"bar" | "doughnut", number[], string>;
type Props = {
  type: "bar" | "doughnut";
  labels: string[];
  values: number[];
  tooltip: (index: number) => string;
  onPick?: (index: number) => void;
  label: string;
  horizontal?: boolean;
};
function themeSnapshot() {
  const root = document.documentElement,
    style = getComputedStyle(root),
    token = (name: string) => style.getPropertyValue(name).trim();
  return {
    mode: root.classList.contains("dark") ? "dark" : "light",
    text: token("--foreground-2"),
    card: token("--card"),
    border: token("--border"),
    colors: seriesTokens.map(token),
    font: getComputedStyle(document.body).fontFamily,
  };
}
type Theme = ReturnType<typeof themeSnapshot>;
function scales(theme: Theme, horizontal: boolean) {
  return {
    x: {
      beginAtZero: true,
      grid: { display: horizontal, color: theme.border },
      ticks: {
        precision: 0,
        color: theme.text,
        font: { family: theme.font, size: 12 },
        maxRotation: 0,
        autoSkip: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: { display: !horizontal, color: theme.border },
      ticks: {
        precision: 0,
        color: theme.text,
        font: { family: theme.font, size: 12 },
      },
    },
  };
}
function applyTheme(
  chart: Instance,
  theme: Theme,
  horizontal: boolean,
  type: Props["type"],
) {
  chart.options.color = theme.text;
  chart.options.font = { family: theme.font };
  const dataset = chart.data.datasets[0];
  dataset.backgroundColor =
    type === "doughnut" ? theme.colors : theme.colors[0];
  dataset.borderColor = theme.card;
  if (type === "bar") chart.options.scales = scales(theme, horizontal);
}
function mark(chart: Instance, theme: Theme) {
  chart.canvas.dataset.theme = theme.mode;
  chart.canvas.dataset.axisColor = theme.text;
  chart.canvas.dataset.values = JSON.stringify(chart.data.datasets[0].data);
}
export function Plot({
  type,
  labels,
  values,
  tooltip,
  onPick,
  label,
  horizontal = false,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null),
    instance = useRef<Instance | null>(null),
    lastData = useRef(""),
    lastTheme = useRef("");
  const { resolvedTheme } = useTheme(),
    reduced = useReducedMotion();
  const latest = useRef({ labels, values, tooltip, onPick, reduced });
  useLayoutEffect(() => {
    latest.current = { labels, values, tooltip, onPick, reduced };
  }, [labels, values, tooltip, onPick, reduced]);
  const dataKey = JSON.stringify([labels, values]);
  // Instance lifetime follows the canvas and chart kind, not allocation identities from React renders.
  useEffect(() => {
    if (!canvas.current) return;
    const current = latest.current,
      theme = themeSnapshot();
    const config: ChartConfiguration<"bar" | "doughnut", number[], string> = {
      type,
      data: {
        labels: [...current.labels],
        datasets: [
          {
            data: [...current.values],
            backgroundColor:
              type === "doughnut" ? theme.colors : theme.colors[0],
            borderColor: theme.card,
            borderWidth: type === "doughnut" ? 2 : 0,
            borderRadius: type === "bar" ? 4 : 0,
          },
        ],
      },
      options: {
        indexAxis: horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        color: theme.text,
        font: { family: theme.font },
        animation: current.reduced ? false : { duration: 240 },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => latest.current.labels[items[0]?.dataIndex ?? 0],
              label: (item) => latest.current.tooltip(item.dataIndex),
            },
          },
        },
        onClick: (_event, elements) => {
          if (elements[0]) latest.current.onPick?.(elements[0].index);
        },
        ...(type === "bar"
          ? { scales: scales(theme, horizontal) }
          : { cutout: "68%" }),
      },
    };
    const chart = new Chart(canvas.current, config);
    instance.current = chart;
    lastData.current = JSON.stringify([current.labels, current.values]);
    lastTheme.current = JSON.stringify(theme);
    mark(chart, theme);
    return () => {
      chart.destroy();
      instance.current = null;
    };
  }, [type, horizontal]);
  useEffect(() => {
    const chart = instance.current;
    if (!chart || lastData.current === dataKey) return;
    const current = latest.current;
    chart.data.labels = [...current.labels];
    chart.data.datasets[0].data = [...current.values];
    lastData.current = dataKey;
    mark(chart, themeSnapshot());
    chart.update(current.reduced ? "none" : undefined);
  }, [dataKey]);
  // next-themes applies the root class in an effect; read the resulting CSS on the next frame.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const chart = instance.current;
      if (!chart) return;
      const theme = themeSnapshot(),
        key = JSON.stringify(theme);
      const animation = latest.current.reduced ? false : { duration: 240 };
      chart.options.animation = animation;
      if (lastTheme.current !== key || latest.current.reduced) {
        applyTheme(chart, theme, horizontal, type);
        lastTheme.current = key;
        chart.stop();
        chart.update("none");
      }
      mark(chart, theme);
    });
    return () => cancelAnimationFrame(frame);
  }, [resolvedTheme, reduced, horizontal, type]);
  return (
    <div className="flex h-64 min-w-0 items-center">
      <div
        className={
          type === "doughnut"
            ? "relative h-52 w-full min-w-0"
            : "relative h-64 w-full min-w-0"
        }
      >
        <canvas ref={canvas} role="img" aria-label={label}>
          Exact values are provided in the accompanying text.
        </canvas>
      </div>
    </div>
  );
}
