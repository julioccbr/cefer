import { ArrowLeft } from "lucide-react";

export default function Back({ onClick }) {
    const handleClick = onClick || (() => window.history.back());

    return (
        <button
            onClick={handleClick}
            className="absolute left-[24px] top-[58px] w-[36px] h-[36px] flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm cursor-pointer"
            aria-label="Voltar"
        >
            <ArrowLeft size={20} className="text-white" />
        </button>
    );
}
