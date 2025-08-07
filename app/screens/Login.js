import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { API_URL } from "@env";
import fundoImg from "../imagens/fundo.png";
import logoImg from "../imagens/roxa.png";

export default function Login() {
  const navigation = useNavigation();
  const [modo, setModo] = useState("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSubmit = async () => {
    if (!email || !senha || (modo === "cadastro" && !nome)) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    setLoading(true);

    const endpoint =
      modo === "login"
        ? `${API_URL}/login/organizador`
        : `${API_URL}/cadastro/organizador`;

    const dados = modo === "login" ? { email, senha } : { nome, email, senha };

    try {
      const resposta = await axios.post(endpoint, dados);

      if (modo === "login") {
        await AsyncStorage.setItem("userToken", resposta.data.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(resposta.data.organizador)
        );
      }

      Alert.alert(
        "Sucesso",
        modo === "login"
          ? "Login realizado com sucesso!"
          : "Cadastro realizado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (error) {
      let errorMessage = "Erro na requisição";

      if (error.response) {
        errorMessage = error.response.data.message || error.response.data.error;
      } else if (error.request) {
        errorMessage = "Sem resposta do servidor - verifique sua conexão";
      } else {
        errorMessage = error.message;
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ImageBackground
        source={fundoImg}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Image source={logoImg} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.card}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, modo === "login" && styles.activeTab]}
                onPress={() => setModo("login")}
              >
                <Text
                  style={[
                    styles.tabText,
                    modo === "login" && styles.activeTabText,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, modo === "cadastro" && styles.activeTab]}
                onPress={() => setModo("cadastro")}
              >
                <Text
                  style={[
                    styles.tabText,
                    modo === "cadastro" && styles.activeTabText,
                  ]}
                >
                  Cadastro
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>
              {modo === "login" ? "Bem-vindo!" : "Crie sua conta"}
            </Text>

            {modo === "cadastro" && (
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            {modo === "login" && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {modo === "login" ? "Entrar" : "Cadastrar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#1400b4",
  },
  tabText: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#1400b4",
  },
  activeTabText: {
    color: "#fff",
  },
  title: {
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1400b4",
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontFamily: "Montserrat_400Regular",
    color: "#333",
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: "Montserrat_600SemiBold",
    color: "#1400b4",
  },
  button: {
    backgroundColor: "#1400b4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
});
