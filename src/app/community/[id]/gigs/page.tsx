'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CommunityGigsRedirect() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  useEffect(() => {
    if (communityId) {
      router.replace(`/community/${communityId}`);
    }
  }, [communityId, router]);

  return (
    <div className="h-64 flex items-center justify-center text-xs text-ink-subtle uppercase tracking-wider animate-pulse">
      Navigating to Cooperative Gig Board...
    </div>
  );
}
