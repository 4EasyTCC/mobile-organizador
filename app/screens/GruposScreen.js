import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function GruposScreen({ navigation }) {
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarGrupos();
  }, []);

  const carregarGrupos = async () => {
    try {
      setCarregando(true);
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

      console.log("Resposta da API /grupos:", response.data);

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

      const carregarMensagens = async () => {
        try {
          setCarregando(true);
          const token = await AsyncStorage.getItem("userToken");
          console.log("Token usado:", token);

          const response = await axios.get(`${API_URL}/mensagens/${grupoId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            setMensagens(response.data.mensagens || []);
          }
        } catch (error) {
          console.error("Erro ao carregar mensagens:", error);
          if (error.response?.status === 401) {
            Alert.alert("Sessão expirada", "Faça login novamente");
            AsyncStorage.clear();
            navigation.navigate("Login");
          } else {
            Alert.alert("Erro", "Não foi possível carregar as mensagens");
          }
        } finally {
          setCarregando(false);
        }
      };
      Alert.alert("Erro", mensagemErro);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarGrupos();
  };

  const entrarNoGrupo = (grupo) => {
    navigation.navigate("Chat", {
      grupoId: grupo.grupoId,
      grupoNome: grupo.nome,
    });
  };

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.carregandoTexto}>Carregando grupos...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.erroContainer}>
        <Text style={styles.erroTexto}>Erro ao carregar grupos</Text>
        <Text style={styles.erroDetalhe}>{erro}</Text>
        <TouchableOpacity
          style={styles.botaoTentarNovamente}
          onPress={carregarGrupos}
        >
          <Text style={styles.botaoTexto}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Grupos de Chat</Text>

      <FlatList
        data={grupos}
        keyExtractor={(item) =>
          item.grupoId?.toString() || Math.random().toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.grupoItem}
            onPress={() => entrarNoGrupo(item)}
          >
            <View style={styles.grupoInfo}>
              <Text style={styles.grupoNome}>
                {item.nome || "Grupo sem nome"}
              </Text>
              <Text style={styles.grupoDescricao}>
                {item.descricao || "Sem descrição"}
              </Text>
              {item.evento && (
                <Text style={styles.grupoEvento}>
                  Evento: {item.evento.nomeEvento}
                </Text>
              )}
              <Text style={styles.grupoTipo}>
                Tipo: {item.tipo || "evento"}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.listaVazia}>
            <Text style={styles.textoListaVazia}>Nenhum grupo encontrado</Text>
            <Text style={styles.textoListaVaziaSub}>
              Crie um evento com chat habilitado para ver grupos aqui
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3F51B5"]}
            tintColor="#3F51B5"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  grupoItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  grupoInfo: {
    flex: 1,
  },
  grupoNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  grupoDescricao: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  grupoEvento: {
    fontSize: 12,
    color: "#3F51B5",
    marginBottom: 3,
  },
  grupoTipo: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  listaVazia: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  textoListaVazia: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  textoListaVaziaSub: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  carregandoTexto: {
    marginTop: 10,
    color: "#333",
  },
  erroContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  erroTexto: {
    fontSize: 18,
    color: "#d32f2f",
    marginBottom: 10,
    fontWeight: "bold",
  },
  erroDetalhe: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  botaoTentarNovamente: {
    backgroundColor: "#3F51B5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  botaoTexto: {
    color: "white",
    fontWeight: "bold",
  },
});
