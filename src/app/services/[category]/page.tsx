'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ServicesCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  useEffect(() => {
    if (category) {
      // Capitalize first letter
      const capCat = category.charAt(0).toUpperCase() + category.slice(1);
      router.replace(`/explore?category=${encodeURIComponent(capCat)}`);
    }
  }, [category, router]);

  return (
    <div className="h-64 flex items-center justify-center text-xs text-ink-subtle uppercase tracking-wider animate-pulse">
      Loading services matching category...
    </div>
  );
}
