import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) {
        return null;
    }

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[24px] animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[16] p-[24px] w-full max-w-sm relative animate-scaleIn"
                onClick={handleContentClick}
            >
                {/* >>> CORREÇÃO NESTE BOTÃO <<< */}
                <button
                    onClick={onClose}
                    className="absolute top-[24px] right-[24px] w-[36px] h-[36px] flex items-center justify-center rounded-full bg-[#14141410] backdrop-blur-sm cursor-pointer"
                    aria-label="Fechar"
                >
                    <X size={20} className="text-[#141414]" /> {/* Adicione text-white aqui */}
                </button>

                {children}
            </div>
        </div>
    );
}