/*import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import io from "socket.io-client";
import { LinearGradient } from "expo-linear-gradient";

// Definição do tema para consistência
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
      // Altera o estilo do cabeçalho para o tema
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

// ===== COMPONENTE PRINCIPAL =====
const MensagensScreen = ({ navigation }) => {
  const [filtro, setFiltro] = useState("Todas");
  const [searchText, setSearchText] = useState("");

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
    }
    
    if (searchText.trim()) {
      filtered = filtered.filter(msg =>
        msg.nome.toLowerCase().includes(searchText.toLowerCase()) ||
        msg.mensagem.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderMessageCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.messageCard}
      onPress={() => navigation.navigate("ChatDetail", { contact: item })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.messageCardGradient}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {item.nome.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          {item.online && <View style={styles.onlineIndicator} />}
          {item.tipo === "grupo" && (
            <View style={styles.groupBadge}>
              <Feather name="users" size={10} color={theme.colors.white} />
            </View>
          )}
        </View>

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageName}>{item.nome}</Text>
            <Text style={styles.messageTime}>{item.hora}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.mensagem}
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
            <ActivityIndicator
              size="small"
              color={theme.colors.textSecondary}
            />
          </View>
        )}
      </View>
    );
  };

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
            <Ionicons
              name="chatbubble-outline"
              size={60}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.textoListaVazia}>Nenhuma mensagem ainda</Text>
            <Text style={styles.subTextoListaVazia}>
              Seja o primeiro a enviar uma mensagem!
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.adicionalButton}>
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={novaMensagem}
          onChangeText={setNovaMensagem}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={theme.colors.textSecondary}
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
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={theme.colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

        <FlatList
          data={filtrarMensagens()}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma conversa encontrada</Text>
            </View>
          )}
        />

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate("NewMessage")}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.fabGradient}
          >
            <Feather name="edit-3" size={24} color={theme.colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomTabBar}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)']}
            style={styles.tabBarGradient}
          >
            <TouchableOpacity style={styles.tabButton}>
              <MaterialIcons name="home" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tabButton}>
              <Feather name="message-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.centerTabButton}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.centerTabGradient}
              >
                <Feather name="plus" size={28} color={theme.colors.white} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tabButton}>
              <Feather name="bar-chart" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tabButton}>
              <MaterialIcons name="person" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listaMensagens: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  mensagemContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: "80%",
  },
  
  notificationButton: {
    position: 'relative',
  },
  
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  usuarioNome: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  balaoMensagem: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  balaoUsuarioAtual: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: theme.borderRadius.sm,
  },
  balaoOutroUsuario: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderTopLeftRadius: theme.borderRadius.sm,
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
    color: theme.colors.white,
  },
  mensagemTextoOutroUsuario: {
    color: theme.colors.textPrimary,
  },
  mensagemHora: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.sm,
  },
  indicadorEnvio: {
    position: "absolute",
    right: -20,
    top: "50%",
  },
  inputContainer: {
    flexDirection: "row",
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
    alignItems: "flex-end",
  },
  adicionalButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.white,
  },
  botaoEnviar: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoEnviarDesativado: {
    backgroundColor: theme.colors.textSecondary,
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
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  textoListaVazia: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontWeight: "500",
  },
  
  activeFilter: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  
  inactiveFilter: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  activeFilterText: {
    color: theme.colors.white,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

export default MensagensScreen;*/