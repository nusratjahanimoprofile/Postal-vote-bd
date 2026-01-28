import { Translation, FAQItem } from './types';
export const TRANSLATIONS: Record<'en' | 'bn', Translation> = {
  en: { title: "Postal Vote BD", subtitle: "Simplified for Non-Residents", registerBtn: "Registration", trackBtn: "Track", nidLabel: "NID", mobileLabel: "Mobile", addressLabel: "Address", kycStep: "KYC", cameraAccess: "Camera", verifyIdentity: "Verify", trackingStatus: "Status", footerRights: "© 2024 EC", notifications: "Alerts", loading: "Wait...", homeTitle: "NRB Portal", dashboard: "Dashboard", applyNow: "Apply", statusTitle: "Status", support: "Support", voterCard: "Card", securityVerified: "Verified", deadlineWarning: "Dec 15" },
  bn: { title: "পোস্টাল ভোট বিডি", subtitle: "সহজ করা হয়েছে", registerBtn: "নিবন্ধন", trackBtn: "ট্র্যাক", nidLabel: "এনআইডি", mobileLabel: "মোবাইল", addressLabel: "ঠিকানা", kycStep: "যাচাই", cameraAccess: "ক্যামেরা", verifyIdentity: "যাচাই করুন", trackingStatus: "অবস্থা", footerRights: "© ২০২৪ ইসি", notifications: "এলার্ট", loading: "অপেক্ষা করুন...", homeTitle: "এনআরবি পোর্টাল", dashboard: "ড্যাশবোর্ড", applyNow: "আবেদন", statusTitle: "অবস্থা", support: "সহায়তা", voterCard: "কার্ড", securityVerified: "যাচাইকৃত", deadlineWarning: "১৫ ডিসেম্বর" }
};
export const FAQ_DATA: Record<'en' | 'bn', FAQItem[]> = {
  en: [{ question: "Eligible?", answer: "All NRBs" }],
  bn: [{ question: "যোগ্য?", answer: "সকল প্রবাসী" }]
};
