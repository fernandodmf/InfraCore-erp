import React from 'react';

interface PlaceholderProps {
    title: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center p-10 h-[60vh] text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 text-slate-400"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
                Este módulo está em desenvolvimento e estará disponível em breve.
            </p>
        </div>
    );
};

export default Placeholder;
