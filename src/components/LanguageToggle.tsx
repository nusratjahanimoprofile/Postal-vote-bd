import React from 'react';
import { Language } from '../types';
interface Props { current: Language; onToggle: (lang: Language) => void; }
const LanguageToggle: React.FC<Props> = ({ current, onToggle }) => (
  <div className="flex space-x-2 bg-slate-100 p-1 rounded-full">
    <button onClick={() => onToggle('en')} className={`px-3 py-1 rounded-full text-xs ${current === 'en' ? 'bg-bd-green text-white' : ''}`}>English</button>
    <button onClick={() => onToggle('bn')} className={`px-3 py-1 rounded-full text-xs ${current === 'bn' ? 'bg-bd-green text-white' : ''}`}>বাংলা</button>
  </div>
);
export default LanguageToggle;
