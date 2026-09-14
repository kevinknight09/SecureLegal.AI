export interface LegalSample {
  id: string;
  title: string;
  type: string;
  parties: string;
  governingLaw: string;
  term: string;
  content: string;
}

export const SAMPLE_CONTRACTS: Record<string, LegalSample> = {
  saas: {
    id: "saas",
    title: "Enterprise SaaS Master Subscription Agreement",
    type: "SaaS & Cloud Services",
    parties: "CloudScale Inc. (Provider) & Acme Corp (Client)",
    governingLaw: "State of Delaware, USA",
    term: "36 Months (Auto-Renewing)",
    content: `ENTERPRISE SAAS MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of October 1, 2024 ("Effective Date") by and between CloudScale Systems Inc., a Delaware corporation ("Provider"), and Acme Enterprise Solutions Inc. ("Customer").

SECTION 1. SERVICE ACCESS AND SLA
1.1 Provider grants Customer a non-exclusive, non-transferable subscription right to access the CloudScale Platform.
1.2 Provider targets a service availability uptime of 99.5%, excluding scheduled maintenance windows. In the event uptime falls below 95.0% in any calendar month, Customer's sole and exclusive remedy shall be a 5% service credit applied to the subsequent billing invoice.

SECTION 2. FEES, AUTOMATIC RENEWAL, AND PRICE INCREASES
2.1 Subscription Fees are billed annually in advance ($120,000 / year).
2.2 AUTOMATIC RENEWAL: This Agreement shall automatically renew for successive 12-month periods unless Customer provides written notice of non-renewal at least ninety (90) days prior to the expiration of the then-current term.
2.3 PRICE ESCALATION: Upon any renewal term, Provider reserves the right to increase annual subscription fees by up to 15% without prior Customer consent.

SECTION 3. INTELLECTUAL PROPERTY AND DATA OWNERSHIP
3.1 Customer retains all ownership rights in Customer Data uploaded to the Platform.
3.2 Customer hereby grants Provider a perpetual, irrevocable, worldwide, royalty-free license to use anonymized Customer Data for machine learning model training, analytics, product development, and promotional benchmarking.

SECTION 4. INDEMNIFICATION AND LIMITATION OF LIABILITY
4.1 CUSTOMER INDEMNIFICATION: Customer agrees to defend, indemnify, and hold harmless Provider against any third-party claims, damages, liabilities, or expenses (including attorney fees) arising from Customer's data or breach of Section 1.
4.2 LIMITATION OF LIABILITY: TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROVIDER'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL BE LIMITED TO THE TOTAL FEES PAID BY CUSTOMER IN THE PRIOR ONE (1) MONTH. PROVIDER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

SECTION 5. TERMINATION FOR CONVENIENCE
5.1 Provider may terminate this Agreement at any time for convenience upon thirty (30) days written notice.
5.2 Customer has NO right to terminate this Agreement for convenience prior to the expiration of the 36-month Commitment Period.`
  },

  employment: {
    id: "employment",
    title: "Senior Executive Employment & Restrictive Covenant Agreement",
    type: "Employment & HR",
    parties: "Apex Dynamics Corp (Employer) & Alex Mercer (Employee)",
    governingLaw: "State of California, USA",
    term: "At-Will / 24-Month Restrictive Covenant",
    content: `SENIOR EXECUTIVE EMPLOYMENT & RESTRICTIVE COVENANT AGREEMENT

This Employment Agreement ("Agreement") is executed as of January 15, 2025, between Apex Dynamics Corp ("Company") and Alex Mercer ("Executive").

SECTION 1. POSITION AND COMPENSATION
1.1 Executive shall serve as VP of Engineering at an annual base salary of $240,000, payable in semi-monthly installments.
1.2 Discretionary Bonus: Executive shall be eligible for an annual performance bonus of up to 30%, determined at the sole discretion of the Board of Directors.

SECTION 2. NON-COMPETITION AND NON-SOLICITATION
2.1 NON-COMPETE COVENANT: For a period of twenty-four (24) months following the termination of employment for ANY reason (whether voluntary or involuntary), Executive shall not directly or indirectly engage in, consult for, own, manage, or operate any business offering products or services competing with the Company anywhere in North America, Europe, or Asia.
2.2 NON-SOLICITATION: Executive agrees not to solicit, recruit, or hire any employee, contractor, or customer of the Company for a period of thirty-six (36) months post-termination.

SECTION 3. INTELLECTUAL PROPERTY ASSIGNMENT
3.1 Executive irrevocably assigns to Company all right, title, and interest in and to any inventions, software code, patents, trade secrets, and designs created during employment or relating to Company's current or prospective business, regardless of whether developed during working hours or using Company equipment.

SECTION 4. SEVERANCE AND TERMINATION FOR CAUSE
4.1 Company may terminate Executive's employment immediately "For Cause" (defined to include breach of policy, neglect of duty, or failure to meet quarterly targets). Upon termination For Cause, Executive forfeits all unpaid bonuses, accrued equity vesting, and severance pay.
4.2 In the event of termination Without Cause, Executive shall receive six (6) weeks of base salary, contingent upon signing a full general liability release.`
  },

  lease: {
    id: "lease",
    title: "Commercial Retail Storefront Lease Agreement",
    type: "Real Estate & Commercial Lease",
    parties: "Metro Commercial Properties LLC (Landlord) & Urban Artisan Cafe (Tenant)",
    governingLaw: "State of New York, USA",
    term: "5 Years (60 Months)",
    content: `COMMERCIAL RETAIL STOREFRONT LEASE AGREEMENT

This Lease Agreement ("Lease") is made on March 1, 2024, by Metro Commercial Properties LLC ("Landlord") and Urban Artisan Cafe LLC ("Tenant").

SECTION 1. DEMISED PREMISES AND BASE RENT
1.1 Landlord leases to Tenant the commercial retail premises located at 450 Broadway, Unit B, New York, NY 10013.
1.2 Base Rent shall be $14,000 per month for Year 1, increasing by 5% annually on each anniversary date.

SECTION 2. SECURITY DEPOSIT AND DEFAULT FORFEITURE
2.1 Tenant shall deposit with Landlord the sum of $42,000 (3 months rent) as Security Deposit.
2.2 FORFEITURE: If Tenant breaches any covenant in this Lease or defaults on rent payment by more than five (5) days, Landlord may retain the ENTIRE Security Deposit as liquidated damages, without prejudice to pursuing further legal remedies.

SECTION 3. TRIPLE NET (NNN) OPERATING EXPENSE SURCHARGES
3.1 Tenant is responsible for paying its pro-rata share (35%) of all Building Common Area Maintenance (CAM), Real Estate Taxes, Structural Repairs, Roof Replacements, and Building Insurance.
3.2 Landlord shall issue quarterly estimated CAM statements. Tenant must pay CAM reconciliations within ten (10) days of invoice, without right of audit or offset.

SECTION 4. MAINTENANCE, REPAIRS, AND RESTORATION
4.1 Tenant shall maintain the interior HVAC units, plumbing, storefront glass, electrical fixtures, and grease traps in good repair at Tenant's sole expense.
4.2 SURRENDER & RESTORATION: Upon Lease expiration, Tenant must remove all alterations, trade fixtures, and interior upgrades, restoring the premises to raw shell condition at Tenant's sole cost.`
  },

  nda: {
    id: "nda",
    title: "Mutual Corporate Non-Disclosure & Confidentiality Agreement",
    type: "Confidentiality & Privacy",
    parties: "Vanguard Innovations Inc. & Synergy Partners LLC",
    governingLaw: "State of Texas, USA",
    term: "3 Years Confidentiality Period",
    content: `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made on June 10, 2024, between Vanguard Innovations Inc. ("Party A") and Synergy Partners LLC ("Party B").

SECTION 1. DEFINITION OF CONFIDENTIAL INFORMATION
1.1 "Confidential Information" refers to all proprietary technical data, trade secrets, product blueprints, source code, financial projections, customer lists, and business strategies disclosed by either party ("Disclosing Party") to the other party ("Receiving Party").

SECTION 2. OBLIGATIONS AND STANDARD OF CARE
2.1 Receiving Party agrees to hold Confidential Information in strict confidence and exercise at least a reasonable degree of care to prevent unauthorized disclosure.
2.2 Receiving Party shall restrict disclosure solely to employees, officers, and legal advisors with a strict "need to know" who are bound by confidentiality obligations no less restrictive than those herein.

SECTION 3. EXCLUSIONS FROM CONFIDENTIALITY
3.1 Confidential Information does not include information that: (a) is or becomes publicly known through no breach of Receiving Party; (b) was already rightfully known to Receiving Party prior to disclosure; (c) is independently developed without reference to Disclosing Party's information; or (d) is required to be disclosed by judicial order or law.

SECTION 4. TERM AND RETURN OF MATERIALS
4.1 Confidentiality obligations under this Agreement shall survive for a period of three (3) years from the Effective Date.
4.2 Upon written request, Receiving Party shall promptly return or destroy all physical and electronic copies of Confidential Information and provide written certification of compliance within fourteen (14) days.`
  }
};
