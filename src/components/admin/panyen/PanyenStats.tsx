import React from 'react';
import { IPanyenProduct } from '@/server/panyen/IPanyen';

interface PanyenStatsProps {
  panyens: IPanyenProduct[];
}

const PanyenStats: React.FC<PanyenStatsProps> = ({ panyens }) => {
  const totalPanyens = panyens.length;
  const activePanyens = panyens.filter(p => p.showInStore).length;
  const inactivePanyens = totalPanyens - activePanyens;

  const stats = [
    {
      label: 'Nombre total de panier',
      value: totalPanyens,
      icon: '📦',
      color: 'bg-primary/10 text-primary-dark border-primary-80'
    },
    {
      label: 'Panyens actifs',
      value: activePanyens,
      icon: '✅',
      
     
    },
    {
      label: 'Panyens inactifs',
      value: inactivePanyens,
      icon: '⏸️',
     color: 'bg-secondary/30 text-secondary-dark border-secondary-80'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-2 ${stat.color} transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-right">
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
          <div className="text-sm font-medium opacity-80">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default PanyenStats;