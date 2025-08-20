import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import io from "socket.io-client";

export default function ChatScreen({ route, navigation }) {
  const { grupoId, grupoNome } = route.params;
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);
  const userData = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: grupoNome || "Chat",
      headerStyle: {
        backgroundColor: "#6A5ACD",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 18,
      },
      headerBackTitle: "Voltar", 
      headerBackTitleStyle: {
        color: "white",
      },
    });

    carregarMensagens();
    configurarSocket();
    carregarDadosUsuario();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [grupoId, grupoNome, navigation]);

  const carregarDadosUsuario = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (userToken) {
        const payload = JSON.parse(atob(userToken.split(".")[1]));
        userData.current = {
          id: payload.id,
          tipo: payload.tipo,
        };
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const configurarSocket = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const newSocket = io(API_URL, {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log("Conectado ao servidor de chat");
        newSocket.emit("entrar_grupo", grupoId);
      });

      newSocket.on("nova_mensagem", (mensagem) => {
        if (mensagem.grupoId == grupoId) {
          setMensagens((prev) => {
            const novasMensagens = prev.filter(
              (m) => !(m.temporaria && m.texto === mensagem.texto)
            );
            return [...novasMensagens, mensagem];
          });

          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }, 100);
        }
      });

      newSocket.on("disconnect", () => {
        console.log("Desconectado do servidor de chat");
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Erro ao configurar socket:", error);
    }
  };

  const carregarMensagens = async () => {
    try {
      setCarregando(true);
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(`${API_URL}/mensagens/${grupoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMensagens(response.data.mensagens || []);
        setTimeout(() => {
          if (flatListRef.current && response.data.mensagens.length > 0) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }, 100);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      Alert.alert("Erro", "Não foi possível carregar as mensagens");
    } finally {
      setCarregando(false);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || enviando) return;

    try {
      setEnviando(true);
      const token = await AsyncStorage.getItem("userToken");

      const mensagemTemporaria = {
        mensagemId: Date.now(), 
        texto: novaMensagem,
        usuarioId: userData.current?.id,
        tipoUsuario: userData.current?.tipo,
        grupoId: parseInt(grupoId),
        createdAt: new Date().toISOString(),
        usuario: { nome: "Você" },
        temporaria: true,  
      };

      setMensagens((prev) => [...prev, mensagemTemporaria]);
      setNovaMensagem("");

      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);

      await axios.post(
        `${API_URL}/mensagens/${grupoId}`,
        { texto: novaMensagem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMensagens((prev) => prev.filter((m) => !m.temporaria));
      Alert.alert("Erro", "Não foi possível enviar a mensagem");
    } finally {
      setEnviando(false);
    }
  };

  const renderizarMensagem = ({ item }) => {
    const isUsuarioAtual =
      userData.current &&
      item.usuarioId === userData.current.id &&
      item.tipoUsuario === userData.current.tipo;

    return (
      <View
        style={[
          styles.mensagemContainer,
          isUsuarioAtual
            ? styles.mensagemUsuarioAtual
            : styles.mensagemOutroUsuario,
        ]}
      >
        {!isUsuarioAtual && (
          <Text style={styles.usuarioNome}>
            {item.usuario?.nome || "Usuário"}
          </Text>
        )}
        <View
          style={[
            styles.balaoMensagem,
            isUsuarioAtual
              ? styles.balaoUsuarioAtual
              : styles.balaoOutroUsuario,
          ]}
        >
          <Text
            style={[
              styles.mensagemTexto,
              isUsuarioAtual
                ? styles.mensagemTextoUsuarioAtual
                : styles.mensagemTextoOutroUsuario,
            ]}
          >
            {item.texto}
          </Text>
        </View>
        <Text style={styles.mensagemHora}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {item.temporaria && (
          <View style={styles.indicadorEnvio}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}
      </View>
    );
  };

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={styles.carregandoTexto}>Carregando mensagens...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={mensagens}
        keyExtractor={(item) =>
          item.mensagemId?.toString() || Math.random().toString()
        }
        renderItem={renderizarMensagem}
        contentContainerStyle={styles.listaMensagens}
        onContentSizeChange={() => {
          if (flatListRef.current && mensagens.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          if (flatListRef.current && mensagens.length > 0) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }}
        ListEmptyComponent={
          <View style={styles.listaVazia}>
            <Ionicons name="chatbubble-outline" size={60} color="#ccc" />
            <Text style={styles.textoListaVazia}>Nenhuma mensagem ainda</Text>
            <Text style={styles.subTextoListaVazia}>
              Seja o primeiro a enviar uma mensagem!
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.adicionalButton}>
          <Ionicons name="add" size={24} color="#6A5ACD" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={novaMensagem}
          onChangeText={setNovaMensagem}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.botaoEnviar,
            !novaMensagem.trim() && styles.botaoEnviarDesativado,
          ]}
          onPress={enviarMensagem}
          disabled={!novaMensagem.trim() || enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  listaMensagens: {
    padding: 16,
    paddingBottom: 8,
  },
  mensagemContainer: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  mensagemUsuarioAtual: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  mensagemOutroUsuario: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  usuarioNome: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    marginLeft: 8,
  },
  balaoMensagem: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  balaoUsuarioAtual: {
    backgroundColor: "#6A5ACD",
    borderTopRightRadius: 4,
  },
  balaoOutroUsuario: {
    backgroundColor: "white",
    borderTopLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mensagemTexto: {
    fontSize: 16,
    lineHeight: 20,
  },
  mensagemTextoUsuarioAtual: {
    color: "white",
  },
  mensagemTextoOutroUsuario: {
    color: "#333",
  },
  mensagemHora: {
    fontSize: 10,
    color: "#999",
    marginHorizontal: 8,
  },
  indicadorEnvio: {
    position: "absolute",
    right: -20,
    top: "50%",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "flex-end",
  },
  adicionalButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f5",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  botaoEnviar: {
    backgroundColor: "#6A5ACD",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoEnviarDesativado: {
    backgroundColor: "#ccc",
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f5",
  },
  carregandoTexto: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  listaVazia: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  textoListaVazia: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
    fontWeight: "500",
  },
  subTextoListaVazia: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 4,
  },
});
