import React, { useEffect, useState } from 'react';
import { useToast, ToastType } from '../context/ToastContext';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

const ToastIcon = ({ type }: { type: ToastType }) => {
    switch (type) {
        case 'success':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'error':
            return <XCircle className="w-5 h-5 text-red-500" />;
        case 'warning':
            return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        case 'info':
        default:
            return <Info className="w-5 h-5 text-blue-500" />;
    }
};

const ToastItem = ({ id, message, type, action, onRemove }: { id: string, message: string, type: ToastType, action?: { label: string, onClick: () => void }, onRemove: (id: string) => void }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for animation to finish before removing
        setTimeout(() => {
            onRemove(id);
        }, 300);
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return 'border-l-green-500';
            case 'error': return 'border-l-red-500';
            case 'warning': return 'border-l-yellow-500';
            case 'info': return 'border-l-blue-500';
            default: return 'border-l-gray-500';
        }
    };

    return (
        <div
            className={`
        flex items-center w-full max-w-sm p-4 mb-3 bg-white rounded-lg shadow-lg border-l-4 
        transform transition-all duration-300 ease-in-out
        ${getBorderColor()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
            role="alert"
        >
            <div className="flex-shrink-0">
                <ToastIcon type={type} />
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700 flex-1">
                {message}
                {action && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                            handleClose();
                        }}
                        className="ml-4 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
                onClick={handleClose}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col items-end w-full max-w-sm pointer-events-none">
            <div className="pointer-events-auto w-full">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        {...toast}
                        onRemove={removeToast}
                    />
                ))}
            </div>
        </div>
    );
};
