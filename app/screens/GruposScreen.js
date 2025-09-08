import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Montserrat_700Bold,
  Montserrat_400Regular,
  Montserrat_500Medium,
} from "@expo-google-fonts/montserrat";

// Definição do tema (copiado do seu primeiro arquivo)
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

export default function GruposScreen({ navigation }) {
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
  });

  const carregarGrupos = useCallback(async () => {
    try {
      setErro(null);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Erro", "Você precisa estar logado");
        navigation.navigate("Login");
        return;
      }

      const response = await axios.get(`${API_URL}/grupos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (response.data.success) {
        setGrupos(response.data.grupos || []);
      } else {
        throw new Error(response.data.message || "Erro ao carregar grupos");
      }
    } catch (error) {
      console.error("Erro detalhado ao carregar grupos:", error);
      setErro(error.message);

      let mensagemErro = "Não foi possível carregar os grupos";
      if (error.response?.status === 401) {
        mensagemErro = "Sessão expirada. Faça login novamente.";
        AsyncStorage.clear();
        navigation.navigate("Login");
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      } else if (error.code === "ECONNABORTED") {
        mensagemErro = "Tempo limite excedido. Verifique sua conexão.";
      } else if (error.message.includes("Network Error")) {
        mensagemErro = "Erro de conexão. Verifique sua internet.";
      }
      Alert.alert("Erro", mensagemErro);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    if (fontsLoaded) {
      carregarGrupos();
    }
  }, [fontsLoaded, carregarGrupos]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarGrupos();
  };

  const entrarNoGrupo = (grupo) => {
    if (grupo && grupo.grupoId && grupo.nome) {
      navigation.navigate("Chat", {
        grupoId: grupo.grupoId,
        grupoNome: grupo.nome,
      });
    } else {
      Alert.alert(
        "Erro de navegação",
        "Informações do grupo estão incompletas."
      );
    }
  };

  const filtrarGrupos = () => {
    if (searchText.trim()) {
      return grupos.filter(
        (msg) =>
          msg.nome.toLowerCase().includes(searchText.toLowerCase()) ||
          (msg.evento &&
            msg.evento.nomeEvento
              .toLowerCase()
              .includes(searchText.toLowerCase())) ||
          msg.descricao.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return grupos;
  };
  const renderGroupCard = ({ item }) => (
    <TouchableOpacity
      style={styles.messageCard}
      onPress={() => entrarNoGrupo(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
        style={styles.messageCardGradient}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.avatar}
          >
            <Feather name="users" size={24} color={theme.colors.white} />
          </LinearGradient>
        </View>

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageName}>{item.nome || "Grupo"}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.evento?.nomeEvento ||
              item.descricao ||
              "Grupo de chat do evento"}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (!fontsLoaded || carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1400B4" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color={theme.colors.error}
        />
        <Text style={styles.errorText}>Erro ao carregar grupos</Text>
        <Text style={styles.errorDetail}>{erro}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={carregarGrupos}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.retryButtonGradient}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSecondary]}
        style={styles.mainContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mensagens</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Feather name="bell" size={24} color={theme.colors.white} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
            style={styles.searchBar}
          >
            <Feather
              name="search"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar conversas..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Feather
                  name="x"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
        <FlatList
          data={filtrarGrupos()}
          keyExtractor={(item) =>
            item.grupoId?.toString() || Math.random().toString()
          }
          renderItem={renderGroupCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather
                name="message-square"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.emptyText}>Nenhum grupo encontrado</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
        <View style={styles.bottomTabBar}>
          <LinearGradient
            colors={["rgba(30, 41, 59, 0.95)", "rgba(15, 23, 42, 0.95)"]}
            style={styles.tabBarGradient}
          >
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => navigation.navigate("Home")}
            >
              <MaterialIcons
                name="home"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => navigation.navigate("GruposScreen")}
            >
              <Feather
                name="message-circle"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.centerTabButton}
              onPress={() => navigation.navigate("Etapa1")}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.centerTabGradient}
              >
                <Feather name="plus" size={28} color={theme.colors.white} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => navigation.navigate("Estatisticas")}
            >
              <Feather
                name="bar-chart"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButton}
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Montserrat_700Bold",
    color: theme.colors.white,
    marginTop: 40,
  },
  notificationButton: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: {
    flex: 1,
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 120,
  },
  messageCard: {
    marginBottom: theme.spacing.sm,
  },
  messageCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: theme.colors.white,
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: theme.colors.textSecondary,
  },
  separator: {
    height: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Montserrat_500Medium",
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: theme.spacing.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
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
  tabButton: {
    padding: theme.spacing.sm,
  },
  centerTabButton: {
    marginBottom: theme.spacing.md,
  },
  centerTabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textPrimary,
    fontFamily: "Montserrat_400Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: theme.colors.error,
    marginTop: 15,
    marginBottom: 5,
  },
  errorDetail: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginTop: 10,
  },
  retryButtonGradient: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: theme.colors.white,
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
});
