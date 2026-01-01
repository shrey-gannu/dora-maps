
import React from 'react';

export const DeleteIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5V4H3V3.5ZM4 5V12.5C4 13.3284 4.67157 14 5.5 14H9.5C10.3284 14 11 13.3284 11 12.5V5H4ZM6 6.5C6 6.22386 6.22386 6 6.5 6C6.77614 6 7 6.22386 7 6.5V11.5C7 11.7761 6.77614 12 6.5 12C6.22386 12 6 11.7761 6 11.5V6.5ZM8.5 6C8.22386 6 8 6.22386 8 6.5V11.5C8 11.7761 8.22386 12 8.5 12C8.77614 12 9 11.7761 9 11.5V6.5C9 6.22386 8.77614 6 8.5 6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
    </svg>
);

const ResizeIconBase: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {children}
    </svg>
);


export const ResizeIconOneByFour: React.FC = () => (
    <ResizeIconBase>
        <rect x="2" y="6" width="12" height="4" rx="1" />
    </ResizeIconBase>
);

export const ResizeIconTwoByTwo: React.FC = () => (
    <ResizeIconBase>
        <rect x="5" y="5" width="6" height="6" rx="1" />
    </ResizeIconBase>
);

export const ResizeIconTwoByFour: React.FC = () => (
    <ResizeIconBase>
        <rect x="2" y="5" width="12" height="6" rx="1" />
    </ResizeIconBase>
);

export const ResizeIconFourByTwo: React.FC = () => (
    <ResizeIconBase>
        <rect x="6" y="2" width="4" height="12" rx="1" />
    </ResizeIconBase>
);

export const ResizeIconFourByFour: React.FC = () => (
    <ResizeIconBase>
        <rect x="2" y="2" width="12" height="12" rx="1" />
    </ResizeIconBase>
);
