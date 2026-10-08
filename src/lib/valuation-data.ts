export interface AppraisalItem {
  id: string;
  assetName: string;
  assetCode: string;
  category: 'Commercial Real Estate' | 'Industrial Machinery' | 'Enterprise Software & IP' | 'Corporate Fleet' | 'Renewable Energy';
  valuationAmount: number;
  bookValue: number;
  status: 'COMPLETED' | 'IN_REVIEW' | 'INSPECTION' | 'DRAFT';
  appraiserName: string;
  appraiserRole: string;
  requestDate: string;
  completionDate?: string;
  location: string;
  methodology: string;
  valuationRange: {
    low: number;
    mid: number;
    high: number;
  };
  summaryNotes: string;
  timeline: {
    title: string;
    description: string;
    date: string;
    actor: string;
    completed: boolean;
    current?: boolean;
  }[];
}

export const APPRAISAL_MOCK_ITEMS: AppraisalItem[] = [
  {
    id: 'aivy-8841',
    assetName: 'Solaria Tower - Commercial Tech Hub',
    assetCode: 'CRE-2026-8841',
    category: 'Commercial Real Estate',
    valuationAmount: 42850000,
    bookValue: 38200000,
    status: 'IN_REVIEW',
    appraiserName: 'Elena Rostova, MRICS',
    appraiserRole: 'Senior Commercial Valuer',
    requestDate: '2026-10-01',
    location: 'Central Business District, Tower 3, Jakarta',
    methodology: 'Discounted Cash Flow (DCF) & Income Capitalization (Cap Rate 6.2%)',
    valuationRange: {
      low: 40500000,
      mid: 42850000,
      high: 44200000,
    },
    summaryNotes: 'Valuation reflects a 94.5% committed occupancy rate with blue-chip tech tenants. Net Operating Income (NOI) grew 7.8% year-on-year, supported by long-term leases expiring after 2030.',
    timeline: [
      {
        title: 'Appraisal Request Initiated',
        description: 'Mandate submitted by Investment Committee for quarterly portfolio revaluation.',
        date: 'Oct 01, 2026',
        actor: 'Marcus Vance (Fund Manager)',
        completed: true,
      },
      {
        title: 'On-Site Technical & Asset Audit',
        description: 'Structural inspection and tenancy schedule verification completed with zero material defects noted.',
        date: 'Oct 03, 2026',
        actor: 'Field Inspection Team',
        completed: true,
      },
      {
        title: 'DCF & Market Comps Synthesis',
        description: 'Discount rate set at 8.75% based on benchmark government 10-year yield plus risk premium.',
        date: 'Oct 06, 2026',
        actor: 'Elena Rostova, MRICS',
        completed: true,
      },
      {
        title: 'Board Audit & Final Certification',
        description: 'Pending sign-off from Chief Valuation Officer prior to ledger update.',
        date: 'Oct 08, 2026',
        actor: 'Audit & Valuation Board',
        completed: false,
        current: true,
      },
    ],
  },
  {
    id: 'aivy-7712',
    assetName: 'High-Precision CNC Robotic Assembler Unit',
    assetCode: 'MAC-2026-7712',
    category: 'Industrial Machinery',
    valuationAmount: 3420000,
    bookValue: 2900000,
    status: 'COMPLETED',
    appraiserName: 'David K. Tanaka, ASA',
    appraiserRole: 'Machinery & Equipment Specialist',
    requestDate: '2026-09-22',
    completionDate: '2026-10-04',
    location: 'Cikarang Industrial Estate, Plant B',
    methodology: 'Depreciated Replacement Cost (DRC) & Secondary Market Direct Comparison',
    valuationRange: {
      low: 3200000,
      mid: 3420000,
      high: 3600000,
    },
    summaryNotes: 'Equipment has completed 3,840 operating hours with immaculate maintenance log. Useful lifespan estimated at 12 remaining years under current operational cadence.',
    timeline: [
      {
        title: 'Appraisal Request Initiated',
        description: 'Revaluation for collateral refinancing with syndication lenders.',
        date: 'Sep 22, 2026',
        actor: 'Finance Dept',
        completed: true,
      },
      {
        title: 'Engineering Telemetry Inspection',
        description: 'Machine health diagnostics run via OEM interface; calibration accuracy at 99.4%.',
        date: 'Sep 27, 2026',
        actor: 'Technical Auditor',
        completed: true,
      },
      {
        title: 'Depreciation Curve Formulation',
        description: 'Applied modified reducing balance depreciation with residual salvage curve.',
        date: 'Oct 02, 2026',
        actor: 'David K. Tanaka, ASA',
        completed: true,
      },
      {
        title: 'Certificate of Valuation Issued',
        description: 'Official valuation stamp #ASA-2026-981 filed to digital vault.',
        date: 'Oct 04, 2026',
        actor: 'Appraisal Board',
        completed: true,
      },
    ],
  },
  {
    id: 'aivy-9024',
    assetName: 'AegisCloud Core Enterprise IP & Patents',
    assetCode: 'IP-2026-9024',
    category: 'Enterprise Software & IP',
    valuationAmount: 18750000,
    bookValue: 14500000,
    status: 'INSPECTION',
    appraiserName: 'Dr. Sarah Lin',
    appraiserRole: 'Intangible Assets Valuer',
    requestDate: '2026-10-04',
    location: 'Digital Asset Custody / Singapore Data Center',
    methodology: 'Relief-from-Royalty Method & Multi-Period Excess Earnings (MPEEM)',
    valuationRange: {
      low: 17200000,
      mid: 18750000,
      high: 20100000,
    },
    summaryNotes: 'Preliminary analysis demonstrates royalty rate baseline of 5.5% on annual net SaaS billings, supported by 3 granted international patents.',
    timeline: [
      {
        title: 'IP Valuation Mandate Logged',
        description: 'Annual statutory impairment and fair-value assessment under IFRS 13.',
        date: 'Oct 04, 2026',
        actor: 'Corporate Legal & M&A',
        completed: true,
      },
      {
        title: 'Patent Freedom-to-Operate & Legal Audit',
        description: 'External IP counsel reviewing validity of jurisdiction filings in US, EU, and JP.',
        date: 'Oct 07, 2026',
        actor: 'Wong & Partners IP Law',
        completed: false,
        current: true,
      },
      {
        title: 'MPEEM Cash Flow Discounting',
        description: 'Projected net excess earnings discounting using WACC of 11.2%.',
        date: 'Pending',
        actor: 'Dr. Sarah Lin',
        completed: false,
      },
      {
        title: 'Final Valuation Opinion',
        description: 'Delivery of certified valuation dossier.',
        date: 'Pending',
        actor: 'Valuation Committee',
        completed: false,
      },
    ],
  },
  {
    id: 'aivy-6519',
    assetName: 'Aurora Solar Farm 45MW Grid Array',
    assetCode: 'REN-2026-6519',
    category: 'Renewable Energy',
    valuationAmount: 26400000,
    bookValue: 24800000,
    status: 'COMPLETED',
    appraiserName: 'Elena Rostova, MRICS',
    appraiserRole: 'Infrastructure Valuer',
    requestDate: '2026-09-10',
    completionDate: '2026-09-28',
    location: 'West Java Renewable Park, Subang',
    methodology: 'PPA Discounted Cash Flow (20-Year Guaranteed Feed-in-Tariff)',
    valuationRange: {
      low: 25100000,
      mid: 26400000,
      high: 27200000,
    },
    summaryNotes: 'Guaranteed Power Purchase Agreement (PPA) with state electricity grid valid through 2042. Photovoltaic degradation within optimal 0.45% annual threshold.',
    timeline: [
      {
        title: 'Project Audit Mandate',
        description: 'Green bond collateral compliance review.',
        date: 'Sep 10, 2026',
        actor: 'Treasury Group',
        completed: true,
      },
      {
        title: 'Yield Production & Irradiance Analysis',
        description: 'Satellite historical telemetry verified with ground sensors.',
        date: 'Sep 18, 2026',
        actor: 'Renewable Engineering Assessor',
        completed: true,
      },
      {
        title: 'PPA Cash Flow Yield Model',
        description: 'Completed sensitivity stress test on battery degradation and inflation adjustments.',
        date: 'Sep 24, 2026',
        actor: 'Elena Rostova, MRICS',
        completed: true,
      },
      {
        title: 'Green Certification Sign-off',
        description: 'Green Bond Appraisal Stamp issued.',
        date: 'Sep 28, 2026',
        actor: 'Sustainability Valuation Board',
        completed: true,
      },
    ],
  },
  {
    id: 'aivy-5280',
    assetName: 'Metro Logistic EV Van Fleet (48 Units)',
    assetCode: 'FLT-2026-5280',
    category: 'Corporate Fleet',
    valuationAmount: 2890000,
    bookValue: 3100000,
    status: 'DRAFT',
    appraiserName: 'David K. Tanaka, ASA',
    appraiserRole: 'Automotive & Fleet Specialist',
    requestDate: '2026-10-06',
    location: 'Logistics Distribution Hub, Bekasi',
    methodology: 'Wholesale Auction Index & Battery Health State (SoH) Valuation',
    valuationRange: {
      low: 2750000,
      mid: 2890000,
      high: 3020000,
    },
    summaryNotes: 'Preliminary survey indicated average battery State-of-Health (SoH) of 91.2%. Market resale values steady due to high demand for commercial EV delivery.',
    timeline: [
      {
        title: 'Fleet Batch Revaluation Created',
        description: 'Initiated for year-end operating lease renewal terms.',
        date: 'Oct 06, 2026',
        actor: 'Fleet Operations',
        completed: true,
        current: true,
      },
      {
        title: 'OBD Diagnostics & Mileage Verification',
        description: 'Automated telemetry data extraction in progress.',
        date: 'Pending',
        actor: 'Diagnostics Hub',
        completed: false,
      },
      {
        title: 'Secondary Fleet Index Matching',
        description: 'Auction comparison against regional commercial EV transactions.',
        date: 'Pending',
        actor: 'David K. Tanaka, ASA',
        completed: false,
      },
      {
        title: 'Fleet Valuation Certificate',
        description: 'Certification and depreciation allocation.',
        date: 'Pending',
        actor: 'Appraisal Board',
        completed: false,
      },
    ],
  },
];

export const VALUATION_TREND_DATA = [
  { month: 'Jan', portfolioValue: 152.4, benchmark: 148.0 },
  { month: 'Feb', portfolioValue: 155.8, benchmark: 150.2 },
  { month: 'Mar', portfolioValue: 159.2, benchmark: 153.0 },
  { month: 'Apr', portfolioValue: 164.5, benchmark: 156.4 },
  { month: 'May', portfolioValue: 167.1, benchmark: 159.0 },
  { month: 'Jun', portfolioValue: 171.8, benchmark: 163.5 },
  { month: 'Jul', portfolioValue: 175.2, benchmark: 166.2 },
  { month: 'Aug', portfolioValue: 178.6, benchmark: 169.8 },
  { month: 'Sep', portfolioValue: 181.9, benchmark: 173.1 },
  { month: 'Oct', portfolioValue: 184.6, benchmark: 176.5 },
];
