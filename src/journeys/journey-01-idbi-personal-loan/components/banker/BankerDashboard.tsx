import type { ComponentType } from 'react';
import { ArrowDownRight, ArrowUpRight, Banknote, CheckCircle2, FileStack, Wallet } from 'lucide-react';
import {
  APPLICATION_STATUS_BREAKDOWN,
  DASHBOARD_STATS,
  REGIONAL_BREAKDOWN,
} from './mockBankerData.constants';
import './BankerDashboard.css';

interface BankerDashboardProps {
  onViewAllApplications: () => void;
}

interface StatTileProps {
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  label: string;
  value: string;
  deltaPercent: number;
  deltaDirection: 'up' | 'down';
  /** Whether an "up" reading is the favorable direction for this metric —
   *  drives delta color independently of the arrow direction itself (e.g.
   *  "Disbursed" trending down is unfavorable even though the arrow points
   *  down, same visual language as the reference dashboard). */
  isUpGood: boolean;
}

function StatTile({ icon: Icon, label, value, deltaPercent, deltaDirection, isUpGood }: StatTileProps) {
  const isFavorable = deltaDirection === 'up' ? isUpGood : !isUpGood;
  const DeltaIcon = deltaDirection === 'up' ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="banker-stat-tile">
      <span className="banker-stat-icon" aria-hidden="true">
        <Icon size={17} />
      </span>
      <span className="banker-stat-label">{label}</span>
      <span className="banker-stat-value">{value}</span>
      <span className={`banker-stat-delta ${isFavorable ? 'banker-stat-delta--good' : 'banker-stat-delta--bad'}`}>
        <DeltaIcon size={13} aria-hidden="true" />
        {deltaDirection === 'up' ? 'Up' : 'Down'} by {deltaPercent}%
        <span className="banker-stat-delta-context">vs previous year</span>
      </span>
    </div>
  );
}

/* Categorical palette for the four application statuses — validated for
   adjacent CVD-safety in this exact order (worst adjacent CVD ΔE 9.1,
   normal-vision ΔE 22.9; contrast-vs-surface WARN mitigated below via
   direct value labels + a legend, per the dataviz skill's relief rule). */
const STATUS_COLORS: Record<string, string> = {
  Approved: '#1baf7a',
  Pending: '#eda100',
  'In Progress': '#2a78d6',
  Rejected: '#e34948',
};

function ApplicationStatusChart() {
  const maxCount = Math.max(...APPLICATION_STATUS_BREAKDOWN.map((item) => item.count));

  return (
    <div className="banker-panel banker-status-chart">
      <h2 className="banker-panel-title">Application Status</h2>
      <div className="banker-bar-chart" role="img" aria-label="Application status breakdown by count">
        {APPLICATION_STATUS_BREAKDOWN.map((item) => {
          const heightPercent = (item.count / maxCount) * 100;
          return (
            <div className="banker-bar-col" key={item.status}>
              <span className="banker-bar-value">{item.count}</span>
              <div className="banker-bar-track">
                <div
                  className="banker-bar-fill"
                  style={{ height: `${heightPercent}%`, background: STATUS_COLORS[item.status] }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="banker-chart-legend">
        {APPLICATION_STATUS_BREAKDOWN.map((item) => (
          <span className="banker-legend-item" key={item.status}>
            <span
              className="banker-legend-swatch"
              style={{ background: STATUS_COLORS[item.status] }}
              aria-hidden="true"
            />
            {item.status}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Ranked regional breakdown — stands in for the reference design's India
 * choropleth map (see mockBankerData.constants.ts comment for why).
 */
function RegionalBreakdown({ onViewAllApplications }: { onViewAllApplications: () => void }) {
  const maxCount = Math.max(...REGIONAL_BREAKDOWN.map((region) => region.count));

  return (
    <div className="banker-panel banker-regional-panel">
      <h2 className="banker-panel-title">Applications by Region</h2>
      <ul className="banker-regional-list">
        {REGIONAL_BREAKDOWN.map((region) => (
          <li className="banker-regional-row" key={region.region}>
            <span className="banker-regional-name">{region.region}</span>
            <div className="banker-regional-track">
              <div className="banker-regional-fill" style={{ width: `${(region.count / maxCount) * 100}%` }} />
            </div>
            <span className="banker-regional-count">{region.count}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="banker-view-all-link" onClick={onViewAllApplications}>
        View All
      </button>
    </div>
  );
}

function BankerDashboard({ onViewAllApplications }: BankerDashboardProps) {
  return (
    <main className="banker-main">
      <div className="banker-dashboard-heading-row">
        <h1 className="banker-page-heading">Welcome to your Dashboard</h1>
        <div className="banker-dashboard-filters">
          <select className="banker-filter-select" defaultValue="all-time" aria-label="Time range">
            <option value="all-time">All Time</option>
          </select>
          <select className="banker-filter-select" defaultValue="all-region" aria-label="Region">
            <option value="all-region">All Region</option>
          </select>
        </div>
      </div>

      <div className="banker-stat-grid">
        <StatTile
          icon={FileStack}
          label="Total Application"
          value={String(DASHBOARD_STATS.totalApplications)}
          deltaPercent={DASHBOARD_STATS.totalApplicationsDeltaPercent}
          deltaDirection={DASHBOARD_STATS.totalApplicationsDeltaDirection}
          isUpGood
        />
        <StatTile
          icon={CheckCircle2}
          label="Sanctioned Application"
          value={String(DASHBOARD_STATS.sanctionedApplications)}
          deltaPercent={DASHBOARD_STATS.sanctionedDeltaPercent}
          deltaDirection={DASHBOARD_STATS.sanctionedDeltaDirection}
          isUpGood
        />
        <StatTile
          icon={Banknote}
          label="Disbursed"
          value={String(DASHBOARD_STATS.disbursed)}
          deltaPercent={DASHBOARD_STATS.disbursedDeltaPercent}
          deltaDirection={DASHBOARD_STATS.disbursedDeltaDirection}
          isUpGood
        />
        <StatTile
          icon={Wallet}
          label="Total Disbursed Loan Amount"
          value={DASHBOARD_STATS.totalDisbursedAmountLabel}
          deltaPercent={DASHBOARD_STATS.totalDisbursedDeltaPercent}
          deltaDirection={DASHBOARD_STATS.totalDisbursedDeltaDirection}
          isUpGood
        />
      </div>

      <div className="banker-panel-row">
        <ApplicationStatusChart />
        <RegionalBreakdown onViewAllApplications={onViewAllApplications} />
      </div>
    </main>
  );
}

export default BankerDashboard;
