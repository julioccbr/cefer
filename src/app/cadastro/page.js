"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Back from '@/app/components/Back';
import PrimaryButton from '@/app/components/PrimaryButton';

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function CadastroPage() {
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const router = useRouter();

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
        setSuccess('');

        // Validações
        if (!formData.nome || !formData.telefone || !formData.email || !formData.password) {
            setError('Por favor, preencha todos os campos');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/auth/local/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.email, // Usar email como username
                    email: formData.email,
                    password: formData.password,
                    nome: formData.nome,
                    telefone: formData.telefone,
                }),
            });

            const data = await response.json();

            if (data.jwt) {
                setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.error?.message || 'Erro ao realizar cadastro');
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            setError('Erro de conexão');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Back />

            <div className="px-4 py-8">
                <div className="max-w-md mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Cadastro
                        </h1>
                        <p className="text-gray-600">
                            Crie sua conta para acessar o sistema de agendamento
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                                {success}
                            </div>
                        )}

                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo
                            </label>
                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Telefone
                            </label>
                            <input
                                id="telefone"
                                name="telefone"
                                type="tel"
                                value={formData.telefone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="(11) 99999-9999"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email USP
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="seu.email@usp.br"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmar Senha
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Confirme sua senha"
                                required
                            />
                        </div>

                        <PrimaryButton
                            texto={loading ? "Criando conta..." : "Criar conta"}
                            onClick={handleSubmit}
                            disabled={loading}
                            type="submit"
                        />
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <button
                                className="text-blue-600 hover:text-blue-500 font-medium"
                                onClick={() => router.push('/login')}
                            >
                                Faça login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 