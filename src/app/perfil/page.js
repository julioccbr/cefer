"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/app/components/Navbar';
import PrimaryButton from '@/app/components/PrimaryButton';
import SecondaryButton from '@/app/components/SecondaryButton';
import { User, Edit, Save, X } from 'lucide-react';

export default function PerfilPage() {
    const [isClient, setIsClient] = useState(false);
    const { user, updateProfile, logout } = useAuth();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = () => {
        setIsEditing(true);
        setFormData({
            name: user?.name || '',
            phone: user?.phone || ''
        });
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            phone: user?.phone || ''
        });
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.name || !formData.phone) {
            setError('Por favor, preencha todos os campos');
            setLoading(false);
            return;
        }

        const result = await updateProfile(formData);

        if (result.success) {
            setSuccess('Perfil atualizado com sucesso!');
            setIsEditing(false);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleResetProfile = () => {
        // Remove o usuário do "banco" para simular primeiro acesso
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`user_${user.id}`);
        }
        logout();
        router.push('/login');
    };

    if (!isClient) {
        return <div>Carregando...</div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div>
            <Navbar titulo="Perfil" />

            <div className="px-[24px] pb-[32px]">
                <div className="flex flex-col gap-[32px]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Meu Perfil
                        </h1>
                        <p className="text-gray-600">
                            Gerencie suas informações pessoais
                        </p>
                    </div>

                    <div className="bg-white rounded-[8px] shadow-sm p-[24px]">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                                {success}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Email USP (não editável) */}
                            <div className="p-4 bg-gray-50 rounded-md">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email USP
                                </label>
                                <p className="text-gray-900">{user.email}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Este campo não pode ser alterado
                                </p>
                            </div>

                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome Completo
                                </label>
                                {isEditing ? (
                                    <input
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Seu nome completo"
                                    />
                                ) : (
                                    <p className="text-gray-900">{user.name}</p>
                                )}
                            </div>

                            {/* Telefone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Telefone
                                </label>
                                {isEditing ? (
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="(11) 99999-9999"
                                    />
                                ) : (
                                    <p className="text-gray-900">{user.phone}</p>
                                )}
                            </div>

                            {/* Botões de ação */}
                            {isEditing ? (
                                <div className="flex space-x-3">
                                    <PrimaryButton
                                        texto={loading ? "Salvando..." : "Salvar"}
                                        onClick={handleSave}
                                        disabled={loading}
                                    />
                                    <SecondaryButton
                                        texto="Cancelar"
                                        onClick={handleCancel}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-3">
                                    <div className="flex space-x-3">
                                        <PrimaryButton
                                            texto="Editar Perfil"
                                            onClick={handleEdit}
                                        />
                                        <SecondaryButton
                                            texto="Sair"
                                            onClick={handleLogout}
                                        />
                                    </div>

                                    {/* Botão para resetar perfil (apenas para testes) */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <button
                                            onClick={handleResetProfile}
                                            className="w-full px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                                        >
                                            🔄 Resetar Perfil (Teste)
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1 text-center">
                                            Remove dados do perfil para simular primeiro acesso
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}