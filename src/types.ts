export type Language = 'en' | 'bn';
export interface Translation {
  title: string; subtitle: string; registerBtn: string; trackBtn: string;
  nidLabel: string; mobileLabel: string; addressLabel: string; kycStep: string;
  cameraAccess: string; verifyIdentity: string; trackingStatus: string;
  footerRights: string; notifications: string; loading: string;
  homeTitle: string; dashboard: string; applyNow: string;
  statusTitle: string; support: string; voterCard: string;
  securityVerified: string; deadlineWarning: string;
}
export interface UserRegistration {
  nid: string; mobile: string; address: string; fullName: string; country: string;
}
export enum ApplicationStatus {
  PENDING = 'Pending', VERIFIED = 'Verified', BALLOT_SENT = 'Ballot Sent',
  RECEIVED = 'Received', REJECTED = 'Rejected'
}
export interface TrackingInfo {
  id: string; status: ApplicationStatus; lastUpdate: string; location: string;
}
export interface FAQItem { question: string; answer: string; }
