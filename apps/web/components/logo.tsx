import { CalendarDays } from 'lucide-react';
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="bg-rose-600 text-white p-2 rounded-2xl">
        <CalendarDays />
      </div>
      <span className="font-bold text-xl">Eventify</span>
    </div>
  );
};

export default Logo;
