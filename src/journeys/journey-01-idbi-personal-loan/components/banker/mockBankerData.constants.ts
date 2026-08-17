/**
 * Mock data for the Banker workspace only. Entirely fictional placeholder
 * data — not modeled on any real person — kept in this file so the whole
 * Banker folder (components/banker/) never needs anything from
 * components/customer/ or vice versa (see CLAUDE.md rule 1/2 and this
 * journey's folder-isolation requirement between the two roles).
 */

export type BankerApplicationStatus = 'Approved' | 'Pending' | 'In Progress' | 'Rejected';

export interface BankerApplicationSummary {
  id: string;
  createdOn: string;
  applicantName: string;
  requestedLoanAmount: number;
  sanctionedLoanAmount: number | null;
  status: BankerApplicationStatus;
}

export const MOCK_BANKER_APPLICATIONS: BankerApplicationSummary[] = [
  { id: 'IDBI223125676743', createdOn: '31-May-2024', applicantName: 'Ritik Chauhan', requestedLoanAmount: 1100000, sanctionedLoanAmount: 1100000, status: 'Approved' },
  { id: 'IDBI326547891023', createdOn: '15-Jun-2024', applicantName: 'Sana Malik', requestedLoanAmount: 2200000, sanctionedLoanAmount: 2200000, status: 'Approved' },
  { id: 'IDBI874512369874', createdOn: '20-Jul-2024', applicantName: 'Aarav Singh', requestedLoanAmount: 1550000, sanctionedLoanAmount: null, status: 'Pending' },
  { id: 'IDBI199876543210', createdOn: '10-Aug-2024', applicantName: 'Meera Joshi', requestedLoanAmount: 900000, sanctionedLoanAmount: 900000, status: 'Approved' },
  { id: 'IDBI456789123456', createdOn: '05-Sep-2024', applicantName: 'Dev Anand', requestedLoanAmount: 3000000, sanctionedLoanAmount: null, status: 'In Progress' },
  { id: 'IDBI234567890123', createdOn: '12-Oct-2024', applicantName: 'Riya Sharma', requestedLoanAmount: 1875000, sanctionedLoanAmount: 1875000, status: 'Approved' },
  { id: 'IDBI987654321098', createdOn: '22-Nov-2024', applicantName: 'Vikram Patel', requestedLoanAmount: 1200000, sanctionedLoanAmount: null, status: 'Rejected' },
  { id: 'IDBI321654987012', createdOn: '18-Dec-2024', applicantName: 'Pooja Verma', requestedLoanAmount: 2500000, sanctionedLoanAmount: 2500000, status: 'Approved' },
  { id: 'IDBI123456789012', createdOn: '30-Jan-2025', applicantName: 'Karan Yadav', requestedLoanAmount: 1450000, sanctionedLoanAmount: null, status: 'In Progress' },
  { id: 'IDBI234567890', createdOn: '27-Feb-2025', applicantName: 'Sneha Rao', requestedLoanAmount: 2000000, sanctionedLoanAmount: 2000000, status: 'Approved' },
];

export const DASHBOARD_STATS = {
  totalApplications: 48,
  totalApplicationsDeltaPercent: 20,
  totalApplicationsDeltaDirection: 'up' as const,
  sanctionedApplications: 28,
  sanctionedDeltaPercent: 20,
  sanctionedDeltaDirection: 'up' as const,
  disbursed: 11,
  disbursedDeltaPercent: 20,
  disbursedDeltaDirection: 'down' as const,
  totalDisbursedAmountLabel: '₹20.80 L',
  totalDisbursedDeltaPercent: 20,
  totalDisbursedDeltaDirection: 'up' as const,
};

export const APPLICATION_STATUS_BREAKDOWN: Array<{ status: BankerApplicationStatus; count: number }> = [
  { status: 'Approved', count: 22 },
  { status: 'Pending', count: 9 },
  { status: 'In Progress', count: 13 },
  { status: 'Rejected', count: 4 },
];

/**
 * Stands in for the reference design's India choropleth map — same "where
 * are applications coming from" story, as a ranked regional breakdown
 * instead. Chosen deliberately over a real state-boundary map for this
 * prototype (see conversation) — far less effort and no risk of an
 * inaccurate map outline in front of a client.
 */
export const REGIONAL_BREAKDOWN = [
  { region: 'Maharashtra', count: 11 },
  { region: 'Delhi NCR', count: 9 },
  { region: 'Karnataka', count: 7 },
  { region: 'Gujarat', count: 6 },
  { region: 'Tamil Nadu', count: 5 },
  { region: 'Uttar Pradesh', count: 5 },
  { region: 'Rajasthan', count: 3 },
  { region: 'West Bengal', count: 2 },
];

/**
 * Fixed detail template merged with whichever row a banker clicks "View"
 * on (application ID, applicant name, requested amount come from the
 * clicked row) — a reasonable prototype shortcut rather than authoring a
 * full unique detail record per mock application.
 */
export const MOCK_APPLICATION_DETAIL = {
  personal: {
    firstName: 'Ritik',
    middleName: 'Kumar',
    lastName: 'Chauhan',
    dateOfBirth: '26/03/1999',
    pan: 'XXXXXXGHQ',
    gender: 'Male',
    mobileNo: '9891244081',
    fathersName: 'Trilok Singh Chauhan',
    educationQualification: 'Graduate',
    maritalStatus: 'Single',
    aadhaarLast4: 'XXXXXXXX7201',
  },
  address: {
    houseNo: 'A-1229',
    street: 'Dabua Colony',
    postOfficeName: 'Faridabad NIT',
    landmark: 'NIT',
    district: 'Faridabad',
    state: 'Haryana',
    pincode: '121001',
    country: 'India',
  },
  employment: {
    occupationType: 'Salaried',
    officeCompanyName: 'Nova Retail Pvt. Ltd.',
    employmentType: 'Full-time',
    employerType: 'Private',
    designation: 'Designer',
    department: 'IT',
    yearsInCurrentOrg: '3 years',
    noOfDependents: 2,
    employeeCode: 'S0523',
    officeMobileNumber: '8700395027',
    officeEmailId: 'r.chauhan@novaretail.example',
    officeAddress: '607-611, 06th Floor, Tower B, Unitech Business Zone',
  },
  loan: {
    tenureYears: 10,
    rateOfInterestPercent: 13.2,
    monthlyEmi: 12000,
  },
  documents: [
    { id: 'cam-report', label: 'CAM Report', fileType: 'PDF' },
    { id: 'sanction-letter', label: 'Sanction Letter', fileType: 'PDF' },
    { id: 'key-fact-statement', label: 'Key Fact Statement', fileType: 'PDF' },
  ],
};
