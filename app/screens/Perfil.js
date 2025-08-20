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
} from "react-native";
import { MaterialIcons, Feather, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@env";
import * as ImagePicker from "expo-image-picker";

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
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editType === "nome" && "Editar Nome"}
            {editType === "email" && "Editar Email"}
            {editType === "senha" && "Alterar Senha"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={`Novo ${editType}`}
            value={newValue}
            onChangeText={setNewValue}
            secureTextEntry={editType === "senha"}
            autoCapitalize={editType === "nome" ? "words" : "none"}
            keyboardType={editType === "email" ? "email-address" : "default"}
          />

          {editType === "senha" && (
            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
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
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1400B4" />
        <Text style={styles.loadingText}>Carregando seu perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Image
          source={require("../imagens/branca.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Header do usuário */}
      <View style={styles.userHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              userData?.avatarUrl
                ? { uri: `${API_URL}${userData.avatarUrl}` }
                : require("../imagens/avatar-placeholder.png")
            }
            style={styles.avatarSmall}
          />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {userData?.nome || "Usuário"}
          </Text>
          <Text style={styles.userRole}>
            {userData?.organizadorId ? "Organizador de Eventos" : "Convidado"}
          </Text>
        </View>
      </View>

      {/* Conteúdo principal */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1400B4"]}
          />
        }
      >
        {/* Seção Conta */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Conta <Feather name="settings" size={16} color="#666" />
          </Text>

          <View style={styles.profileSection}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={
                  userData?.avatarUrl
                    ? { uri: `${API_URL}${userData.avatarUrl}` }
                    : require("../imagens/avatar-placeholder.png")
                }
                style={styles.avatarLarge}
              />
            </TouchableOpacity>
            <View style={styles.nameArea}>
              <Text style={styles.fullName}>{userData?.nome || "Usuário"}</Text>
              <Text style={styles.userEmail}>{userData?.email || ""}</Text>

              <TouchableOpacity style={styles.editButton} onPress={pickImage}>
                <Feather name="edit-2" size={14} color="#1400B4" />
                <Text style={styles.linkText}> Alterar Foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Opções */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => openEditModal("nome")}
          >
            <Feather
              name="user"
              size={20}
              color="#666"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Editar Nome</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => openEditModal("email")}
          >
            <Feather
              name="mail"
              size={20}
              color="#666"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Alterar Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => openEditModal("senha")}
          >
            <Feather
              name="lock"
              size={20}
              color="#666"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Alterar Senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.logoutOption]}
            onPress={handleLogout}
          >
            <Feather
              name="log-out"
              size={20}
              color="#e74c3c"
              style={styles.optionIcon}
            />
            <Text style={[styles.optionText, styles.logoutText]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tab Bar */}
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
          onPress={() => navigation.navigate("CriarEvento")}
        >
          <Feather name="plus" size={28} color="#fff" />
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
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    color: "#1400B4",
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1400B4",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 40,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#1400B4",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userRole: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  content: {
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    borderWidth: 3,
    borderColor: "#1400B4",
  },
  nameArea: {
    flex: 1,
  },
  fullName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f0f2ff",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  linkText: {
    color: "#1400B4",
    fontSize: 14,
    fontWeight: "500",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIcon: {
    marginRight: 15,
    width: 24,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  logoutOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  logoutText: {
    color: "#e74c3c",
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
    width: 60,
    height: 60,
    backgroundColor: "#1400B4",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1400B4",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  confirmButton: {
    backgroundColor: "#1400B4",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PerfilScreen;
