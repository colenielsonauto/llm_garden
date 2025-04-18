import React from 'react';

// Simple passthrough stubs accepting common props
export const Collapsible = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <div {...props}>{children}</div>;
export const CollapsibleTrigger = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <div {...props}>{children}</div>;
export const CollapsibleContent = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <div {...props}>{children}</div>; 