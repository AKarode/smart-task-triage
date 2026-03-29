# Knowledge Base Seed Documents

> Copy each section below into its own `.md` file in the `/kb` directory.
> These are synthetic enterprise SOPs designed to give the AI grounding for triage decisions.

---

## File: `kb/refund-policy.md`

```markdown
# Refund Policy

## Eligibility

Refunds are available for purchases made within the last 30 days. The customer must provide proof of purchase such as an order number, receipt, or transaction ID. Digital products are eligible for refund only if the customer has not accessed or downloaded the product.

## Process

All refund requests must be submitted through the customer portal or by contacting the billing team directly. The billing team reviews requests within 2 business days. Approved refunds are processed to the original payment method within 5-7 business days.

## Exceptions

Refunds exceeding $500 require manager approval from the Finance Operations team. Subscription refunds are prorated based on remaining days in the billing cycle. Enterprise contract refunds must be handled by the Account Management team and may involve contract amendments.

## Escalation

If a customer disputes a refund decision, escalate to the Finance Operations manager. Include the original request, denial reason, and any customer correspondence. The escalation must be resolved within 5 business days.
```

---

## File: `kb/escalation-guide.md`

```markdown
# Escalation Guide

## Priority Levels

Critical: System-wide outage, data breach, or safety incident affecting multiple customers. Response time: 15 minutes. Escalate immediately to the on-call engineering lead and VP of Engineering.

High: Service degradation affecting a segment of customers, or a single enterprise customer reporting significant impact. Response time: 1 hour. Route to the relevant team lead.

Medium: Feature malfunction or bug report with a known workaround. Response time: 4 hours. Route to the standard support queue.

Low: General inquiries, feature requests, or feedback. Response time: 24 hours. Handle in the general support queue.

## Escalation Chain

Level 1: Support team handles initial triage and resolution attempts. If unresolved within the SLA window, escalate to Level 2.

Level 2: Team lead or senior engineer investigates. If the issue requires cross-team coordination or executive visibility, escalate to Level 3.

Level 3: VP or Director level. Reserved for incidents with revenue impact exceeding $10,000, regulatory implications, or public-facing reputational risk.

## Documentation Requirements

Every escalation must include: original ticket ID, customer impact summary, steps already taken, and recommended next action. Use the #escalations Slack channel for real-time coordination during active incidents.
```

---

## File: `kb/onboarding-process.md`

```markdown
# Employee Onboarding Process

## Pre-Start

HR sends the new hire packet 5 business days before the start date. IT provisions laptop, email, and access credentials 2 business days before start. The hiring manager prepares a 30-60-90 day plan and assigns an onboarding buddy.

## First Week

Day 1: HR orientation covering benefits, policies, and compliance training. IT setup verification and tool access confirmation. Day 2-3: Team introductions and project overview with the hiring manager. Day 4-5: Shadow sessions with the onboarding buddy and initial task assignments.

## First Month

Weekly 1:1 meetings with the hiring manager to review progress against the 30-day milestones. Complete all required compliance training modules by end of week 2. Access to production systems is granted after security training completion and manager approval.

## Common Issues

If a new hire has not received their equipment by start date, escalate to IT Operations immediately via the #it-help Slack channel. If compliance training modules are not accessible, contact HR Systems at hr-systems@company.com. Benefits enrollment must be completed within 30 days of start date — no exceptions.
```

---

## File: `kb/security-incident-response.md`

```markdown
# Security Incident Response

## Classification

P1 (Critical): Confirmed data breach, active intrusion, or ransomware. Activate the full incident response team immediately. Notify legal and executive leadership within 30 minutes.

P2 (High): Suspected breach, unusual access patterns, or vulnerability exploitation attempt. Engage the security team for investigation within 1 hour.

P3 (Medium): Phishing report, suspicious email, or minor policy violation. Log in the security tracker and investigate within 24 hours.

P4 (Low): Security awareness questions, policy clarification, or proactive vulnerability reports. Respond within 48 hours.

## Immediate Actions for P1/P2

Isolate affected systems if possible without destroying forensic evidence. Preserve all relevant logs — do not restart or clean affected machines. Notify the Security Operations Center (SOC) via the emergency hotline. Begin documenting the timeline in the incident response log immediately.

## Communication Protocol

All external communication about security incidents must be approved by Legal and the VP of Security. Do not disclose incident details to customers until the investigation scope is determined. Internal updates should flow through the #security-incidents Slack channel with access limited to the response team.

## Post-Incident

Conduct a post-incident review within 5 business days of resolution. Document root cause, impact assessment, remediation steps, and preventive measures. Update the security runbook if new attack vectors were identified.
```

