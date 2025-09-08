import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function Etapa5({ navigation }) {
  const [dadosEvento, setDadosEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [criarChat, setCriarChat] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosEventoString = await AsyncStorage.getItem("@evento");
        const dadosEvento = dadosEventoString
          ? JSON.parse(dadosEventoString)
          : null;

        if (!dadosEvento) {
          Alert.alert("Erro", "Não foi possível carregar os dados do evento");
          navigation.goBack();
          return;
        }

        setDadosEvento(dadosEvento);
      } catch (error) {
        console.error("Erro ao carregar evento:", error);
        Alert.alert("Erro", "Falha ao carregar dados");
        navigation.goBack();
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const enviarEvento = async () => {
    try {
      if (!dadosEvento) return;

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Erro", "Você precisa estar logado para criar um evento");
        return;
      }

      const ingressosComValoresPadrao =
        dadosEvento.ingressos?.map((ingresso) => ({
          nome: ingresso.nome || "Ingresso",
          quantidade: ingresso.quantidade || 0,
          preco: ingresso.preco || 0,
          descricao: ingresso.descricao || "",
          dataLimiteVenda: ingresso.dataLimiteVenda || null,
        })) || [];

      const dadosParaEnviar = {
        nome: dadosEvento.nome,
        descricao: dadosEvento.descricao,
        tipo: dadosEvento.tipo,
        privacidade: dadosEvento.privacidade,
        dataInicio: dadosEvento.dataInicio,
        dataFim: dadosEvento.dataFim || dadosEvento.dataInicio,
        localizacao: dadosEvento.localizacao,
        fotos: dadosEvento.fotos || [], // Agora isso contém as URLs do servidor
        ingressos: ingressosComValoresPadrao,
        criarChat: criarChat,
      };

      console.log("Enviando dados:", dadosParaEnviar);

      const response = await axios.post(`${API_URL}/eventos`, dadosParaEnviar, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      let mensagemSucesso = "Evento criado com sucesso!";

      if (criarChat && response.data.grupoChat) {
        mensagemSucesso += " Grupo de chat criado automaticamente.";
      }

      Alert.alert("Sucesso!", mensagemSucesso, [
        {
          text: "OK",
          onPress: () => {
            AsyncStorage.removeItem("@evento");
            navigation.navigate("Home");
          },
        },
      ]);
    } catch (error) {
      console.error("Erro detalhado ao criar evento:", error);

      let mensagemErro = "Não foi possível criar o evento";

      if (error.response) {
        mensagemErro = error.response.data.message || mensagemErro;
        console.error("Resposta do servidor:", error.response.data);
      } else if (error.request) {
        mensagemErro = "Erro de conexão. Verifique sua internet.";
      } else {
        mensagemErro = error.message || mensagemErro;
      }

      Alert.alert("Erro", mensagemErro);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text>Carregando dados do evento...</Text>
      </View>
    );
  }

  if (!dadosEvento) {
    return (
      <View style={styles.container}>
        <Text>Não foi possível carregar os dados do evento</Text>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botaoTextoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Confirmação do Evento</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Informações Básicas</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Nome:</Text>
          <Text style={styles.itemValue}>{dadosEvento.nome}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Descrição:</Text>
          <Text style={styles.itemValue}>{dadosEvento.descricao}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Tipo:</Text>
          <Text style={styles.itemValue}>{dadosEvento.tipo}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Data:</Text>
          <Text style={styles.itemValue}>
            {formatarData(dadosEvento.dataInicio)}
          </Text>
        </View>
      </View>

      {dadosEvento.localizacao && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Localização</Text>
          <Text style={styles.itemValue}>
            {dadosEvento.localizacao.endereco}
          </Text>
        </View>
      )}

      {dadosEvento.ingressos?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Ingressos</Text>
          {dadosEvento.ingressos.map((ingresso, index) => (
            <View key={index} style={styles.ingressoItem}>
              <Text style={styles.ingressoNome}>{ingresso.nome}</Text>
              <Text style={styles.ingressoDetalhes}>
                R$ {ingresso.preco} • {ingresso.quantidade} vagas
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Nova seção para criar chat */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Configurações de Chat</Text>
        <View style={styles.chatOption}>
          <Text style={styles.chatOptionText}>
            Criar grupo de chat automaticamente
          </Text>
          <Switch
            value={criarChat}
            onValueChange={setCriarChat}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={criarChat ? "#3F51B5" : "#f4f3f4"}
          />
        </View>
        <Text style={styles.chatDescription}>
          Um grupo de chat será criado com o nome do evento para conversas entre
          organizadores e participantes.
        </Text>
      </View>

      <TouchableOpacity style={styles.botaoConfirmar} onPress={enviarEvento}>
        <Text style={styles.botaoTexto}>Confirmar e Criar Evento</Text>
        <MaterialIcons name="check-circle" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.botaoTextoVoltar}>Voltar para editar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#3F51B5",
  },
  item: {
    flexDirection: "row",
    marginBottom: 8,
  },
  itemLabel: {
    fontWeight: "bold",
    width: 100,
    color: "#555",
  },
  itemValue: {
    flex: 1,
    color: "#333",
  },
  ingressoItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  ingressoNome: {
    fontWeight: "bold",
    color: "#333",
  },
  ingressoDetalhes: {
    color: "#666",
  },
  chatOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chatOptionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  chatDescription: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  botaoConfirmar: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  botaoTexto: {
    color: "white",
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 16,
  },
  botaoVoltar: {
    padding: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  botaoTextoVoltar: {
    color: "#3F51B5",
    fontWeight: "bold",
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
