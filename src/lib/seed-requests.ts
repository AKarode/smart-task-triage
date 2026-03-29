export interface SeedRequest {
  id: string;
  channel: 'email' | 'slack' | 'web';
  subject: string;
  message: string;
  createdAt: string;
}

export const seedRequests: SeedRequest[] = [
  {
    id: 'req-001',
    channel: 'email',
    subject: 'Requesting refund for last month charge',
    message: 'Hi, I was charged $249 for the Pro plan last month but I cancelled my subscription on the 3rd. I never used the service after cancellation. Can I get a full refund? My order number is ORD-88421.',
    createdAt: '2026-03-27T09:15:00Z',
  },
  {
    id: 'req-002',
    channel: 'slack',
    subject: 'Production API returning 500 errors',
    message: 'Our production integration has been returning intermittent 500 errors for the last 30 minutes. Affecting approximately 15% of requests. We are on the Enterprise tier. This is impacting our checkout flow. Need immediate assistance.',
    createdAt: '2026-03-27T10:02:00Z',
  },
  {
    id: 'req-003',
    channel: 'web',
    subject: 'Suspicious login attempts on admin account',
    message: 'I noticed 47 failed login attempts on our admin account from an IP address in a country where we have no employees. The attempts happened between 2am and 4am EST. Our account is currently locked. Is there a way to check if any data was accessed?',
    createdAt: '2026-03-27T08:30:00Z',
  },
  {
    id: 'req-004',
    channel: 'email',
    subject: 'New hire starting Monday needs system access',
    message: 'We have a new software engineer starting Monday March 31st. Name: Jordan Rivera. They need access to GitHub, Jira, Slack, and staging environments. Their manager is Sarah Chen in the Platform team. Can you make sure everything is provisioned before their start date?',
    createdAt: '2026-03-27T14:00:00Z',
  },
  {
    id: 'req-005',
    channel: 'slack',
    subject: 'Need access to customer analytics database',
    message: 'I need read access to the customer analytics database for a quarterly business review presentation. Specifically need the usage_metrics and revenue_by_segment tables. My manager (Lisa Park, VP Sales) has approved this verbally. How do I formally request this?',
    createdAt: '2026-03-27T11:45:00Z',
  },
  {
    id: 'req-006',
    channel: 'web',
    subject: 'Vendor security questionnaire needs completion',
    message: 'One of our vendors (CloudSync Corp) sent us their annual security questionnaire. It needs to be completed by April 15th. The questionnaire covers data handling practices, encryption standards, and incident response procedures. Who should I route this to?',
    createdAt: '2026-03-27T13:20:00Z',
  },
  {
    id: 'req-007',
    channel: 'email',
    subject: 'Enterprise pricing inquiry from Acme Corp',
    message: 'Acme Corp (Fortune 500, manufacturing sector) reached out asking about enterprise pricing for 500+ seats. They are currently using a competitor and their contract ends in Q3. They want a demo next week and a custom pricing proposal. Who handles enterprise deals of this size?',
    createdAt: '2026-03-27T15:30:00Z',
  },
  {
    id: 'req-008',
    channel: 'slack',
    subject: 'PTO request question — blackout period',
    message: 'I want to take a week off from April 14-18 but I heard there might be a product launch blackout period around that time. Can someone clarify the blackout dates? Also, do I need extra approval since it is more than 3 days?',
    createdAt: '2026-03-27T09:50:00Z',
  },
  {
    id: 'req-009',
    channel: 'web',
    subject: 'Billing discrepancy on latest invoice',
    message: 'Our latest invoice (INV-2026-0342) shows a charge of $12,400 but our contract rate should be $9,800/month. The difference appears to be overage charges but we have not exceeded our usage limits according to our dashboard. Can someone review this?',
    createdAt: '2026-03-27T16:10:00Z',
  },
  {
    id: 'req-010',
    channel: 'email',
    subject: 'Phishing email reported by marketing team',
    message: 'Three people on the marketing team received an email claiming to be from our CEO asking them to purchase gift cards. One person clicked the link but did not enter any information. The email came from ceo@company-secure.net which is not our domain. What should we do?',
    createdAt: '2026-03-27T12:15:00Z',
  },
];
