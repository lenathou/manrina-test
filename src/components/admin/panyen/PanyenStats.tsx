import React from 'react';
import { IPanyenProduct } from '@/server/panyen/IPanyen';

interface PanyenStatsProps {
    panyens: IPanyenProduct[];
}

const PanyenStats: React.FC<PanyenStatsProps> = ({ panyens }) => {
    const totalPanyens = panyens.length;
    const activePanyens = panyens.filter((p) => p.showInStore).length;
    const inactivePanyens = totalPanyens - activePanyens;

    const stats = [
        {
            label: 'Nombre total de panier',
            value: totalPanyens,
            color: 'bg-secondary text-white',
        },
        {
            label: 'Panyens actifs',
            value: activePanyens,
            color: 'bg-tertiary text-white',
        },
        {
            label: 'Panyens inactifs',
            value: inactivePanyens,
            color: 'bg-primary text-white',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${stat.color} transition-all duration-200 hover:shadow-md`}
                >
                    <div className="flex justify-end mb-2">
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                    <div className="text-sm font-medium opacity-80">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};

export default PanyenStats;
