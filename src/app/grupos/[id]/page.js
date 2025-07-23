"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Back from "@/app/components/Back";
import PrimaryButton from "@/app/components/PrimaryButton";
import SecondaryButton from "@/app/components/SecondaryButton";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function GrupoPage() {

    const params = useParams();
    const documentId = params?.id;
    const [grupo, setGrupo] = useState(null);

    useEffect(() => {

        if (!documentId) return;

        async function fetchGrupo() {
            try {
                const res = await fetch(`${apiUrl}/api/grupos/${documentId}?populate=*`, {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                });

                const json = await res.json();
                setGrupo(json.data); // aqui é direto, não tem array
            } catch (error) {
                console.error("Erro ao buscar grupo:", error);
            }
        }

        fetchGrupo();

    }, [documentId]);

    if (!grupo) {
        return <div className="text-center py-20 text-gray-500">Carregando grupo...</div>;
    }

    const { titulo, descricao, imagem, link_grupo } = grupo;

    return (
        <div>
            <Back />
            {/* Imagem de capa */}
            <div className="w-full h-[360px]">
                <img
                    src={`${apiUrl}${imagem.url}`}
                    alt={titulo}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Conteúdo abaixo da imagem */}
            <div className="px-[40px] pt-[24px] pb-[32px]">
                <div className="flex flex-col gap-[32px]">
                    <div className="flex flex-col gap-[16px]">
                        <h2>{titulo}</h2>
                        <p className="textoIV">{descricao}</p>
                        <p className="textoIV">Para participar do grupo e ver mais informações, entre no grupo do WhatsApp pelo botão abaixo!</p>
                    </div>
                    <div className="flex flex-col gap-[8px]">
                        <PrimaryButton texto="Entrar no grupo" onClick={() => window.open(link_grupo, "_blank")} />
                        <SecondaryButton texto="Voltar" onClick={() => window.history.back()} />
                    </div>
                </div>
            </div>
        </div>
    );
}
