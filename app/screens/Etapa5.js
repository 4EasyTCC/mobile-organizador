import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  StatusBar,
} from "react-native";
import { MaterialIcons, AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

// Definição do tema para consistência
const theme = {
  colors: {
    primary: "#6366F1", // Indigo
    primaryDark: "#4F46E5",
    secondary: "#8B5CF6", // Violet/Fuchsia-ish
    background: "#0F172A", // Dark Blue/Slate
    backgroundSecondary: "#1E293B", // Slightly lighter Dark Blue/Slate
    surface: "#334155", // Even lighter Slate
    white: "#FFFFFF",
    textPrimary: "#F1F5F9", // Off-white
    textSecondary: "#94A3B8", // Light Slate/Gray
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

export default function Etapa5({ navigation }) {
  const [dadosEvento, setDadosEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [criarChat, setCriarChat] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosEventoString = await AsyncStorage.getItem("@evento");
        const dadosEvento = dadosEventoString
          ? JSON.parse(dadosEventoString)
          : null;

        if (!dadosEvento) {
          Alert.alert("Erro", "Não foi possível carregar os dados do evento");
          navigation.navigate("Etapa1"); // Volta para o início se não houver dados
          return;
        }

        setDadosEvento(dadosEvento);
      } catch (error) {
        console.error("Erro ao carregar evento:", error);
        Alert.alert("Erro", "Falha ao carregar dados");
        navigation.navigate("Etapa1");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const enviarEvento = async () => {
    try {
      if (!dadosEvento) return;

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Erro", "Você precisa estar logado para criar um evento");
        return;
      }

      setCarregando(true);

      const ingressosComValoresPadrao =
        dadosEvento.ingressos?.map((ingresso) => ({
          nome: ingresso.nome || "Ingresso",
          quantidade: ingresso.quantidade || 0,
          preco: ingresso.preco || 0,
          descricao: ingresso.descricao || "",
          dataLimiteVenda: ingresso.dataLimiteVenda || null,
        })) || [];
      
const fotosParaEnviar = dadosEvento.fotos || []; 

const dadosParaEnviar = {
    nome: dadosEvento.nome,
    descricao: dadosEvento.descricao,
    tipo: dadosEvento.tipo,
    privacidade: dadosEvento.privacidade,
    dataInicio: new Date(dadosEvento.dataInicio).toISOString(), 
    dataFim: new Date(dadosEvento.dataFim || dadosEvento.dataInicio).toISOString(),
    localizacao: dadosEvento.localizacao,
    fotos: fotosParaEnviar, 
    ingressos: ingressosComValoresPadrao,
    criarChat: criarChat,
};


      console.log("Enviando dados:", dadosParaEnviar);

      const response = await axios.post(`${API_URL}/eventos`, dadosParaEnviar, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      let mensagemSucesso = "Evento criado com sucesso!";

      if (criarChat && response.data.grupoChat) {
        mensagemSucesso += " Grupo de chat criado automaticamente.";
      }

      Alert.alert("Sucesso!", mensagemSucesso, [
        {
          text: "OK",
          onPress: () => {
            AsyncStorage.removeItem("@evento");
            navigation.navigate("Home");
          },
        },
      ]);
    } catch (error) {
      console.error("Erro detalhado ao criar evento:", error);

      let mensagemErro = "Não foi possível criar o evento";

      if (error.response) {
        mensagemErro = error.response.data.message || mensagemErro;
        console.error("Resposta do servidor:", error.response.data);
      } else if (error.request) {
        mensagemErro = "Erro de conexão. Verifique sua internet.";
      } else {
        mensagemErro = error.message || mensagemErro;
      }

      Alert.alert("Erro", mensagemErro);
    } finally {
        setCarregando(false);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando dados do evento...</Text>
      </View>
    );
  }

  if (!dadosEvento) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Não foi possível carregar os dados do evento 😥
        </Text>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.navigate("Etapa1")}
        >
          <Text style={styles.botaoTextoVoltar}>Voltar para o Início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const capa = dadosEvento.midia?.find(m => m.tipo === 'capa') || dadosEvento.fotos?.find(m => m.tipo === 'capa');

  const getStepNavigation = (step) => {
    switch (step) {
      case 'Geral': return 'Etapa1';
      case 'Local': return 'Etapa2';
      case 'Mídia': return 'Etapa3';
      case 'Ingressos': return 'Etapa4';
      default: return null;
    }
  };

  const renderInfoItem = (label, value, stepKey = null) => (
    <View style={styles.item}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value}</Text>
        {stepKey && (
            <TouchableOpacity 
                onPress={() => navigation.navigate(getStepNavigation(stepKey))}
                style={styles.editButton}
            >
                <Feather name="edit-3" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
        )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.background}
        />
        <ScrollView contentContainerStyle={styles.container}>
            
            <View style={styles.headerTitleContainer}>
                <Ionicons name="sparkles" size={32} color={theme.colors.secondary} />
                <Text style={styles.titulo}>Confirmação Final</Text>
            </View>

            {/* CARD 1: Informações Básicas */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialIcons name="info-outline" size={24} color={theme.colors.primary} />
                    <Text style={styles.cardTitulo}>1. Informações Básicas</Text>
                </View>
                {renderInfoItem('Nome:', dadosEvento.nome, 'Geral')}
                {renderInfoItem('Tipo:', dadosEvento.tipo, 'Geral')}
                {renderInfoItem('Privacidade:', dadosEvento.privacidade, 'Geral')}
                {renderInfoItem('Data Início:', formatarData(dadosEvento.dataInicio), 'Geral')}
                
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Descrição:</Text>
                    <Text style={styles.itemValue}>{dadosEvento.descricao}</Text>
                </View>
            </View>

            {/* CARD 2: Localização */}
            {dadosEvento.localizacao && (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="location-on" size={24} color={theme.colors.warning} />
                        <Text style={styles.cardTitulo}>2. Localização</Text>
                    </View>
                    {renderInfoItem('Endereço:', dadosEvento.localizacao.endereco, 'Local')}
                    {renderInfoItem('Cidade/Estado:', `${dadosEvento.localizacao.cidade || ''} / ${dadosEvento.localizacao.estado || ''}`, 'Local')}
                </View>
            )}

            {/* CARD 3: Mídia */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialIcons name="image" size={24} color={theme.colors.secondary} />
                    <Text style={styles.cardTitulo}>3. Mídia</Text>
                </View>
                {renderInfoItem('Foto de Capa:', capa ? 'Adicionada' : 'Faltando', 'Mídia')}
                {renderInfoItem('Fotos na Galeria:', `${dadosEvento.midia?.filter(m => m.tipo === 'galeria').length || 0} fotos`, 'Mídia')}
            </View>


            {/* CARD 4: Ingressos */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialIcons name="local-activity" size={24} color={theme.colors.success} />
                    <Text style={styles.cardTitulo}>4. Ingressos</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Etapa4')} style={styles.editButtonHeader}>
                         <Feather name="edit-3" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
                {dadosEvento.ingressos?.length > 0 ? (
                    dadosEvento.ingressos.map((ingresso, index) => (
                        <View key={index} style={styles.ingressoItem}>
                            <Text style={styles.ingressoNome}>{ingresso.nome}</Text>
                            <Text style={styles.ingressoDetalhes}>
                                R$ {ingresso.preco?.toFixed(2).replace('.', ',')} • {ingresso.quantidade} vagas
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Nenhum ingresso configurado.</Text>
                )}
            </View>

            {/* CARD 5: Configurações */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialIcons name="chat" size={24} color={theme.colors.primary} />
                    <Text style={styles.cardTitulo}>5. Configurações de Chat</Text>
                </View>
                <View style={styles.chatOption}>
                    <Text style={styles.chatOptionText}>
                        Criar grupo de chat para o evento
                    </Text>
                    <Switch
                        value={criarChat}
                        onValueChange={setCriarChat}
                        trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                        thumbColor={criarChat ? theme.colors.white : theme.colors.textSecondary}
                        ios_backgroundColor={theme.colors.surface}
                    />
                </View>
                <Text style={styles.chatDescription}>
                    Um grupo de chat será criado automaticamente para os participantes.
                </Text>
            </View>

            {/* BOTÃO FINAL */}
            <TouchableOpacity
                style={[styles.botaoConfirmar, carregando && styles.botaoConfirmarDisabled]}
                onPress={enviarEvento}
                activeOpacity={0.8}
                disabled={carregando}
            >
                <LinearGradient
                    colors={carregando ? [theme.colors.surface, theme.colors.surface] : [theme.colors.success, '#1f9b7c']}
                    style={styles.botaoConfirmarGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {carregando ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                        <>
                            <AntDesign name="checkcircleo" size={20} color="white" />
                            <Text style={styles.botaoTexto}>Confirmar e Criar Evento</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.botaoTextoVoltar}>Voltar para editar</Text>
            </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background, 
    paddingBottom: theme.spacing.xl * 2,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
  card: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  item: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm,
    alignItems: "flex-start",
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  itemLabel: {
    fontWeight: "600",
    width: 140,
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  itemValue: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  descriptionContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  descriptionLabel: {
    fontWeight: "600",
    color: theme.colors.textSecondary,
    fontSize: 15,
    marginBottom: theme.spacing.xs,
  },
  ingressoItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  ingressoNome: {
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  ingressoDetalhes: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  chatOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  chatOptionText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.md,
    fontWeight: "500",
  },
  chatDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  // --- BUTTONS ---
  botaoConfirmar: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginTop: theme.spacing.lg,
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  botaoConfirmarGradient: {
    padding: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  botaoConfirmarDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  botaoTexto: {
    color: theme.colors.white,
    fontWeight: "bold",
    marginLeft: theme.spacing.sm,
    fontSize: 18,
  },
  botaoVoltar: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  botaoTextoVoltar: {
    color: theme.colors.textSecondary, 
    fontWeight: "600",
    fontSize: 16,
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  editButton: {
    paddingLeft: theme.spacing.md,
  },
  editButtonHeader: {
      padding: theme.spacing.xs,
  }
});
