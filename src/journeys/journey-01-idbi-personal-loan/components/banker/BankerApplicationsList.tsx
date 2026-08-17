import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import InlineNotice from '../InlineNotice';
import { MOCK_BANKER_APPLICATIONS } from './mockBankerData.constants';
import type { BankerApplicationSummary } from './mockBankerData.constants';
import './BankerApplicationsList.css';

interface BankerApplicationsListProps {
  onViewApplication: (application: BankerApplicationSummary) => void;
}

const STATUS_FILTER_OPTIONS = ['All', 'Approved', 'Pending', 'In Progress', 'Rejected'] as const;

function formatInr(amount: number): string {
  return amount.toLocaleString('en-IN') + '.00';
}

function statusPillClass(status: BankerApplicationSummary['status']): string {
  return `banker-status-pill banker-status-pill--${status.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * "All Application" screen — search by application ID and filter by
 * status both actually work (simple array filtering against the mock
 * list); the "Filter" button stands for a fuller filter panel out of
 * scope for this pass, so it shows an inline "coming soon" notice, the
 * same convention already used elsewhere in this journey for mocked
 * actions (see components/customer/Step1GetStarted.tsx).
 */
function BankerApplicationsList({ onViewApplication }: BankerApplicationsListProps) {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTER_OPTIONS)[number]>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return MOCK_BANKER_APPLICATIONS.filter((application) => {
      const matchesStatus = statusFilter === 'All' || application.status === statusFilter;
      const matchesSearch = normalizedSearch.length === 0 || application.id.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchTerm]);

  return (
    <main className="banker-main">
      <div className="banker-applications-heading-row">
        <h1 className="banker-page-heading">{MOCK_BANKER_APPLICATIONS.length} Applications</h1>
        <div className="banker-applications-controls">
          <select
            className="banker-filter-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as (typeof STATUS_FILTER_OPTIONS)[number])}
            aria-label="Filter by status"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'All' ? 'All Statuses' : option}
              </option>
            ))}
          </select>
          <div className="banker-search-field">
            <Search size={14} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by application ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search by application ID"
            />
          </div>
          <button
            type="button"
            className="banker-filter-btn"
            onClick={() => setNotice('Advanced filters are coming soon.')}
          >
            <Filter size={14} aria-hidden="true" />
            Filter
          </button>
        </div>
      </div>

      {notice && (
        <div className="banker-notice-wrap">
          <InlineNotice message={notice} />
        </div>
      )}

      <div className="banker-panel banker-table-panel">
        <table className="banker-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Application ID</th>
              <th>Created On</th>
              <th>Applicant Name</th>
              <th>Requested Loan Amount (INR)</th>
              <th>Sanctioned Loan Amount (INR)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application, index) => (
              <tr key={application.id}>
                <td>{String(index + 1).padStart(2, '0')}</td>
                <td>
                  <button
                    type="button"
                    className="banker-table-id-link"
                    onClick={() => onViewApplication(application)}
                  >
                    {application.id}
                  </button>
                </td>
                <td>{application.createdOn}</td>
                <td>{application.applicantName}</td>
                <td>{formatInr(application.requestedLoanAmount)}</td>
                <td>{application.sanctionedLoanAmount !== null ? formatInr(application.sanctionedLoanAmount) : '—'}</td>
                <td>
                  <span className={statusPillClass(application.status)}>{application.status}</span>
                </td>
                <td>
                  <button type="button" className="banker-view-link" onClick={() => onViewApplication(application)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filteredApplications.length === 0 && (
              <tr>
                <td colSpan={8} className="banker-table-empty">
                  No applications match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default BankerApplicationsList;
