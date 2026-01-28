import React from 'react';
import { UserRegistration } from '../types';
interface Props { userData: UserRegistration; onUpdate: any; onBack: any; onLogout: any; }
const UserProfile: React.FC<Props> = ({ userData, onBack }) => (
  <div className="p-6 bg-white rounded-2xl shadow-xl">
    <button onClick={onBack} className="text-sm text-blue-500 mb-4">Back</button>
    <h2 className="font-bold">Profile: {userData.fullName}</h2>
  </div>
);
export default UserProfile;
