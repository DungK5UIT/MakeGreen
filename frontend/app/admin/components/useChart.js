'use client';

import { useEffect, useState } from 'react';

export default function useChart() {
  const [Chart, setChart] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('chart.js/auto');
      if (mounted) setChart(() => mod.default);
    })();
    return () => { mounted = false; };
  }, []);
  return Chart;
}