---

## File: `kb/sla-guidelines.md`

```markdown
# Service Level Agreement Guidelines

## Response Time SLAs

Enterprise tier: Critical issues within 15 minutes, High within 1 hour, Medium within 4 hours, Low within 24 hours.

Business tier: Critical within 1 hour, High within 4 hours, Medium within 8 hours, Low within 48 hours.

Starter tier: Critical within 4 hours, High within 8 hours, Medium within 24 hours, Low within 72 hours.

## Resolution Time Targets

Resolution targets are separate from response times. Enterprise critical issues target 4-hour resolution. High issues target 24-hour resolution. Medium issues target 3 business days. Low issues target 5 business days.

## SLA Breach Protocol

When an SLA breach is imminent (within 75% of the target window), the system automatically alerts the team lead. Actual breaches trigger an escalation to the department head and a customer communication acknowledging the delay. Repeated SLA breaches for a single customer trigger a formal service review meeting.

## Measurement

SLA timers start when a ticket is created, not when it is first viewed. Timers pause when the ticket is in "waiting on customer" status. All SLA metrics are reported monthly to the operations leadership team.
```

---

## File: `kb/vendor-management.md`

```markdown
# Vendor Management Policy

## New Vendor Requests

All new vendor relationships must be approved through the procurement process. Submit a vendor request form including business justification, estimated annual spend, and data handling requirements. Vendors with access to customer data require a security assessment before contract execution.

## Approval Thresholds

Annual spend under $10,000: Department manager approval. Annual spend $10,000-$50,000: Department head and Finance approval. Annual spend over $50,000: VP-level approval and formal RFP process required.

## Contract Requirements

All vendor contracts must include: data processing agreement (if applicable), SLA commitments, termination clause with 30-day notice minimum, and annual review provisions. Legal must review contracts over $25,000 before execution.

## Ongoing Management

Vendors are reviewed annually against performance metrics and contract terms. Any vendor security incident must be reported to our security team within 24 hours. Vendor access to internal systems must follow the principle of least privilege and be audited quarterly.
```

---

## File: `kb/employee-pto-policy.md`

```markdown
# Employee PTO Policy

## Accrual

Full-time employees accrue 20 days of PTO per year, accruing at 1.67 days per month. PTO begins accruing from the first day of employment. Maximum PTO balance is 30 days — accrual stops until the balance drops below the cap.

## Requesting Time Off

PTO requests of 3 or fewer consecutive days require manager approval at least 1 week in advance. PTO requests of 4 or more consecutive days require manager approval at least 2 weeks in advance. Requests during blackout periods (quarter-end, product launches) may be denied based on business needs.

## Sick Leave

Sick leave is separate from PTO. Employees receive 10 sick days per year. Sick leave does not roll over between years. For absences exceeding 3 consecutive sick days, a doctor's note may be requested.

## Special Circumstances

Bereavement leave provides 5 days for immediate family members. Jury duty is covered with full pay for up to 10 days. Parental leave follows the separate parental leave policy document. All leave questions should be directed to HR at hr@company.com or through the #hr-questions Slack channel.
```

---

## File: `kb/data-access-requests.md`

```markdown
# Data Access Request Policy

## Request Process

All requests for access to production data, customer data, or sensitive internal data must be submitted through the Data Access Request form. Requests must include: business justification, specific data needed, intended use, and retention period.

## Approval Requirements

Customer PII access: Requires manager approval plus Data Privacy Officer review. Production database access: Requires engineering manager approval plus Security team review. Financial data access: Requires Finance department head approval. Cross-department data access: Requires approval from both the requesting and data-owning department heads.

## Access Duration

All data access grants are time-limited. Default grant period is 30 days. Extensions must be re-requested and re-approved. Permanent access requires VP-level approval and quarterly audit review.

## Data Handling Rules

Accessed data must not be stored on personal devices or unsanctioned cloud storage. Data exports must be encrypted and transmitted through approved channels only. Any accidental exposure of sensitive data must be reported to the security team within 1 hour. When the access period ends, all local copies of the data must be deleted and confirmed.
```
