'use client'

import React, { memo } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';

// Simple memoized wrapper around ReactMarkdown
export const MemoizedReactMarkdown: React.FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children
);

MemoizedReactMarkdown.displayName = 'MemoizedReactMarkdown'; 