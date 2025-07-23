"use client";

import { Search } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CardComponent from "@/app/components/CardComponent";
import Navbar from "@/app/components/Navbar";
import Modal from "@/app/components/Modal"; // Importar o Modal
import PrimaryButton from "@/app/components/PrimaryButton"; // Importar PrimaryButton
import SecondaryButton from "@/app/components/SecondaryButton"; // Importar SecondaryButton
import { MinusCircle, Check } from "lucide-react"; // Importar o ícone X para o modal de cancelamento e Check para o novo modal de sucesso

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
    if (today.getDay() === 6) { // Se hoje for Sábado (6)
        sundayOfReference.setDate(today.getDate() + 1); // Avança para o Domingo de amanhã
    } else { // Se for qualquer outro dia (Domingo a Sexta)
        sundayOfReference.setDate(today.getDate() - today.getDay());
    }
    sundayOfReference.setHours(0, 0, 0, 0);
    return sundayOfReference;
};


// --- Variáveis de Ambiente ---
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Agendamentos() {
    const { user } = useAuth();
    // Estados para os dados da API
    const [espacos, setEspacos] = useState([]);
    const [espacosFiltrados, setEspacosFiltrados] = useState([]);
    const [loadingEspacos, setLoadingEspacos] = useState(true);
    const [errorEspacos, setErrorEspacos] = useState(null);

    // Estados para a funcionalidade de busca
    const [busca, setBusca] = useState("");

    // Estados para o agendamento do usuário simulado e mensagens do banner
    const [userBooking, setUserBooking] = useState(null);
    const [agendamentoMessage, setAgendamentoMessage] = useState(null); // Usado para a snackbar

    // Estado para o Modal de Confirmação de Cancelamento
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // NOVO ESTADO: Para o Modal de Sucesso de CANCELAMENTO
    const [isCancelSuccessModalOpen, setIsCancelSuccessModalOpen] = useState(false);
    // Podemos armazenar detalhes do cancelamento aqui se necessário, como 'lastCanceledBooking'


    // --- fetchUserBooking: AGORA SEM FILTRO 'semanaAgendamento' NA API ---
    // Pega o agendamento mais recente do usuário e filtra por semana NO FRONTEND.
    const fetchUserBooking = useCallback(async () => {
        if (!user) return;

        const sundayOfBookingWeek = getSundayOfReferenceWeekUtil();
        const startOfWeekFormatted = sundayOfBookingWeek.toISOString().split('T')[0];

        try {
            // Requisição para buscar TODOS os agendamentos do usuário (ordenados pelo mais recente)
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
                const bookingDate = new Date(booking.data + 'T00:00:00'); // Garante que a data é tratada localmente
                const bookingSunday = new Date(bookingDate);
                bookingSunday.setDate(bookingDate.getDate() - bookingDate.getDay());
                bookingSunday.setHours(0, 0, 0, 0);
                return bookingSunday.toISOString().split('T')[0] === startOfWeekFormatted;
            });

            setUserBooking(userBookingsForThisWeek.length > 0 ? userBookingsForThisWeek[0] : null);

        } catch (error) {
            console.error("Erro ao buscar agendamento do usuário na página de espaços:", error);
            setUserBooking(null);
        }
    }, [apiUrl, apiKey]);


    // Handler para abrir o modal de confirmação de cancelamento
    const handleOpenCancelModal = useCallback(() => {
        setIsCancelModalOpen(true);
    }, []);

    // Handler para executar o cancelamento e abrir o modal de sucesso de cancelamento
    const handleConfirmCancelation = useCallback(async () => {
        if (!userBooking) { // Deveria ter um userBooking para chegar aqui
            return;
        }
        setIsCancelModalOpen(false); // Fecha o modal de confirmação de cancelamento

        try {
            // USANDO userBooking.documentId para a URL de DELETE
            const deleteRes = await fetch(`${apiUrl}/api/agendamentos/${userBooking.documentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${apiKey}` }
            });
            if (deleteRes.ok) {
                // >>> NOVO: Abrir o modal de sucesso de cancelamento <<<
                setIsCancelSuccessModalOpen(true);
                setUserBooking(null); // Limpa o agendamento do usuário da UI
                await fetchUserBooking(); // Re-buscar o agendamento do usuário
            } else {
                const errorData = await deleteRes.json();
                console.error("Erro na resposta do cancelamento:", errorData);
                setAgendamentoMessage({ type: 'error', text: `Erro ao cancelar: ${errorData.error?.message || 'Tente novamente.'}` }); // Snackbar de erro
                setTimeout(() => setAgendamentoMessage(null), 3000); // Esconde a mensagem após 3 segundos
            }
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
            setAgendamentoMessage({ type: 'error', text: 'Ocorreu um erro ao cancelar a reserva.' }); // Snackbar de erro
            setTimeout(() => setAgendamentoMessage(null), 3000); // Esconde a mensagem após 3 segundos
        }
    }, [userBooking, apiUrl, apiKey, fetchUserBooking]);


    useEffect(() => {
        async function fetchInitialData() {
            setLoadingEspacos(true);
            setErrorEspacos(null);
            try {
                const res = await fetch(`${apiUrl}/api/espacos?populate=*`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
                });

                const { data } = await res.json();
                const ordenados = (data || []).sort((a, b) =>
                    a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" })
                );
                setEspacos(ordenados);
                setEspacosFiltrados(ordenados);
            } catch (error) {
                console.error("Erro ao buscar espacos:", error);
                setErrorEspacos("Erro ao carregar espaços. Tente novamente.");
            } finally {
                setLoadingEspacos(false);
            }
        }

        fetchInitialData();
        if (user) {
            fetchUserBooking();
        }
    }, [apiUrl, apiKey, fetchUserBooking, user]);


    useEffect(() => {
        const normalizeText = (text) =>
            text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const termo = normalizeText(busca);
        const resultados = espacos.filter((espaco) => {
            const titulo = normalizeText(espaco.titulo || '');
            const descricao = normalizeText(espaco.descricao || '');
            return titulo.includes(termo) || descricao.includes(termo);
        });

        setEspacosFiltrados(resultados);
    }, [busca, espacos]);


    if (loadingEspacos) return (
        <div className="text-center py-20 text-gray-500">Carregando agendamentos...</div>
    );
    if (errorEspacos) return (
        <div className="text-center py-20 text-red-500">{errorEspacos}</div>
    );


    return (
        <div className="relative min-h-screen">
            <Navbar titulo={"Agendamentos"} />

            {/* Snackbar na parte inferior da tela (usando agendamentoMessage) */}
            {agendamentoMessage && (
                <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-md shadow-lg text-white z-50
                                ${agendamentoMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {agendamentoMessage.text}
                </div>
            )}

            <div className="px-[24px] pb-[32px]">
                <div className="flex flex-col gap-[32px]">
                    {userBooking ? (
                        <div className="bg-white rounded-[8px] shadow-sm p-[24px] flex flex-row gap-[24px]">
                            <div className="w-[64px] h-[64px] flex flex-col items-center justify-center">
                                <h2 className="text-xl font-bold">{new Date(userBooking.data + 'T00:00:00').getDate().toString().padStart(2, '0')}</h2>
                                <h4 className="text-[#F37021]">{getDayName(new Date(userBooking.data + 'T00:00:00'))}</h4>
                            </div>
                            <div className="flex flex-col flex-1 gap-[8px]">
                                <p className="textoIV">
                                    Você agendou o horário das <strong>{userBooking.horario?.substring(0, 5)}</strong> no espaço <strong>{" "}
                                        {userBooking.espaco?.data?.attributes?.titulo || userBooking.espaco?.titulo || 'Desconhecido'}</strong>.
                                </p>
                                <p
                                    className="link text-[#F37021] cursor-pointer"
                                    onClick={handleOpenCancelModal}
                                >
                                    Cancelar agendamento
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="textoIV">
                            Para agendar um horário, selecione o espaço desejado e confira os horários disponíveis
                        </p>
                    )}

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
                        {espacosFiltrados.length > 0 ? (
                            espacosFiltrados.map((espaco) => (
                                <CardComponent
                                    key={espaco.id}
                                    id={espaco.documentId}
                                    title={espaco.titulo}
                                    description={espaco.descricao}
                                    image={`${apiUrl}${espaco.imagem.url}`}
                                    baseUrl={"espacos"}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-[8px] py-[32px]">
                                <Search className="w-[48px] h-[48px] text-[#9e9e9e]" />
                                <p className="text-[#9e9e9e] textoIV text-center">
                                    Nenhum espaço encontrado <br /> com esse termo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação de Cancelamento */}
            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}>
                {/* >>> CONTEÚDO DO MODAL DE CANCELAMENTO (SUA ESTRUTURA) <<< */}
                <div className="flex flex-col items-center text-center gap-[24px]">

                    <div className="flex flex-col items-center gap-[16px]">

                        <div className="flex flex-col items-center gap-[8px] pt-[24px]">
                            {/* Círculo laranja com ícone X */}
                            <div className="w-[48px] h-[48px] rounded-full bg-[#F37021] flex items-center justify-center">
                                <MinusCircle size={32} className="text-white" /> {/* Ícone branco maior */}
                            </div>

                            {/* Título do modal de cancelamento */}
                            <h2 className="text-2xl font-bold text-gray-800">Cancelar reserva?</h2>
                        </div>

                    </div>
                    {/* Botões de ação do modal de cancelamento */}
                    <div className="flex flex-col gap-[8px] w-full">
                        <PrimaryButton
                            texto="Sim, cancelar"
                            onClick={handleConfirmCancelation}
                        />
                        <SecondaryButton
                            texto="Não, voltar"
                            onClick={() => setIsCancelModalOpen(false)}
                        />
                    </div>
                </div>
            </Modal>

            {/* NOVO MODAL DE SUCESSO DE CANCELAMENTO */}
            <Modal isOpen={isCancelSuccessModalOpen} onClose={() => setIsCancelSuccessModalOpen(false)}>
                {/* >>> CONTEÚDO DO MODAL DE SUCESSO DE CANCELAMENTO (SUA ESTRUTURA ADAPTADA) <<< */}
                <div className="flex flex-col items-center text-center gap-[24px]">

                    <div className="flex flex-col items-center gap-[16px]">

                        <div className="flex flex-col items-center gap-[8px] pt-[16px]">
                            {/* Círculo laranja com ícone Check (confirmando sucesso) */}
                            <div className="w-[48px] h-[48px] rounded-full bg-green-500 flex items-center justify-center"> {/* Cor verde para sucesso */}
                                <Check size={32} className="text-white" /> {/* Ícone de check branco */}
                            </div>

                            {/* Título do modal de sucesso de cancelamento */}
                            <h2 className="text-2xl font-bold text-gray-800">Reserva cancelada!</h2>
                        </div>

                        {/* Texto de confirmação de cancelamento */}
                        <p className="text-gray-600">
                            Sua reserva foi cancelada com sucesso. Você já pode agendar um novo horário.
                        </p>

                    </div>
                    {/* Botão para fechar o modal de sucesso de cancelamento */}
                    <PrimaryButton
                        texto="Ok"
                        onClick={() => setIsCancelSuccessModalOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
}