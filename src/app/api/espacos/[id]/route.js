import { NextResponse } from 'next/server';

// Dados mock dos espaços
const espacosMock = [
    {
        id: 1,
        titulo: "Sala de Reuniões A",
        descricao: "Sala equipada para reuniões e apresentações com projetor, quadro branco e sistema de áudio. Ideal para reuniões de equipe e apresentações.",
        imagem: {
            url: "/assets/sala-a.jpg"
        },
        link_espaco: "https://example.com/sala-a"
    },
    {
        id: 2,
        titulo: "Auditório Principal",
        descricao: "Auditório com capacidade para 200 pessoas, equipado com sistema de projeção, áudio profissional e palco. Perfeito para eventos e palestras.",
        imagem: {
            url: "/assets/auditorio.jpg"
        },
        link_espaco: "https://example.com/auditorio"
    },
    {
        id: 3,
        titulo: "Laboratório de Informática",
        descricao: "Laboratório com 30 computadores, projetor e sistema de rede. Ideal para aulas práticas e workshops de tecnologia.",
        imagem: {
            url: "/assets/lab-info.jpg"
        },
        link_espaco: "https://example.com/lab-info"
    }
];

export async function GET(request, { params }) {
    try {
        const id = parseInt(params.id);
        const espaco = espacosMock.find(e => e.id === id);

        if (!espaco) {
            return NextResponse.json(
                { error: 'Espaço não encontrado' },
                { status: 404 }
            );
        }

        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 100));

        return NextResponse.json({
            data: espaco
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 