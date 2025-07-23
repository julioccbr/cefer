"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Back from "@/app/components/Back";
import Modal from "@/app/components/Modal";
import PrimaryButton from "@/app/components/PrimaryButton";
import SecondaryButton from "@/app/components/SecondaryButton";
import { X, Check, User } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// --- Funções Auxiliares de Data (MOVIDAS PARA FORA DO COMPONENTE) ---

const getDayName = (date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return date.getDay() >= 0 && date.getDay() <= 6 ? days[date.getDay()] : '';
};

const getFullDayName = (date) => {
    if (!date || !(date instanceof Date)) {
        console.error("getFullDayName: 'date' não é um objeto Date válido. Tipo:", typeof date, "Valor:", date);
        return "";
    }
    const options = { weekday: 'long' };
    const dayName = new Intl.DateTimeFormat('pt-BR', options).format(date);
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
};

const getSundayOfReferenceWeekUtil = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sundayOfReference = new Date(today);
    if (today.getDay() === 6) { // Sábado (6)
        sundayOfReference.setDate(today.getDate() + 1);
    } else { // Domingo (0) a Sexta (5)
        sundayOfReference.setDate(today.getDate() - today.getDay());
    }
    sundayOfReference.setHours(0, 0, 0, 0);
    return sundayOfReference;
};

const getWeekdaysForBookingUtil = () => {
    const days = [];
    const sundayOfReference = getSundayOfReferenceWeekUtil();

    for (let i = 1; i <= 5; i++) { // i de 1 (Segunda) a 5 (Sexta)
        const date = new Date(sundayOfReference);
        date.setDate(sundayOfReference.getDate() + i);

        days.push({
            fullDate: date,
            numero: date.getDate().toString().padStart(2, '0'),
            diaSemanaAbreviado: getDayName(date),
            diaSemanaExtenso: getFullDayName(date),
            mesNumero: (date.getMonth() + 1).toString().padStart(2, '0'),
        });
    }
    return days;
};


