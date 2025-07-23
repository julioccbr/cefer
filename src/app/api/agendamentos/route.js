import { NextResponse } from 'next/server';

// Dados mock dos agendamentos
let agendamentosMock = [
    {
        id: 1,
        data: "2024-04-08",
        horario: "09:00:00.000",
        espaco: {
            id: 1,
            titulo: "Sala de Reuniões A"
        },
        usuario: {
            id: "user123",
            name: "João Silva"
        }
    },
    {
        id: 2,
        data: "2024-04-08",
        horario: "14:00:00.000",
        espaco: {
            id: 2,
            titulo: "Auditório Principal"
        },
        usuario: {
            id: "user456",
            name: "Maria Santos"
        }
    }
];

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const espacoId = searchParams.get('filters[espaco][id][$eq]');
        const usuarioId = searchParams.get('filters[usuario][id][$eq]');

        let filteredAgendamentos = agendamentosMock;

        // Filtrar por espaço
        if (espacoId) {
            filteredAgendamentos = filteredAgendamentos.filter(
                a => a.espaco.id === parseInt(espacoId)
            );
        }

        // Filtrar por usuário
        if (usuarioId) {
            filteredAgendamentos = filteredAgendamentos.filter(
                a => a.usuario.id === usuarioId
            );
        }

        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 100));

        return NextResponse.json({
            data: filteredAgendamentos
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { data: agendamentoData } = body;

        // Criar novo agendamento
        const novoAgendamento = {
            id: Date.now(),
            data: agendamentoData.data,
            horario: agendamentoData.horario,
            espaco: {
                id: agendamentoData.espaco,
                titulo: "Espaço Mock"
            },
            usuario: {
                id: agendamentoData.usuario,
                name: "Usuário Mock"
            }
        };

        agendamentosMock.push(novoAgendamento);

        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 200));

        return NextResponse.json({
            data: novoAgendamento
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 