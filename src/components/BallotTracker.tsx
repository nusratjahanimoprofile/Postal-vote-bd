import React from 'react';
import { Translation } from '../types';
const BallotTracker: React.FC<{ t: Translation }> = ({ t }) => (
  <div className="p-6 bg-white rounded-2xl shadow-xl">
    <h3 className="font-bold text-lg">{t.trackingStatus}</h3>
    <p className="text-sm text-slate-500 mt-2">Status: Pending Verification</p>
  </div>
);
export default BallotTracker;
