"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from "@/app/components/Navbar";
import PrimaryButton from "@/app/components/PrimaryButton";

export default function HomePage() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div>
            <Navbar titulo={"Bem vindo!"} />

            {/* Faixa de autenticação */}
            {!user && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-blue-800">
                                    <strong>Faça login com sua conta USP</strong> para agendar horários nos espaços
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => router.push('/login')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Entrar com USP
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-[24px] pb-[32px]">
                <div className="flex flex-col gap-[32px]">
                    <div className="text-center py-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Sistema de Agendamento CEFER
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Explore os espaços disponíveis e agende seus horários
                        </p>
                        <PrimaryButton
                            texto="Ver Espaços"
                            onClick={() => router.push('/espacos')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}