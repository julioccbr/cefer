"use client";

import { useAuth } from '@/contexts/AuthContext';

export default function USPUserInfo() {
    const { user } = useAuth();

    if (!user || !user.uspData) {
        return null;
    }

    const { uspData } = user;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações USP</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600">Login USP</label>
                    <p className="text-gray-800 font-medium">{uspData.loginUsuario}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600">Nome</label>
                    <p className="text-gray-800 font-medium">{uspData.nomeUsuario}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600">Tipo de Usuário</label>
                    <p className="text-gray-800 font-medium">
                        {uspData.tipoUsuario === 'I' ? 'Interno (USP)' : 'Externo'}
                    </p>
                </div>

                {uspData.emailPrincipalUsuario && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email Principal</label>
                        <p className="text-gray-800">{uspData.emailPrincipalUsuario}</p>
                    </div>
                )}

                {uspData.emailUspUsuario && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email USP</label>
                        <p className="text-gray-800">{uspData.emailUspUsuario}</p>
                    </div>
                )}

                {uspData.emailAlternativoUsuario && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email Alternativo</label>
                        <p className="text-gray-800">{uspData.emailAlternativoUsuario}</p>
                    </div>
                )}

                {uspData.numeroTelefoneFormatado && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Telefone</label>
                        <p className="text-gray-800">{uspData.numeroTelefoneFormatado}</p>
                    </div>
                )}
            </div>

            {uspData.vinculo && uspData.vinculo.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Vínculos USP</h4>
                    <div className="space-y-3">
                        {uspData.vinculo.map((vinculo, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Tipo de Vínculo</label>
                                        <p className="text-gray-800 font-medium">{vinculo.nomeVinculo}</p>
                                        <p className="text-sm text-gray-500">{vinculo.tipoVinculo}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Unidade</label>
                                        <p className="text-gray-800 font-medium">{vinculo.nomeUnidade}</p>
                                        <p className="text-sm text-gray-500">{vinculo.siglaUnidade}</p>
                                    </div>

                                    {vinculo.nomeSetor && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Setor</label>
                                            <p className="text-gray-800">{vinculo.nomeSetor}</p>
                                            {vinculo.nomeAbreviadoSetor && (
                                                <p className="text-sm text-gray-500">{vinculo.nomeAbreviadoSetor}</p>
                                            )}
                                        </div>
                                    )}

                                    {vinculo.nomeAbreviadoFuncao && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Função</label>
                                            <p className="text-gray-800">{vinculo.nomeAbreviadoFuncao}</p>
                                            {vinculo.tipoFuncao && (
                                                <p className="text-sm text-gray-500">{vinculo.tipoFuncao}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 