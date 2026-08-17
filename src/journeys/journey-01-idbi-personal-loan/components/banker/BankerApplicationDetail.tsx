import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, Download, FolderOpen, LayoutList } from 'lucide-react';
import InlineNotice from '../InlineNotice';
import { MOCK_APPLICATION_DETAIL } from './mockBankerData.constants';
import type { BankerApplicationSummary } from './mockBankerData.constants';
import './BankerApplicationDetail.css';

function statusPillClass(status: BankerApplicationSummary['status']): string {
  return `banker-status-pill banker-status-pill--${status.toLowerCase().replace(/\s+/g, '-')}`;
}

export type ApplicationDetailTab = 'overview' | 'documents';

interface BankerApplicationDetailProps {
  application: BankerApplicationSummary;
  activeTab: ApplicationDetailTab;
  onTabChange: (tab: ApplicationDetailTab) => void;
  onBackToApplications: () => void;
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}.00`;
}

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
}

function AccordionSection({ title, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="banker-accordion">
      <button
        type="button"
        className="banker-accordion-header"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`banker-accordion-chevron ${open ? 'banker-accordion-chevron--open' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="banker-accordion-body">{children}</div>}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="banker-detail-field">
      <span className="banker-detail-label">{label}</span>
      <span className="banker-detail-value">{value}</span>
    </div>
  );
}

/**
 * Single-application drill-down — breadcrumb + summary header + a left
 * nav (Application Overview / Documents) switching the right-hand panel.
 * The Overview fields merge the clicked row (ID, name, requested amount)
 * with a fixed mock detail template for everything else — a deliberate
 * prototype shortcut (see mockBankerData.constants.ts) rather than a
 * fully unique record per mock application.
 */
