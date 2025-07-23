"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar({ titulo }) {
    const [menuAberto, setMenuAberto] = useState(false);
    const { user } = useAuth();

    return (
        <nav className="w-full flex items-center justify-between px-[24px] pt-[64px] pb-[24px]">
            <div className="flex items-center gap-4">
                <h2>{titulo}</h2>
                {user && (
                    <span className="text-sm text-gray-600 hidden md:block">
                        Olá, {user.nome}
                    </span>
                )}
            </div>

            {/* Ícone de menu (visível no mobile) */}
            <button
                className="md:hidden cursor-pointer z-50"
                onClick={() => setMenuAberto(!menuAberto)}
                aria-label="Abrir menu"
            >
                {menuAberto ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Menu de navegação (desktop) */}
            <ul className="hidden md:flex gap-[24px] text-[#141414] font-medium">
                <li><Link href="/">Página inicial</Link></li>
                <li><Link href="/espacos">Agendamentos</Link></li>
                <li><a href="#">Grupos de esporte</a></li>
                <li><a href="#">Eventos</a></li>
                {user && <li><Link href="/perfil">Perfil</Link></li>}
            </ul>

            {/* Menu mobile (toggle) */}
            {menuAberto && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0"
                        onClick={() => setMenuAberto(false)}
                    />

                    {/* Menu mobile */}
                    <ul className="w-[240px] absolute top-[100px] right-[24px] bg-white md:hidden rounded-[16px] rounded-tr-none overflow-hidden divide-y divide-[#ededed] divide-[0.5px] z-10">
                        {[
                            { nome: "Página inicial", href: "/" },
                            { nome: "Agendamentos", href: "/espacos" },
                            { nome: "Grupos de esporte", href: "/grupos" },
                            { nome: "Eventos", href: "/eventos" },
                            ...(user ? [{ nome: "Perfil", href: "/perfil" }] : []),
                        ].map((item, index) => (
                            <li key={index} className="px-4 py-4">
                                <Link href={item.href} className="textoIV text-[#141414]">
                                    {item.nome}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


        </nav>
    );
}
