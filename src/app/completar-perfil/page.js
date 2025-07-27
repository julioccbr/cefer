"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Back from '@/app/components/Back';
import PrimaryButton from '@/app/components/PrimaryButton';

export default function CompletarPerfilPage() {
    const [isClient, setIsClient] = useState(false);
    const { user, completeProfile } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name || !formData.phone) {
            setError('Por favor, preencha todos os campos');
            setLoading(false);
            return;
        }

        const result = await completeProfile(formData);

        if (result.success) {
            router.push('/espacos');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    if (!isClient) {
        return <div>Carregando...</div>;
    }

    if (!user) {
        router.push('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Back />

            <div className="px-4 py-8">
                <div className="max-w-md mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Completar Perfil
                        </h1>
                        <p className="text-gray-600">
                            Complete seus dados para finalizar o cadastro
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="mb-6 p-4 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-800">
                                <strong>Email USP:</strong> {user.email}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Este campo não pode ser alterado
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Seu nome completo"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Telefone *
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="(11) 99999-9999"
                                    required
                                />
                            </div>

                            <PrimaryButton
                                texto={loading ? "Salvando..." : "Completar Cadastro"}
                                onClick={handleSubmit}
                                disabled={loading}
                                type="submit"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 