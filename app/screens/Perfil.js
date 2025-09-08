import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  MaterialIcons,
  Feather,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@env";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Definição do tema para consistência com outras páginas
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

const PerfilScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");

  const fetchUserData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const userDataString = await AsyncStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userType = userData?.organizadorId ? "organizador" : "convidado";

      const response = await axios.get(`${API_URL}/perfil/${userType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUserData(response.data.perfil || response.data.convidado);
      } else {
        throw new Error(response.data.message || "Erro ao carregar perfil");
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      Alert.alert("Erro", "Não foi possível carregar seu perfil");
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData(true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData(false);
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.replace("Login");
        },
      },
    ]);
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à sua galeria para alterar a foto."
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert(
        "Erro",
        "Não foi possível selecionar a imagem. Tente novamente."
      );
    }
  };

  const uploadImage = async (uri) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      const formData = new FormData();
      formData.append("avatar", {
        uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      const userDataString = await AsyncStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userType = userData?.organizadorId ? "organizador" : "convidado";

      const response = await axios.put(
        `${API_URL}/perfil/${userType}/foto`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        fetchUserData(false);
        Alert.alert("Sucesso", "Foto atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      Alert.alert("Erro", "Falha ao enviar a imagem");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (type) => {
    setEditType(type);
    setNewValue("");
    setConfirmValue("");
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (editType === "senha" && newValue !== confirmValue) {
        Alert.alert("Erro", "As senhas não coincidem");
        return;
      }

      if (!newValue.trim()) {
        Alert.alert("Erro", `Por favor, insira um novo ${editType}`);
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const userDataString = await AsyncStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userType = userData?.organizadorId ? "organizador" : "convidado";

      let endpoint = "";
      let body = {};

      switch (editType) {
        case "nome":
          endpoint = `${API_URL}/perfil/${userType}/nome`;
          body = { nome: newValue };
          break;
        case "email":
          endpoint = `${API_URL}/perfil/${userType}/email`;
          body = { email: newValue };
          break;
        case "senha":
          endpoint = `${API_URL}/perfil/${userType}/senha`;
          body = { senha: newValue };
          break;
      }

      const response = await axios.put(endpoint, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const updatedUser = { ...userData };
        if (editType === "nome") updatedUser.nome = newValue;
        if (editType === "email") updatedUser.email = newValue;

        setUserData(updatedUser);
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

        Alert.alert(
          "Sucesso",
          `${
            editType.charAt(0).toUpperCase() + editType.slice(1)
          } atualizado com sucesso!`
        );
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${editType}:`, error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || `Falha ao atualizar ${editType}`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderEditModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editType === "nome" && "Editar Nome"}
              {editType === "email" && "Editar Email"}
              {editType === "senha" && "Alterar Senha"}
            </Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              placeholder={`Novo ${editType}`}
              placeholderTextColor="#999"
              value={newValue}
              onChangeText={setNewValue}
              secureTextEntry={editType === "senha"}
              autoCapitalize={editType === "nome" ? "words" : "none"}
              keyboardType={editType === "email" ? "email-address" : "default"}
            />

            {editType === "senha" && (
              <TextInput
                style={styles.modalInput}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#999"
                value={confirmValue}
                onChangeText={setConfirmValue}
                secureTextEntry={true}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSave}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.confirmButtonText}>Salvar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.backgroundSecondary]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={theme.colors.white} />
          <Text style={styles.loadingText}>Carregando seu perfil...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header com gradiente */}
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSecondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Image
            source={require("../imagens/branca.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarTouchable}
            >
              <Image
                source={
                  userData?.avatarUrl
                    ? { uri: `${API_URL}${userData.avatarUrl}` }
                    : require("../imagens/avatar-placeholder.png")
                }
                style={styles.avatar}
              />
              <View style={styles.editAvatarIcon}>
                <Feather name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userData?.nome || "Usuário"}
            </Text>
            <Text style={styles.profileRole}>
              {userData?.organizadorId ? "Organizador de Eventos" : "Convidado"}
            </Text>
            <Text style={styles.profileEmail}>{userData?.email}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color={theme.colors.primary} />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Configurações da Conta</Text>

          {[
            {
              icon: "person-outline",
              label: "Editar Nome",
              action: () => openEditModal("nome"),
            },
            {
              icon: "mail-outline",
              label: "Alterar Email",
              action: () => openEditModal("email"),
            },
            {
              icon: "lock-closed-outline",
              label: "Alterar Senha",
              action: () => openEditModal("senha"),
            },
            {
              icon: "notifications-outline",
              label: "Notificações",
              action: () => {},
            },
            { icon: "shield-outline", label: "Privacidade", action: () => {} },
            { icon: "help-circle-outline", label: "Ajuda", action: () => {} },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.error}
            />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Tab Bar (corrected and styled) */}
      <View style={styles.bottomTabBar}>
        <LinearGradient
          colors={["rgba(30, 41, 59, 0.95)", "rgba(15, 23, 42, 0.95)"]}
          style={styles.tabBarGradient}
        >
          {/* Home Button */}
          <TouchableOpacity
            style={styles.tabIcon}
            onPress={() => navigation.navigate("Home")}
          >
            <MaterialIcons
              name="home"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Message Button */}
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

          {/* Central Button */}
          <TouchableOpacity
            style={styles.centralButtonNav}
            onPress={() => navigation.navigate("Etapa1")}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.centralButtonGradient}
            >
              <Feather name="plus" size={28} color={theme.colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Statistics Button */}
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

          {/* Profile Button (Active) */}
          <TouchableOpacity
            style={styles.tabIcon}
            onPress={() => navigation.navigate("Perfil")}
          >
            <MaterialIcons
              name="person"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {renderEditModal()}
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
  },
  loadingGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100, // Tamanho ajustado
    height: 70, // Tamanho ajustado
  },
  profileCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  avatarTouchable: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  editAvatarIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.backgroundSecondary,
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  profileRole: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: theme.colors.backgroundSecondary,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  menuContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    color: theme.colors.error,
    fontWeight: "600",
    marginLeft: theme.spacing.md,
  },
  bottomSpacer: {
    height: 100,
  },
  // --- Bottom Tab Bar Styles (Replicated from other pages) ---
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
  centralButtonNav: {
    marginBottom: theme.spacing.md,
  },
  centralButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  // --- End of Bottom Tab Bar Styles ---

  // Modal styles (ajustado para o novo tema)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.xl,
    width: width - 40,
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.white,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  confirmButton: {
    marginLeft: theme.spacing.sm,
  },
  gradientButton: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderRadius: theme.borderRadius.lg,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PerfilScreen;