function BankerApplicationDetail({
  application,
  activeTab,
  onTabChange,
  onBackToApplications,
}: BankerApplicationDetailProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const { personal, address, employment, loan, documents } = MOCK_APPLICATION_DETAIL;

  return (
    <main className="banker-main banker-detail-main">
      <nav className="banker-breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="banker-breadcrumb-link" onClick={onBackToApplications}>
          All Applications
        </button>
        <span aria-hidden="true">/</span>
        <span className="banker-breadcrumb-current">{application.id}</span>
      </nav>

      <div className="banker-detail-summary">
        <div>
          <span className="banker-detail-summary-id">ID: {application.id}</span>
          <div className="banker-detail-summary-name-row">
            <h1 className="banker-detail-summary-name">{application.applicantName}</h1>
            <span className={statusPillClass(application.status)}>{application.status}</span>
          </div>
        </div>
        <div className="banker-detail-summary-meta">
          <div>
            <span className="banker-detail-summary-meta-label">Date of Application</span>
            <span className="banker-detail-summary-meta-value">{application.createdOn}</span>
          </div>
          <div>
            <span className="banker-detail-summary-meta-label">Loan Amount</span>
            <span className="banker-detail-summary-meta-value">{formatInr(application.requestedLoanAmount)}</span>
          </div>
          <div>
            <span className="banker-detail-summary-meta-label">Tenure</span>
            <span className="banker-detail-summary-meta-value">{loan.tenureYears * 12} months</span>
          </div>
        </div>
      </div>

      <div className="banker-detail-layout">
        <aside className="banker-detail-sidebar">
          <div className="banker-detail-search">
            <input type="text" placeholder="Search" aria-label="Search this application" />
          </div>
          <button
            type="button"
            className={`banker-detail-nav-item ${activeTab === 'overview' ? 'banker-detail-nav-item--active' : ''}`}
            onClick={() => onTabChange('overview')}
          >
            <LayoutList size={15} aria-hidden="true" />
            Application Overview
          </button>
          <button
            type="button"
            className={`banker-detail-nav-item ${activeTab === 'documents' ? 'banker-detail-nav-item--active' : ''}`}
            onClick={() => onTabChange('documents')}
          >
            <FolderOpen size={15} aria-hidden="true" />
            Documents
          </button>
        </aside>

        <div className="banker-detail-content">
          {notice && <InlineNotice message={notice} />}

          {activeTab === 'overview' ? (
            <>
              <h2 className="banker-detail-content-title">Application Overview</h2>

              <AccordionSection title="Personal Details">
                <div className="banker-detail-grid">
                  <DetailField label="First Name" value={personal.firstName} />
                  <DetailField label="Middle Name" value={personal.middleName} />
                  <DetailField label="Last Name" value={personal.lastName} />
                  <DetailField label="Date of Birth" value={personal.dateOfBirth} />
                  <DetailField label="PAN" value={personal.pan} />
                  <DetailField label="Gender" value={personal.gender} />
                  <DetailField label="Mobile No" value={personal.mobileNo} />
                  <DetailField label="Father's Name" value={personal.fathersName} />
                  <DetailField label="Education Qualification" value={personal.educationQualification} />
                  <DetailField label="Marital Status" value={personal.maritalStatus} />
                  <DetailField label="Last 4 digit Aadhaar Number" value={personal.aadhaarLast4} />
                </div>
              </AccordionSection>

              <AccordionSection title="Address Details">
                <div className="banker-detail-grid">
                  <DetailField label="House No" value={address.houseNo} />
                  <DetailField label="Street" value={address.street} />
                  <DetailField label="Post Office Name" value={address.postOfficeName} />
                  <DetailField label="Landmark" value={address.landmark} />
                  <DetailField label="District" value={address.district} />
                  <DetailField label="State" value={address.state} />
                  <DetailField label="Pincode" value={address.pincode} />
                  <DetailField label="Country" value={address.country} />
                </div>
              </AccordionSection>

              <AccordionSection title="Employment Details">
                <div className="banker-detail-grid">
                  <DetailField label="Occupation Type" value={employment.occupationType} />
                  <DetailField label="Office/Company Name" value={employment.officeCompanyName} />
                  <DetailField label="Employment Type" value={employment.employmentType} />
                  <DetailField label="Employer Type" value={employment.employerType} />
                  <DetailField label="Designation" value={employment.designation} />
                  <DetailField label="Department" value={employment.department} />
                  <DetailField label="No of yrs in Current Org" value={employment.yearsInCurrentOrg} />
                  <DetailField label="No of Dependents" value={employment.noOfDependents} />
                  <DetailField label="Employee Code" value={employment.employeeCode} />
                  <DetailField label="Office Mobile Number" value={employment.officeMobileNumber} />
                  <DetailField label="Office Email ID" value={employment.officeEmailId} />
                  <DetailField label="Office Address" value={employment.officeAddress} />
                </div>
              </AccordionSection>

              <AccordionSection title="Loan Details">
                <div className="banker-detail-grid">
                  <DetailField label="Total Loan Amount" value={formatInr(application.requestedLoanAmount)} />
                  <DetailField label="Loan Tenure" value={`${loan.tenureYears} years`} />
                  <DetailField label="Rate of Interest" value={`${loan.rateOfInterestPercent}%`} />
                  <DetailField label="Monthly Installment (EMI)" value={formatInr(loan.monthlyEmi)} />
                </div>
              </AccordionSection>
            </>
          ) : (
            <>
              <div className="banker-detail-documents-header">
                <h2 className="banker-detail-content-title">Documents</h2>
                <button
                  type="button"
                  className="banker-download-all-btn"
                  onClick={() => setNotice('Download All Documents is coming soon.')}
                >
                  <Download size={14} aria-hidden="true" />
                  Download All Documents
                </button>
              </div>

              <div className="banker-panel banker-table-panel">
                <table className="banker-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Type of Documents</th>
                      <th>Uploaded File</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document, index) => (
                      <tr key={document.id}>
                        <td>{String(index + 1).padStart(2, '0')}</td>
                        <td>{document.label}</td>
                        <td>{document.fileType}</td>
                        <td>
                          <button
                            type="button"
                            className="banker-view-link"
                            onClick={() => setNotice(`Download for ${document.label} is coming soon.`)}
                          >
                            <Download size={13} aria-hidden="true" className="banker-download-icon" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default BankerApplicationDetail;
