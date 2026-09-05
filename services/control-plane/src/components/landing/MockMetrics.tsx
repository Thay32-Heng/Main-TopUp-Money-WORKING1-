'use client';
import { useCountUp } from '@/hooks/useCountUp';
import { Users, Server, Globe2, Activity } from 'lucide-react';

export default function MockMetrics() {
  const storesCount = useCountUp(1240, 2500);
  const mrrCount = useCountUp(54000, 3000);
  const uptimeCount = useCountUp(99, 2000);

  const metrics = [
    { title: 'Active Stores', value: storesCount.toLocaleString(), suffix: '+', icon: <Server className="w-5 h-5 text-purple-400" /> },
    { title: 'Monthly GMV', value: '$' + (mrrCount / 1000).toFixed(1), suffix: 'k+', icon: <Activity className="w-5 h-5 text-emerald-400" /> },
    { title: 'Uptime', value: uptimeCount, suffix: '.9%', icon: <Globe2 className="w-5 h-5 text-cyan-400" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mt-16 px-6">
      {metrics.map((metric, i) => (
        <div key={i} className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
           <div className="flex items-center gap-2 mb-2">
             {metric.icon}
             <div className="text-slate-400 text-sm font-medium">{metric.title}</div>
           </div>
           <div className="text-4xl font-extrabold text-white flex items-baseline gap-1">
              {metric.value}
              <span className="text-2xl text-slate-500">{metric.suffix}</span>
           </div>
        </div>
      ))}
    </div>
  );
}
