"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Verificar se há um usuário salvo no localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('userData');

            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (error) {
                    console.error('Erro ao parsear dados do usuário:', error);
                    localStorage.removeItem('userData');
                }
            }
        }
        setLoading(false);
    }, []);

    // Login USP com dados completos
    const loginUSP = async (uspUser) => {
        try {
            if (typeof window === 'undefined') {
                return { success: false, error: 'Executando no servidor' };
            }

            // Verificar se o usuário já existe no banco
            const existingUser = localStorage.getItem(`user_${uspUser.id}`);

            if (existingUser) {
                // Usuário já existe, carregar dados do banco
                const userData = JSON.parse(existingUser);
                setUser(userData);
                localStorage.setItem('userData', JSON.stringify(userData));

                return { success: true, isFirstAccess: false };
            } else {
                // Primeiro acesso, salvar dados básicos
                const newUser = {
                    id: uspUser.id,
                    name: uspUser.name,
                    email: uspUser.email,
                    type: uspUser.type,
                    phone: uspUser.phone,
                    vinculos: uspUser.vinculos || [],
                    uspData: uspUser.uspData,
                    isFirstAccess: true
                };

                setUser(newUser);
                localStorage.setItem('userData', JSON.stringify(newUser));
                localStorage.setItem(`user_${uspUser.id}`, JSON.stringify(newUser));

                return { success: true, isFirstAccess: true };
            }
        } catch (error) {
            console.error('Erro no login USP:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    };

    // Completar perfil no primeiro acesso
    const completeProfile = async (profileData) => {
        try {
            if (typeof window === 'undefined') {
                return { success: false, error: 'Executando no servidor' };
            }

            const updatedUser = {
                ...user,
                name: profileData.name || user.name,
                phone: profileData.phone || user.phone,
                isFirstAccess: false
            };

            // Salvar no "banco" (localStorage para simulação)
            localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));

            setUser(updatedUser);
            localStorage.setItem('userData', JSON.stringify(updatedUser));

            return { success: true };
        } catch (error) {
            console.error('Erro ao completar perfil:', error);
            return { success: false, error: 'Erro ao salvar dados' };
        }
    };

    // Atualizar perfil
    const updateProfile = async (profileData) => {
        try {
            if (typeof window === 'undefined') {
                return { success: false, error: 'Executando no servidor' };
            }

            const updatedUser = {
                ...user,
                name: profileData.name || user.name,
                phone: profileData.phone || user.phone
            };

            // Atualizar no "banco" (localStorage para simulação)
            localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));

            setUser(updatedUser);
            localStorage.setItem('userData', JSON.stringify(updatedUser));

            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            return { success: false, error: 'Erro ao atualizar dados' };
        }
    };

    // Login tradicional (mantido para compatibilidade)
    const login = async (email, password) => {
        try {
            const response = await fetch(`${apiUrl}/api/auth/local`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.jwt) {
                const userResponse = await fetch(`${apiUrl}/api/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${data.jwt}`,
                    },
                });

                const userData = await userResponse.json();

                const userInfo = {
                    id: userData.id,
                    email: userData.email,
                    username: userData.username,
                    name: userData.nome || userData.username,
                    phone: userData.telefone,
                };

                setUser(userInfo);
                localStorage.setItem('authToken', data.jwt);
                localStorage.setItem('userData', JSON.stringify(userInfo));

                return { success: true, user: userInfo };
            } else {
                return { success: false, error: data.error?.message || 'Erro no login' };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    };

    const logout = () => {
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            // Limpar dados OAuth da USP
            localStorage.removeItem('usp_oauth_request_token');
            localStorage.removeItem('usp_oauth_access_token');
            localStorage.removeItem('usp_oauth_user_info');
        }
    };

    const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    };

    const value = {
        user,
        loading,
        login,
        loginUSP,
        completeProfile,
        updateProfile,
        logout,
        getAuthToken,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 