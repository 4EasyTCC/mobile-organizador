import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    TouchableOpacity, // Importado para o menu inferior
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons"; // Adicionado Feather e MaterialIcons
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context"; // Adicionado para SafeArea

// --- Definição do Tema (Copied from ChatScreen) ---
const theme = {
    colors: {
        primary: "#6366F1",
        primaryDark: "#4F46E5",
        secondary: "#8B5CF6",
        background: "#0F172A",
        backgroundSecondary: "#1E293B",
        surface: "#334155",
        white: "#FFFFFF",
        textPrimary: "#F1F5F9",
        textSecondary: "#94A3B8",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },
};

// Dados Fictícios de Estatísticas
const MOCK_STATS = {
    ganhoTotal: 78543.50, // R$ 78.543,50
    eventosRealizados: 45,
    ganhoMedioPorEvento: 1745.41, // R$ 1.745,41
    eventosProximos: 5,
    metas: [
        { periodo: "Mensal", valor: 15000, progresso: 0.72 }, // 72%
        { periodo: "Anual", valor: 150000, progresso: 0.52 }, // 52%
    ],
    ganhosMensais: [
        { mes: "Jan", valor: 8500 },
        { mes: "Fev", valor: 7200 },
        { mes: "Mar", valor: 10500 },
        { mes: "Abr", valor: 6800 },
        { mes: "Mai", valor: 12000 },
        { mes: "Jun", valor: 15543.50 },
    ],
};

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- Componente de Tela ---
export default function EarningsStatsScreen({ navigation }) {
    const [estatisticas, setEstatisticas] = useState(null);
    const [carregando, setCarregando] = useState(true);

    // Configuração do HEADER (já estava aqui)
    useEffect(() => {
        navigation.setOptions({
            title: "Estatísticas de Ganho 💰",
            headerStyle: {
                backgroundColor: theme.colors.background,
                shadowColor: "transparent",
                elevation: 0,
            },
            headerTintColor: theme.colors.white,
            headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 18,
                color: theme.colors.white,
            },
            headerBackTitle: "Voltar",
            headerBackTitleStyle: {
                color: theme.colors.white,
            },
        });

        setTimeout(() => {
            setEstatisticas(MOCK_STATS);
            setCarregando(false);
        }, 1500); // Simula o tempo de carregamento
    }, [navigation]);

    // Função auxiliar para formatar moeda
    const formatCurrency = (value) => {
        return `R$ ${value.toFixed(2).replace(".", ",")}`;
    };

    // Renderiza o Gráfico de Barras
    const renderizarGraficoBarras = () => {
        const maxValor = Math.max(...estatisticas.ganhosMensais.map(g => g.valor));
        const BAR_WIDTH = 30;
        const BAR_MARGIN = 10;
        const totalBarWidth = (BAR_WIDTH + BAR_MARGIN) * estatisticas.ganhosMensais.length;

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: theme.spacing.md }}
            >
                <View style={styles.graficoContainer}>
                    {estatisticas.ganhosMensais.map((item, index) => {
                        const barHeight = (item.valor / maxValor) * 150; // Altura máxima de 150
                        return (
                            <View key={item.mes} style={styles.barraWrapper}>
                                <Text style={styles.barraValor}>{formatCurrency(item.valor)}</Text>
                                <View style={styles.barra}>
                                    <LinearGradient
                                        colors={[theme.colors.secondary, theme.colors.primary]}
                                        style={[styles.barraInterna, { height: barHeight }]}
                                    />
                                </View>
                                <Text style={styles.barraLabel}>{item.mes}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        );
    };

    // --- NOVO: Renderiza o Menu Inferior (Bottom Tab Bar) ---
    const renderBottomTabBar = () => (
        <View style={styles.bottomTabBar}>
            <LinearGradient
                colors={["rgba(30, 41, 59, 0.95)", "rgba(15, 23, 42, 0.95)"]}
                style={styles.tabBarGradient}
            >
                {/* HOME */}
                <TouchableOpacity
                    style={styles.tabIcon}
                    onPress={() => navigation.navigate("Home")}
                >
                    <MaterialIcons name="home" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {/* GRUPOS/CHAT */}
                <TouchableOpacity
                    style={styles.tabIcon}
                    onPress={() => navigation.navigate("GruposScreen")}
                >
                    <Feather
                        name="message-circle"
                        size={24}
                        color={theme.colors.textSecondary}
                    />
                </TouchableOpacity>

                {/* Botão CENTRAL (+) */}
                <TouchableOpacity
                    style={styles.centralButton}
                    onPress={() => navigation.navigate("Etapa1")}
                >
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={styles.centralButtonGradient}
                    >
                        <Feather name="plus" size={28} color={theme.colors.white} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* ESTATÍSTICAS (Ativo) */}
                <TouchableOpacity
                    style={styles.tabIcon}
                    onPress={() => navigation.navigate("Estatisticas")}
                >
                    <Feather
                        name="bar-chart"
                        size={24}
                        color={theme.colors.primary} // Cor ATIVA
                    />
                </TouchableOpacity>

                {/* PERFIL */}
                <TouchableOpacity
                    style={styles.tabIcon}
                    onPress={() => navigation.navigate("Perfil")}
                >
                    <MaterialIcons
                        name="person"
                        size={24}
                        color={theme.colors.textSecondary}
                    />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
    // --------------------------------------------------------------------------

    // Renderiza o componente de carregamento
    if (carregando) {
        return (
            <View style={styles.carregandoContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.carregandoTexto}>Calculando suas estatísticas...</Text>
            </View>
        );
    }

    // Renderiza a tela principal
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                
                {/* --- Cartão de Visão Geral --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitulo}>Ganho Total (2025)</Text>
                    <Text style={styles.ganhoTotalTexto}>{formatCurrency(estatisticas.ganhoTotal)}</Text>
                    <View style={styles.divider} />
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="calendar-outline" size={20} color={theme.colors.secondary} />
                            <Text style={styles.statValor}>{estatisticas.eventosRealizados}</Text>
                            <Text style={styles.statLabel}>Eventos Realizados</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="trending-up-outline" size={20} color={theme.colors.success} />
                            <Text style={styles.statValor}>{formatCurrency(estatisticas.ganhoMedioPorEvento)}</Text>
                            <Text style={styles.statLabel}>Ganho Médio/Evento</Text>
                        </View>
                    </View>
                </View>

                {/* --- Cartão de Metas e Progresso --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitulo}>Progresso de Metas</Text>
                    {estatisticas.metas.map((meta, index) => (
                        <View key={index} style={styles.metaContainer}>
                            <Text style={styles.metaPeriodo}>Meta {meta.periodo} ({formatCurrency(meta.valor)})</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${meta.progresso * 100}%` }]} />
                            </View>
                            <Text style={styles.metaProgresso}>{Math.round(meta.progresso * 100)}% Concluído</Text>
                        </View>
                    ))}
                </View>
                
                {/* --- Gráfico de Ganhos Mensais --- */}
                <View style={[styles.card, { paddingHorizontal: 0 }]}>
                    <Text style={[styles.cardTitulo, { paddingHorizontal: theme.spacing.md }]}>Ganhos Mensais</Text>
                    {renderizarGraficoBarras()}
                </View>
                
                {/* --- Informação Adicional --- */}
                <View style={styles.infoContainer}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.infoTexto}>
                        Os dados são calculados com base nos eventos marcados como 'Concluído e Pago'.
                    </Text>
                </View>

            </ScrollView>
            
            {/* --- Menu Inferior --- */}
            {renderBottomTabBar()}
        </SafeAreaView>
    );
}

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.md,
        paddingBottom: 100, // IMPORTANTE: Espaço para a Tab Bar
    },
    carregandoContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
    },
    carregandoTexto: {
        marginTop: theme.spacing.md,
        color: theme.colors.textPrimary,
        fontSize: 16,
    },
    card: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    cardTitulo: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.white,
        marginBottom: theme.spacing.md,
    },
    ganhoTotalTexto: {
        fontSize: 32,
        fontWeight: "900",
        color: theme.colors.success,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.surface,
        marginVertical: theme.spacing.md,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
        maxWidth: '45%',
    },
    statValor: {
        fontSize: 20,
        fontWeight: "bold",
        color: theme.colors.textPrimary,
        marginTop: theme.spacing.sm,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
    },
    
    // Estilos de Metas
    metaContainer: {
        marginBottom: theme.spacing.md,
    },
    metaPeriodo: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
        marginVertical: theme.spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.full,
    },
    metaProgresso: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold',
        textAlign: 'right',
    },

    // Estilos do Gráfico
    graficoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 200,
        paddingBottom: theme.spacing.sm,
    },
    barraWrapper: {
        alignItems: 'center',
        width: 30,
        marginHorizontal: 10,
    },
    barra: {
        flex: 1,
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xs,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barraInterna: {
        width: '100%',
    },
    barraLabel: {
        marginTop: theme.spacing.xs,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    barraValor: {
        position: 'absolute',
        top: -20,
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        textAlign: 'center',
        width: 60,
        left: -15,
    },
    
    // Estilos de Informação
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.md,
    },
    infoTexto: {
        marginLeft: theme.spacing.sm,
        fontSize: 12,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    
    // --- ESTILOS DO BOTTOM TAB BAR ---
    bottomTabBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
    },
    tabBarGradient: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
    tabIcon: {
        padding: theme.spacing.sm,
    },
    centralButton: {
        marginBottom: theme.spacing.md,
    },
    centralButtonGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
    },
});