// --- Componente Principal da Página de Detalhes do Espaço ---
export default function EspacoPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = params?.id;

    const [espaco, setEspaco] = useState(null);
    const [agendamentosExistentes, setAgendamentosExistentes] = useState([]);
    const [userBooking, setUserBooking] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDateInfo, setSelectedDateInfo] = useState(null);
    const [agendamentoMessage, setAgendamentoMessage] = useState(null);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [lastConfirmedBooking, setLastConfirmedBooking] = useState(null);

    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);

    const horarios = [
        "09h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h",
    ];

    const { user } = useAuth();

    const diasParaExibir = getWeekdaysForBookingUtil();


    const fetchAllAgendamentos = useCallback(async (espacoId) => {
        try {
            // FILTRO 'semanaAgendamento' REMOVIDO COMPLETAMENTE DA URL DA API.
            const res = await fetch(
                `${apiUrl}/api/agendamentos?filters[espaco][id][$eq]=${espacoId}&populate=usuario`,
                {
                    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                }
            );
            const json = await res.json();
            setAgendamentosExistentes(json.data || []);
        } catch (error) {
            console.error("Erro ao buscar agendamentos existentes (todos):", error);
            setAgendamentosExistentes([]);
        }
    }, [apiUrl, apiKey]);


    const fetchUserBooking = useCallback(async () => {
        if (!user) return;

        const sundayOfBookingWeek = getSundayOfReferenceWeekUtil();
        const startOfWeekFormatted = sundayOfBookingWeek.toISOString().split('T')[0];

        try {
            // FILTRO 'semanaAgendamento' REMOVIDO COMPLETAMENTE DA URL DA API.
            const res = await fetch(
                `${apiUrl}/api/agendamentos?filters[usuario][id][$eq]=${user.id}&populate=espaco&sort=createdAt:desc`,
                {
                    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                }
            );
            const json = await res.json();

            // Filtra os agendamentos do usuário manualmente no frontend pela semana atual/próxima.
            const userBookingsForThisWeek = (json.data || []).filter(booking => {
                const bookingDate = new Date(booking.data + 'T00:00:00');
                const bookingSunday = new Date(bookingDate);
                bookingSunday.setDate(bookingDate.getDate() - bookingDate.getDay());
                bookingSunday.setHours(0, 0, 0, 0);
                return bookingSunday.toISOString().split('T')[0] === startOfWeekFormatted;
            });

            setUserBooking(userBookingsForThisWeek.length > 0 ? userBookingsForThisWeek[0] : null);
        } catch (error) {
            console.error("Erro ao buscar agendamento do usuário:", error);
            setUserBooking(null);
        }
    }, [apiUrl, apiKey]);


    const isSlotBlocked = useCallback((slotFullDate, slotHorario) => {
        const currentDateTime = new Date();
        const [hourStr] = slotHorario.split('h');
        const slotDateTime = new Date(slotFullDate);
        slotDateTime.setHours(parseInt(hourStr), 0, 0, 0);

        if (slotDateTime < currentDateTime) { return true; }
        if (!Array.isArray(agendamentosExistentes)) { return false; }
        const formattedSlotDate = slotFullDate.toISOString().split('T')[0];
        const formattedSlotHorario = `${hourStr}:00:00.000`;

        const isBooked = agendamentosExistentes.some(agendamento => {
            return agendamento.data === formattedSlotDate && agendamento.horario === formattedSlotHorario;
        });

        return isBooked;
    }, [agendamentosExistentes]);


    const handleHorarioClick = useCallback((fullDate, diaSemanaAbreviado, horario) => {
        if (!user) {
            setIsLoginRequiredModalOpen(true);
            return;
        }

        if (isSlotBlocked(fullDate, horario)) {
            setAgendamentoMessage({ type: 'warning', text: 'Este horário não está mais disponível.' });
            return;
        }

        const diaSemanaExtenso = getFullDayName(fullDate);
        setSelectedDateInfo({ fullDate, diaSemanaAbreviado, diaSemanaExtenso, horario });
        setIsModalOpen(true);
    }, [isSlotBlocked, user]);


    const handleConfirmarAgendamento = useCallback(async () => {
        if (!selectedDateInfo || !espaco) {
            console.error("Dados para agendamento incompletos.");
            setAgendamentoMessage({ type: 'error', text: 'Dados incompletos para agendamento.' });
            setIsModalOpen(false);
            return;
        }

        const { fullDate, horario } = selectedDateInfo;
        const formattedBookingDate = fullDate.toISOString().split('T')[0];
        const [hourStr] = horario.split('h');
        const formattedBookingTime = `${hourStr}:00:00.000`;

        console.log(`Tentando agendar para: ${espaco.titulo}, dia ${formattedBookingDate}, às ${horario}`);

        try {
            const userId = user?.id;

            if (!userId) {
                setAgendamentoMessage({ type: 'error', text: 'Usuário não identificado. Faça login novamente.' });
                setIsModalOpen(false);
                return;
            }

            // Validação "um agendamento por semana" no frontend (baseado no userBooking)
            if (userBooking) {
                setIsModalOpen(false); // Fecha o modal de confirmação inicial
                setIsWarningModalOpen(true); // Abre o novo modal de aviso
                setAgendamentoMessage(null); // Limpa qualquer mensagem de barra fixa anterior
                return; // Impede o agendamento
            }

            if (isSlotBlocked(fullDate, horario)) {
                setAgendamentoMessage({ type: 'error', text: 'Este horário foi recém-ocupado ou já passou.' });
                setIsModalOpen(false);
                return;
            }

            // O campo 'semanaAgendamento' NÃO É ENVIADO NO PAYLOAD DE POST, pois foi removido do modelo do Strapi.
            const agendamentoData = {
                data: formattedBookingDate,
                horario: formattedBookingTime,
                espaco: espaco.id,
                usuario: userId,
            };

            console.log("Dados a serem enviados para o Strapi:", agendamentoData);

            const response = await fetch(`${apiUrl}/api/agendamentos`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ data: agendamentoData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro ao criar agendamento:', errorData);
                setAgendamentoMessage({ type: 'error', text: `Erro ao agendar: ${errorData.error?.message || 'Erro desconhecido. Verifique o console do servidor Strapi.'}` });
            } else {
                const result = await response.json();
                console.log('Agendamento criado com sucesso:', result);

                setLastConfirmedBooking({
                    horario: selectedDateInfo.horario,
                    data: formattedBookingDate,
                    espacoTitulo: espaco.titulo
                });
                setIsSuccessModalOpen(true); // Abre o novo modal de sucesso
                setAgendamentoMessage(null); // Limpa a mensagem fixa de sucesso anterior (se houvesse)

                await fetchAllAgendamentos(espaco.id);
                await fetchUserBooking();
            }
        } catch (error) {
            console.error("Erro geral no agendamento:", error);
            setAgendamentoMessage({ type: 'error', text: 'Ocorreu um erro inesperado ao agendar.' });
        } finally {
            setIsModalOpen(false); // Fecha o modal de confirmação inicial
        }
    }, [espaco, selectedDateInfo, userBooking, isSlotBlocked, fetchAllAgendamentos, fetchUserBooking, apiUrl, apiKey, setIsWarningModalOpen]);


    useEffect(() => {
        if (!documentId) return;

        async function initialFetch() {
            try {
                const res = await fetch(`${apiUrl}/api/espacos/${documentId}?populate=*`, {
                    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                });
                const json = await res.json();
                setEspaco(json.data);

                await fetchAllAgendamentos(json.data.id);
                if (user) {
                    await fetchUserBooking();
                }
            } catch (error) {
                console.error("Erro ao buscar espaco ou agendamentos iniciais:", error);
            }
        }
        initialFetch();
    }, [documentId, user, fetchAllAgendamentos, fetchUserBooking]);


    if (!espaco) {
        return <div className="text-center py-20 text-gray-500">Carregando espaço...</div>;
    }

    const { titulo, descricao, imagem, link_espaco } = espaco;
    const imageUrl = imagem?.url ? `${apiUrl}${imagem.url}` : '/assets/placeholder-image.jpg';


    // --- JSX de Renderização da Página ---
    return (
        <div className="relative min-h-screen">
            <Back />

            {agendamentoMessage && (
                <div className="fixed top-0 left-0 right-0 p-4 text-center z-40 bg-opacity-90 backdrop-blur-sm"
                    style={{
                        backgroundColor: agendamentoMessage.type === 'success' ? 'rgba(34, 197, 94, 0.9)' :
                            agendamentoMessage.type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
                                agendamentoMessage.type === 'warning' ? 'rgba(251, 191, 36, 0.9)' : 'rgba(0,0,0,0.7)',
                        color: agendamentoMessage.type === 'warning' ? 'black' : 'white'
                    }}
                >
                    {agendamentoMessage.text}
                    <button className="ml-4 font-bold" onClick={() => setAgendamentoMessage(null)}>&times;</button>
                </div>
            )}

            {/* Imagem de capa do espaço */}
            <div className="w-full h-[200px]">
                <img src={imageUrl} alt={titulo} className="w-full h-full object-cover" />
            </div>

            {/* Conteúdo principal da página (descrição, horários) */}
            <div className="px-[40px] pt-[24px] pb-[32px]">
                <div className="flex flex-col gap-[32px]">
                    {/* Título do espaço (o nome do espaço específico) */}
                    <h2>{titulo}</h2>

                    {/* Texto introdutório dos horários */}
                    <p className="textoIV">Para agendar um horário, basta escolher um dia e horário que esteja disponível. Você só pode agendar <b>um horário</b> na <b>mesma semana.</b></p>

                    {/* Seção de horários organizados por dia */}
                    <div className="flex flex-col gap-[40px]">
                        {diasParaExibir.length > 0 ? (
                            diasParaExibir.map((diaInfo) => (
                                <div key={diaInfo.fullDate.toISOString()} className="flex flex-row gap-[16px]">
                                    {/* Exibição do dia (Número do mês e nome abreviado do dia da semana) */}
                                    <div className="flex flex-col w-[80px] items-center">
                                        <h2>{diaInfo.numero}</h2>
                                        <h4 className="text-[#F37021]">{diaInfo.diaSemanaAbreviado}</h4>
                                    </div>
                                    {/* Grade de botões de horário para cada dia */}
                                    <div className="w-full grid grid-cols-4 gap-[10px]">
                                        {horarios.map((hora, hIndex) => {
                                            const isBlocked = isSlotBlocked(diaInfo.fullDate, hora);
                                            const buttonClasses = `
                                                w-full h-[32px] flex items-center justify-center rounded-[2px] transition
                                                ${isBlocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                                                    !user ? 'bg-gray-200 text-gray-400 cursor-pointer hover:bg-gray-300' :
                                                        'bg-white text-black cursor-pointer hover:bg-[#f0f0f0]'}
                                                focus:outline-none focus:ring-2 focus:ring-offset-2 ${isBlocked ? '' : 'focus:ring-blue-500'}
                                            `;
                                            return (
                                                <button
                                                    key={`${diaInfo.fullDate.toISOString()}-${hora}`}
                                                    onClick={() => !isBlocked && handleHorarioClick(diaInfo.fullDate, diaInfo.diaSemanaAbreviado, hora)}
                                                    disabled={isBlocked}
                                                    className={buttonClasses}
                                                >
                                                    <h4 className="textoIV">{hora}</h4>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 mt-8">
                                Não há dias úteis disponíveis para agendamento nesta semana.
                                Os agendamentos para a próxima semana estarão disponíveis em breve.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação de Agendamento (o da esquerda do Figma) */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {selectedDateInfo && (
                    <div className="flex flex-col gap-[16px]">
                        <h2 className="text-2xl font-bold text-gray-800">Confirmação</h2>

                        <div className="flex flex-col gap-[0px]">
                            <h6>Espaço:</h6>
                            <p className="textoIV">{titulo}</p>
                        </div>
                        <div className="flex flex-col gap-[0px]">
                            <h6>Data:</h6>
                            <p className="textoIV">
                                {selectedDateInfo?.fullDate ?
                                    (() => {
                                        const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                        });
                                        const formattedDayMonth = dateFormatter.format(selectedDateInfo.fullDate);

                                        const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
                                            weekday: 'long',
                                        });
                                        const formattedWeekday = weekdayFormatter.format(selectedDateInfo.fullDate);

                                        return `${formattedDayMonth}, ${formattedWeekday}`;
                                    })()
                                    : 'Data indisponível'
                                }
                            </p>
                        </div>
                        <div className="flex flex-col gap-[0px]">
                            <h6>Horário:</h6>
                            <p className="textoIV">{selectedDateInfo?.horario}</p>
                        </div>

                        <div className="h-[1px] bg-[#e0e0e0]"></div>

                        <p className="textoIV text-gray-600">Confirme os dados do seu agendamento acima. Você pode cancelar esse agendamento a qualquer momento.</p>

                        <PrimaryButton
                            texto="Agendar horário"
                            onClick={handleConfirmarAgendamento}
                        />
                    </div>
                )}
            </Modal>

            {/* Modal de Sucesso: "Agendamento Realizado!" */}
            <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
                {lastConfirmedBooking && (
                    <div className="flex flex-col items-center text-center gap-[24px]">

                        <div className="flex flex-col items-center gap-[16px]">

                            <div className="flex flex-col items-center gap-[8px] pt-[16px]">
                                {/* >>> CORREÇÃO AQUI: Círculo laranja com ícone CheckCircle <<< */}
                                <div className="w-[48px] h-[48px] rounded-full bg-green-500 flex items-center justify-center">
                                    <Check size={32} className="text-white" /> {/* Ícone branco maior */}
                                </div>

                                {/* Ajustar o gap aqui para 8px se precisar de espaçamento específico */}
                                <h2 className="text-2xl font-bold text-gray-800">Agendamento realizado!</h2> {/* Adicionado marginTop para 8px */}
                            </div>

                            <p className="text-gray-600">
                                O horário das <strong>{lastConfirmedBooking.horario?.substring(0, 5)}</strong> no dia <strong>{" "}
                                    {lastConfirmedBooking.data ?
                                        (() => {
                                            const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
                                            const formattedDayMonth = dateFormatter.format(new Date(lastConfirmedBooking.data + 'T00:00:00'));
                                            const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
                                            const formattedWeekday = weekdayFormatter.format(new Date(lastConfirmedBooking.data + 'T00:00:00'));
                                            return `${formattedDayMonth}, ${formattedWeekday}`;
                                        })()
                                        : 'Data indisponível'
                                    }
                                    {" "}</strong>foi reservado! Caso queira reservar outro horário, basta cancelar esse agendamento na página inicial.
                            </p>

                        </div>

                        <PrimaryButton
                            texto="Ok, voltar"
                            onClick={() => setIsSuccessModalOpen(false)}
                        />
                    </div>
                )}
            </Modal>

            {/* Modal de Aviso: "Você já possui uma reserva" */}
            <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)}>
                <div className="flex flex-col items-center text-center gap-[24px]">

                    <div className="flex flex-col items-center gap-[16px]">

                        <div className="flex flex-col items-center gap-[8px] pt-[16px]">
                            {/* >>> CORREÇÃO AQUI: Círculo laranja com ícone CheckCircle <<< */}
                            <div className="w-[48px] h-[48px] rounded-full bg-[#F37021] flex items-center justify-center">
                                <X size={32} className="text-white" /> {/* Ícone branco maior */}
                            </div>

                            {/* Ajustar o gap aqui para 8px se precisar de espaçamento específico */}
                            <h2 className="text-2xl font-bold text-gray-800">Você já possui uma reserva!</h2> {/* Adicionado marginTop para 8px */}
                        </div>

                        <p className="text-gray-600">
                            Você só pode agendar um horário por semana. Para reservar outro horário, cancele sua reserva atual na página inicial.
                        </p>

                    </div>

                    <PrimaryButton
                        texto="Ok, voltar"
                        onClick={() => setIsWarningModalOpen(false)}
                    />
                </div>
            </Modal>

            {/* Modal de Login Necessário */}
            <Modal isOpen={isLoginRequiredModalOpen} onClose={() => setIsLoginRequiredModalOpen(false)}>
                <div className="flex flex-col items-center text-center gap-[24px]">

                    <div className="flex flex-col items-center gap-[16px]">

                        <div className="flex flex-col items-center gap-[8px] pt-[16px]">
                            {/* Círculo laranja com ícone de usuário */}
                            <div className="w-[48px] h-[48px] rounded-full bg-[#F37021] flex items-center justify-center">
                                <User size={32} className="text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800">Login Necessário</h2>
                        </div>

                        <p className="text-gray-600">
                            Para agendar horários, você precisa fazer login na sua conta.
                        </p>

                    </div>

                    <div className="flex flex-col gap-[8px] w-full">
                        <PrimaryButton
                            texto="Fazer Login"
                            onClick={() => {
                                setIsLoginRequiredModalOpen(false);
                                router.push('/login');
                            }}
                        />
                        <SecondaryButton
                            texto="Voltar"
                            onClick={() => setIsLoginRequiredModalOpen(false)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}