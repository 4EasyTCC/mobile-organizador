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

const { width } = Dimensions.get("window");

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
                  colors={["#1400B4", "#1E88E5"]}
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
          colors={["#1400B4", "#1E88E5"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando seu perfil...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1400B4" />

      {/* Header com gradiente */}
      <LinearGradient colors={["#1400B4", "#1E88E5"]} style={styles.header}>
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
            colors={["#1400B4"]}
            tintColor="#1400B4"
          />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={24} color="#1400B4" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color="#1400B4" />
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#1400B4" />
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
                  <Ionicons name={item.icon} size={20} color="#1400B4" />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF4757" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.tabButton}
        >
          <MaterialIcons name="home" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Chat")}
          style={styles.tabButton}
        >
          <Feather name="message-circle" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.centralButton}
          onPress={() => navigation.navigate("Etapa1")}
        >
          <LinearGradient
            colors={["#1400B4", "#1E88E5"]}
            style={styles.centralButtonGradient}
          >
            <Feather name="plus" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Estatisticas")}
          style={styles.tabButton}
        >
          <AntDesign name="barschart" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Perfil")}
          style={styles.tabButton}
        >
          <MaterialIcons name="person" size={24} color="#1400B4" />
        </TouchableOpacity>
      </View>

      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatarTouchable: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  editAvatarIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1400B4",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  scrollView: {
    flex: 1,
    marginTop: -10,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
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
    color: "#1400B4",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    padding: 20,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f0f2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4757",
    fontWeight: "600",
    marginLeft: 15,
  },
  bottomSpacer: {
    height: 100,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    height: 70,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  tabButton: {
    padding: 10,
  },
  centralButton: {
    marginBottom: 30,
  },
  centralButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: width - 40,
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1400B4",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f8fafc",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
    marginRight: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmButton: {
    marginLeft: 10,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 12,
  },
  cancelButtonText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PerfilScreen;
