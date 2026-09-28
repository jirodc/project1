import { useState } from 'react';
import { useElementWidth } from '../../hooks/useElementWidth.js';
import Tabs from '../common/Tabs.jsx';
import { Table, TBody, Td, Th } from '../common/Table.jsx';

const HEIGHT = 220;
const PAD = { top: 20, right: 44, bottom: 40, left: 44 };
const ACCENT = '#4f46e5'; // indigo-600, validated against the white surface
const GRID = '#e2e8f0'; // slate-200 hairline
const MUTED = '#475569'; // slate-600 axis text
const STEP = 0.25;

const shortLabel = (term) => `${term.semester.replace(' Semester', ' Sem')} ${term.academicYear.replace(/20(\d\d)/g, '$1')}`;

/**
 * GWA per completed semester. Philippine GWAs run 1.00 (best) to 5.00, so the
 * y-axis is inverted: higher on the chart means a better grade.
 */
export default function GwaTrendChart({ terms }) {
  const [view, setView] = useState('chart');
  const [ref, width] = useElementWidth();
  const [activeIndex, setActiveIndex] = useState(null);

  const points = terms.filter((term) => term.gwa != null);
  const values = points.map((term) => term.gwa);
  const best = Math.floor(Math.min(...values) / STEP) * STEP - STEP;
  const worst = Math.ceil(Math.max(...values) / STEP) * STEP + STEP;
  const ticks = [];
  for (let tick = best; tick <= worst + 1e-9; tick += STEP) ticks.push(Math.round(tick * 100) / 100);

  const plotWidth = Math.max(0, width - PAD.left - PAD.right);
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (index) => PAD.left + (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const y = (value) => PAD.top + ((value - best) / (worst - best)) * plotHeight;

  const path = points.map((term, index) => `${index ? 'L' : 'M'}${x(index)},${y(term.gwa)}`).join(' ');
  const active = activeIndex != null ? points[activeIndex] : null;
  const last = points.length - 1;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Lower is better · 1.00 is the highest grade</p>
        <Tabs
          label="GWA trend view"
          value={view}
          onChange={setView}
          tabs={[
            { value: 'chart', label: 'Chart' },
            { value: 'table', label: 'Table' },
          ]}
        />
      </div>

      {view === 'table' ? (
        <Table caption="GWA per semester" minWidth="min-w-0">
          <thead>
            <tr>
              <Th>Semester</Th>
              <Th align="right">Units</Th>
              <Th align="right">GWA</Th>
            </tr>
          </thead>
          <TBody>
            {points.map((term) => (
              <tr key={term.id}>
                <Td>{term.label}</Td>
                <Td align="right">{term.units}</Td>
                <Td align="right">{term.gwa.toFixed(2)}</Td>
              </tr>
            ))}
          </TBody>
        </Table>
      ) : (
        <div ref={ref} className="relative" style={{ height: HEIGHT }}>
          {width > 0 && (
            <svg width={width} height={HEIGHT} role="img" aria-label="Line chart of GWA per semester">
              {ticks.map((tick) => (
                <g key={tick}>
                  <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth="1" />
                  <text x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end" fontSize="11" fill={MUTED} className="tabular-nums">
                    {tick.toFixed(2)}
                  </text>
                </g>
              ))}

              {points.map((term, index) => (
                <text key={term.id} x={x(index)} y={HEIGHT - 14} textAnchor="middle" fontSize="11" fill={MUTED}>
                  {shortLabel(term)}
                </text>
              ))}

              {active && (
                <line x1={x(activeIndex)} x2={x(activeIndex)} y1={PAD.top} y2={PAD.top + plotHeight} stroke="#cbd5e1" strokeWidth="1" />
              )}

              <path d={path} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

              {points.map((term, index) => (
                <circle
                  key={term.id}
                  cx={x(index)}
                  cy={y(term.gwa)}
                  r={index === activeIndex ? 5.5 : 4.5}
                  fill={ACCENT}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {/* Direct label on the latest point only. */}
              <text x={x(last) + 10} y={y(points[last].gwa)} dy="0.32em" fontSize="12" fontWeight="600" fill="#0f172a">
                {points[last].gwa.toFixed(2)}
              </text>

              {/* Hover/focus bands: each covers its point's share of the width. */}
              {points.map((term, index) => {
                const half = points.length === 1 ? plotWidth / 2 : plotWidth / (points.length - 1) / 2;
                return (
                  <rect
                    key={term.id}
                    x={x(index) - half}
                    y={PAD.top}
                    width={half * 2}
                    height={plotHeight}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`${term.label}: GWA ${term.gwa.toFixed(2)}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(null)}
                    className="outline-none"
                  />
                );
              })}
            </svg>
          )}

          {active && (
            <div
              className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
              style={{
                left: Math.min(Math.max(x(activeIndex), 80), width - 80),
                top: y(active.gwa) - 12,
              }}
            >
              <p className="font-semibold text-slate-900">{active.label}</p>
              <p className="mt-0.5 text-slate-700">
                GWA <span className="font-semibold tabular-nums">{active.gwa.toFixed(2)}</span> · {active.units} units
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
