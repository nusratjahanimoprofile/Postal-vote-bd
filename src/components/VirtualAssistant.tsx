import React from 'react';
import { Language } from '../types';
const VirtualAssistant: React.FC<{ lang: Language }> = ({ lang }) => (
  <div className="fixed bottom-4 right-4 p-4 bg-bd-red text-white rounded-full shadow-2xl">AI</div>
);
export default VirtualAssistant;
