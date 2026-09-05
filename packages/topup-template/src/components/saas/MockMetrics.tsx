import React from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { Server, Activity, Globe2 } from 'lucide-react';

export default function MockMetrics() {
  const storesCount = useCountUp(1420, 2500);
  const mrrCount = useCountUp(88000, 3000);
  const uptimeCount = useCountUp(99, 2000);

  const metrics = [
    {
      title: 'Active Stores',
      value: storesCount.toLocaleString(),
      suffix: '+',
      icon: <Server className="w-5 h-5 text-purple-400" />,
      sub: 'Edge deployed storefronts',
    },
    {
      title: 'Monthly GMV',
      value: '$' + (mrrCount / 1000).toFixed(1),
      suffix: 'k+',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      sub: 'Processed via Bakong KHQR',
    },
    {
      title: 'Global Uptime',
      value: uptimeCount,
      suffix: '.9%',
      icon: <Globe2 className="w-5 h-5 text-cyan-400" />,
      sub: 'Cloudflare Edge 300+ PoPs',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-16 px-6">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-md hover:border-purple-500/30 transition-all duration-300 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            {metric.icon}
            <div className="text-slate-300 text-sm font-semibold">{metric.title}</div>
          </div>
          <div className="text-4xl md:text-5xl font-extrabold text-white flex items-baseline gap-1 my-1">
            {metric.value}
            <span className="text-2xl text-purple-400 font-bold">{metric.suffix}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">{metric.sub}</div>
        </div>
      ))}
    </div>
  );
}
