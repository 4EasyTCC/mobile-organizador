import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

// Definição do tema (copiado do arquivo de GruposScreen/HomeScreen)
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

export default function EventDetails({ route, navigation }) {
  const { evento } = route.params;
  const [selectedTab, setSelectedTab] = useState("Informações");
  const [eventoDetalhes, setEventoDetalhes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarEvento();
  }, []);

  const buscarEvento = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        // Redireciona para o login se não houver token
        navigation.navigate("Login");
        return;
      }

      const idDoEvento = evento.id;
      const response = await fetch(`${API_URL}/api/eventos/${idDoEvento}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro na resposta do servidor.");
      }

      setEventoDetalhes(data.evento);
    } catch (err) {
      console.error("Erro ao carregar evento:", err);
      Alert.alert(
        "Erro",
        "Não foi possível carregar os detalhes do evento. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditIngresso = (ingresso) => {
    Alert.alert(
      "Editar Ingresso",
      `Você clicou para editar o ingresso ${ingresso.nome}`
    );
    // TODO: Implementar navegação ou modal para a tela de edição de ingresso
  };

  // Funções de formatação (ajustadas para o contexto)
  const formatarData = (dataString) => {
    if (!dataString) return "Data não informada";
    try {
      return new Date(dataString).toLocaleDateString("pt-BR");
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatarHora = (dataString) => {
    if (!dataString) return "--:--";
    try {
      return new Date(dataString).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "--:--";
    }
  };

  const renderInfoRow = (iconName, text) => (
    <View style={styles.infoRow}>
      <Ionicons name={iconName} size={20} color={theme.colors.primary} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  const renderTabContent = () => {
    if (!eventoDetalhes) return null;

    switch (selectedTab) {
      case "Informações":
        const enderecoCompleto = eventoDetalhes.localizacao?.endereco
          ? `${eventoDetalhes.localizacao.endereco}, ${
              eventoDetalhes.localizacao.cidade || ""
            } - ${eventoDetalhes.localizacao.estado || ""}`.trim()
          : "Endereço não informado";

        return (
          <View style={styles.card}>
            {renderInfoRow("location-outline", enderecoCompleto)}
            {renderInfoRow(
              "calendar-outline",
              `Data: ${formatarData(eventoDetalhes.dataInicio)}`
            )}
            {renderInfoRow(
              "time-outline",
              `Horário: ${formatarHora(eventoDetalhes.dataInicio)} - ${formatarHora(
                eventoDetalhes.dataFim
              )}`
            )}
            <View style={styles.divider} />
            <Text style={styles.organizadorTitle}>Organizador</Text>
            <Text style={styles.organizadorText}>
              {eventoDetalhes.organizador?.nome || "Organizador desconhecido"}
            </Text>
          </View>
        );

      case "Galeria":
        const fotosGaleria = eventoDetalhes.Midia?.filter(
          (m) => m.tipo === "galeria"
        );
        return (
          <View style={styles.galleryContainer}>
            {fotosGaleria?.length > 0 ? (
              <FlatList
                data={fotosGaleria}
                keyExtractor={(item) => item.midiaId.toString()}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: `${API_URL}${item.url}` }}
                    style={styles.galleryImage}
                  />
                )}
                numColumns={2}
                columnWrapperStyle={styles.galleryRow}
              />
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyStateText}>
                  Nenhuma foto na galeria.
                </Text>
              </View>
            )}
          </View>
        );

      case "Ingressos":
        return (
          <View style={styles.ingressoCardsContainer}>
            {eventoDetalhes.Ingressos?.length > 0 ? (
              eventoDetalhes.Ingressos.map((ing) => (
                <View key={ing.ingressoId} style={styles.ingressoCard}>
                  <View style={styles.ingressoHeader}>
                    <Text style={styles.ingressoTitulo}>{ing.nome}</Text>
                    <TouchableOpacity
                      onPress={() => handleEditIngresso(ing)}
                      style={styles.editButton}
                    >
                      <Feather name="edit-3" size={20} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.ingressoDetails}>
                    <View style={styles.ingressoDetailItem}>
                      <Text style={styles.ingressoDetailTitle}>Preço</Text>
                      <Text style={styles.ingressoDetailText}>
                        R$ {ing.preco?.toFixed(2).replace(".", ",") || "0,00"}
                      </Text>
                    </View>
                    <View style={styles.ingressoDetailItem}>
                      <Text style={styles.ingressoDetailTitle}>Quantidade</Text>
                      <Text style={styles.ingressoDetailText}>
                        {ing.quantidade || 0}
                      </Text>
                    </View>
                    <View style={styles.ingressoDetailItem}>
                      <Text style={styles.ingressoDetailTitle}>
                        Disponível até
                      </Text>
                      <Text style={styles.ingressoDetailText}>
                        {ing.dataLimiteVenda
                          ? formatarData(ing.dataLimiteVenda)
                          : "Não definida"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyStateText}>
                  Nenhum ingresso disponível.
                </Text>
                <TouchableOpacity style={styles.botaoCriarIngresso}>
                  <Text style={styles.botaoCriarIngressoTexto}>
                    Adicionar Ingresso
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSecondary]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando evento...</Text>
      </LinearGradient>
    );
  }

  const imagemCapa = eventoDetalhes.Midia?.find(
    (midia) => midia.tipo === "capa"
  );
  const capaSource = imagemCapa
    ? { uri: `${API_URL}${imagemCapa.url}` }
    : require("../imagens/roxa.png"); // Use a mesma imagem de fallback

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <ScrollView style={styles.container}>
        <ImageBackground source={capaSource} style={styles.headerImage}>
          <LinearGradient
            colors={["transparent", theme.colors.background]}
            style={styles.overlay}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>{eventoDetalhes.nomeEvento}</Text>
            <Text style={styles.city}>
              {eventoDetalhes.localizacao?.cidade || "Cidade"},{" "}
              {eventoDetalhes.localizacao?.estado || "Estado"}
            </Text>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.contentContainer}>
          {/* Tabs */}
          <View style={styles.tabs}>
            {["Informações", "Galeria", "Ingressos"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selectedTab === tab && styles.tabActive,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={
                    selectedTab === tab
                      ? styles.tabActiveText
                      : styles.tabText
                  }
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderTabContent()}

          <View style={styles.descriptionCard}>
            <Text style={styles.descTitle}>Descrição do Evento</Text>
            <Text style={styles.desc}>
              {eventoDetalhes.descEvento || "Nenhuma descrição fornecida."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.textPrimary,
    marginTop: 10,
    fontSize: 16,
  },
  headerImage: {
    width: "100%",
    height: 250,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Gradiente para escurecer a imagem e manter o fundo escuro
    backgroundColor: "rgba(15, 23, 42, 0.4)", // theme.colors.background com transparência
    justifyContent: "flex-end",
    padding: theme.spacing.lg,
  },
  backBtn: {
    position: "absolute",
    top: theme.spacing.lg,
    left: theme.spacing.md,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
    zIndex: 10,
  },
  title: {
    color: theme.colors.white,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  city: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    marginTop: -theme.spacing.lg, // Puxa o conteúdo para cima da imagem de capa
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.backgroundSecondary, // Cor de fundo das tabs
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  tabActiveText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 15,
  },
  card: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  descriptionCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: 80, // Espaço para a TabBar inferior (se houver)
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  infoText: {
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
    fontSize: 15,
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surface,
    marginVertical: theme.spacing.md,
  },
  organizadorTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  organizadorText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  descTitle: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: theme.spacing.sm,
  },
  desc: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: theme.spacing.lg,
    fontSize: 15,
  },
  botaoCriarIngresso: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    alignSelf: 'center'
  },
  botaoCriarIngressoTexto: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },

  // GALERIA
  galleryContainer: {
    marginBottom: theme.spacing.lg,
  },
  galleryRow: {
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  galleryImage: {
    width: "48.5%", // 2 colunas com espaço
    height: 150,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface, // Placeholder
  },

  // INGRESSOS
  ingressoCardsContainer: {
    marginBottom: theme.spacing.lg,
  },
  ingressoCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary, // Detalhe de cor no card
  },
  ingressoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  ingressoTitulo: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  editButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.sm,
  },
  ingressoDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ingressoDetailItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: theme.spacing.xs,
  },
  ingressoDetailTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  ingressoDetailText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});