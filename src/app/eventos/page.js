"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import CardComponent from "@/app/components/CardComponent";
import Navbar from "@/app/components/Navbar";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Eventos() {

    const [eventos, setEventos] = useState([]);
    const [eventosFiltrados, setEventosFiltrados] = useState([]);
    const [busca, setBusca] = useState("");

    // Carrega os eventos da API
    useEffect(() => {
        async function fetchEventos() {
            try {
                const res = await fetch(`${apiUrl}/api/eventos?populate=*`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                });

                const { data } = await res.json();
                const ordenados = data.sort((a, b) =>
                    a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" })
                );
                setEventos(ordenados);
                setEventosFiltrados(ordenados);
            } catch (error) {
                console.error("Erro:", error);
            }
        }

        fetchEventos();
    }, []);

    // Filtra os eventos quando o texto de busca muda
    useEffect(() => {
        const normalizeText = (text) =>
            text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const termo = normalizeText(busca);
        const resultados = eventos.filter((evento) => {
            const titulo = normalizeText(evento.titulo);
            const descricao = normalizeText(evento.descricao);
            return titulo.includes(termo) || descricao.includes(termo);
        });

        setEventosFiltrados(resultados);
    }, [busca, eventos]);

    return (
        <div>
            <Navbar titulo={"Eventos"} />
            <div className="px-[24px] pb-[32px]">
                <div className="flex flex-col gap-[32px]">
                    <p className="textoIV">
                        Confira os eventos em conjunto do CEFER e garanta sua participação se inscrevendo
                    </p>
                    <div className="relative w-full">
                        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                            <Search className="w-[24px] h-[24px] text-[#9e9e9e]" />
                        </div>

                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="bg-[#e0e0e0] w-full pl-[56px] pr-4 py-4 rounded-sm text-[#141414] placeholder-[#9e9e9e] focus:outline-none focus:bg-[#e5e5e5] transition-colors duration-200"
                        />

                    </div>

                    <div className="flex flex-col gap-[16px]">
                        {eventosFiltrados.length > 0 ? (
                            eventosFiltrados.map((evento, index) => (
                                <CardComponent
                                    key={index}
                                    id={evento.documentId}
                                    title={evento.titulo}
                                    description={evento.descricao}
                                    image={`${apiUrl}${evento.imagem.url}`}
                                    baseUrl={"eventos"}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-[8px] py-[32px]">
                                <Search className="w-[48px] h-[48px] text-[#9e9e9e]" />
                                <p className="text-[#9e9e9e] textoIV text-center">
                                    Nenhum evento encontrado <br /> com esse termo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
