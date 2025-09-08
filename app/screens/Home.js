import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

// Definição do tema (copiado do arquivo de GruposScreen)
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

const HomeScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("Ativos");
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEventos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEventos().finally(() => setRefreshing(false));
  };

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }
      const response = await fetch(`${API_URL}/eventos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      const eventosFormatados = data.map((evento) => {
        const fotoCapa = evento.Midia?.find((midia) => midia.tipo === "capa");
        const nomeOrganizador =
          evento.organizador && evento.organizador.nome
            ? evento.organizador.nome
            : "Organizador desconhecido";
        return {
          id: evento.eventoId?.toString() || Math.random().toString(),
          titulo: evento.nomeEvento || "Evento sem nome",
          subtitulo: `Organizado por ${nomeOrganizador}`,
          data: formatarData(evento.dataInicio),
          imagem: fotoCapa ? `${API_URL}${fotoCapa.url}` : null,
          categoria: getCategoria(evento.statusEvento),
          status: evento.statusEvento || "ativo",
          rawData: evento,
        };
      });
      setEventos(eventosFormatados);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      Alert.alert("Erro", "Não foi possível carregar os eventos");
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "Data inválida";
    const meses = [
      "JAN",
      "FEV",
      "MAR",
      "ABR",
      "MAI",
      "JUN",
      "JUL",
      "AGO",
      "SET",
      "OUT",
      "NOV",
      "DEZ",
    ];
    try {
      const data = new Date(dataString);
      return `${String(data.getDate()).padStart(2, "0")}/${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;
    } catch (error) {
      return "Data inválida";
    }
  };

  const getCategoria = (status) => {
    if (!status) return "Ativos";
    switch (status.toUpperCase()) {
      case "CONCLUIDO":
        return "Concluídos";
      case "RASCUNHO":
        return "Rascunhos";
      default:
        return "Ativos";
    }
  };

  const renderEvento = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("EventDetails", { evento: item })}
    >
      <Image
        source={
          item.imagem ? { uri: item.imagem } : require("../imagens/roxa.png")
        }
        style={styles.cardImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.cardGradient}
      />
      <View style={styles.cardContentOverlay}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{item.data}</Text>
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.titulo} numberOfLines={1}>
            {item.titulo}
          </Text>
          <Text style={styles.subtitulo} numberOfLines={1}>
            {item.subtitulo}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const eventosFiltrados = eventos.filter(
    (evento) => evento.categoria === selectedTab
  );
  const eventosBusca = eventosFiltrados.filter(
    (evento) =>
      evento.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      evento.subtitulo.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSecondary]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={theme.colors.white} />
        <Text style={styles.loadingText}>Carregando eventos...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <View style={styles.header}>
        <Image
          source={require("../imagens/branca.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="encontrar seus eventos"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <View style={styles.tabs}>
          {["Ativos", "Concluídos", "Rascunhos"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={eventosBusca}
        keyExtractor={(item) => item.id}
        renderItem={renderEvento}
        contentContainerStyle={styles.listaContainer}
        ListEmptyComponent={
          <View style={styles.listaVazia}>
            <Text style={styles.textoListaVazia}>
              {eventos.length === 0
                ? "Nenhum evento encontrado"
                : `Nenhum evento encontrado em "${selectedTab}"`}
            </Text>
            {eventos.length === 0 && (
              <TouchableOpacity
                style={styles.botaoCriarEvento}
                onPress={() => navigation.navigate("Etapa1")}
              >
                <Text style={styles.botaoCriarEventoTexto}>
                  Criar Primeiro Evento
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* Bottom Tab Bar - NOVO ESTILO E FUNCIONALIDADE */}
      <View style={styles.bottomTabBar}>
        <LinearGradient
          colors={["rgba(30, 41, 59, 0.95)", "rgba(15, 23, 42, 0.95)"]}
          style={styles.tabBarGradient}
        >
          <TouchableOpacity
            style={styles.tabIcon}
            onPress={() => navigation.navigate("Home")}
          >
            <MaterialIcons name="home" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

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

          <TouchableOpacity
            style={styles.tabIcon}
            onPress={() => navigation.navigate("Estatisticas")}
          >
            <Feather
              name="bar-chart"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

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
    </SafeAreaView>
  );
};

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
  header: {
    paddingTop: 10 ,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: theme.colors.background,
  },
  logo: {
    width: 100,
    height: 70,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.white,
    fontSize: 16,
    paddingLeft: 8,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  tabTextActive: {
    color: theme.colors.white,
    fontWeight: "bold",
  },
  listaContainer: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  card: {
    height: 180,
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    borderRadius: 15,
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    borderRadius: 15,
  },
  cardContentOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 15,
  },
  dateBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  dateBadgeText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  cardTextContainer: {
    alignItems: "flex-start",
  },
  titulo: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 4,
  },
  subtitulo: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  listaVazia: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    minHeight: 200,
  },
  textoListaVazia: {
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  botaoCriarEvento: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  botaoCriarEventoTexto: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
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
export default HomeScreen;
