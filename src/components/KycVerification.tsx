import React from 'react';
import { Translation, UserRegistration } from '../types';
interface Props { t: Translation; userData: UserRegistration; onComplete: () => void; }
const KycVerification: React.FC<Props> = ({ onComplete }) => (
  <div className="p-10 bg-white rounded-3xl shadow-2xl text-center">
    <h2 className="font-bold mb-4">KYC Identity Check</h2>
    <button onClick={onComplete} className="bg-bd-green text-white px-6 py-3 rounded-xl">Complete Verification</button>
  </div>
);
export default KycVerification;
