import { NextResponse } from 'next/server';

// Dados mock dos espaços
const espacosMock = [
    {
        id: 1,
        titulo: "Sala de Reuniões A",
        descricao: "Sala equipada para reuniões e apresentações",
        imagem: {
            url: "/assets/sala-a.jpg"
        },
        link_espaco: "https://example.com/sala-a"
    },
    {
        id: 2,
        titulo: "Auditório Principal",
        descricao: "Auditório com capacidade para 200 pessoas",
        imagem: {
            url: "/assets/auditorio.jpg"
        },
        link_espaco: "https://example.com/auditorio"
    },
    {
        id: 3,
        titulo: "Laboratório de Informática",
        descricao: "Laboratório com 30 computadores",
        imagem: {
            url: "/assets/lab-info.jpg"
        },
        link_espaco: "https://example.com/lab-info"
    }
];

export async function GET() {
    try {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 100));

        return NextResponse.json({
            data: espacosMock
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 