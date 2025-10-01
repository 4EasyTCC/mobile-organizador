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
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
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
        fotos: dadosEvento.fotos || [],
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
        <ActivityIndicator size="large" color="#4B0082" />
        <Text style={styles.loadingText}>Carregando dados do evento...</Text>
      </View>
    );
  }

  if (!dadosEvento) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Não foi possível carregar os dados do evento 😥
        </Text>
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
      <Text style={styles.titulo}>Confirmação do Evento 🎉</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="info-outline" size={24} color="#6A5ACD" />
          <Text style={styles.cardTitulo}>Informações Básicas</Text>
        </View>
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
          <View style={styles.cardHeader}>
            <MaterialIcons name="location-on" size={24} color="#DC143C" />
            <Text style={styles.cardTitulo}>Localização</Text>
          </View>
          <Text style={styles.itemValue}>
            {dadosEvento.localizacao.endereco}
          </Text>
        </View>
      )}

      {dadosEvento.ingressos?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="local-activity" size={24} color="#FFA500" />
            <Text style={styles.cardTitulo}>Ingressos</Text>
          </View>
          {dadosEvento.ingressos.map((ingresso, index) => (
            <View key={index} style={styles.ingressoItem}>
              <Text style={styles.ingressoNome}>{ingresso.nome}</Text>
              <Text style={styles.ingressoDetalhes}>
                R$ {ingresso.preco} • {ingresso.quantidade} vagas
              </Text>
              {ingresso.descricao && (
                <Text style={styles.ingressoDescricao}>
                  {ingresso.descricao}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="chat" size={24} color="#20B2AA" />
          <Text style={styles.cardTitulo}>Configurações de Chat</Text>
        </View>
        <View style={styles.chatOption}>
          <Text style={styles.chatOptionText}>
            Criar grupo de chat para o evento
          </Text>
          <Switch
            value={criarChat}
            onValueChange={setCriarChat}
            trackColor={{ false: "#ccc", true: "#81b0ff" }}
            thumbColor={criarChat ? "#3F51B5" : "#f4f3f4"}
          />
        </View>
        <Text style={styles.chatDescription}>
          Um grupo de chat será criado automaticamente para os participantes do
          evento.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.botaoConfirmar}
        onPress={enviarEvento}
        activeOpacity={0.8}
      >
        <AntDesign name="checkcircleo" size={20} color="white" />
        <Text style={styles.botaoTexto}>Confirmar e Criar Evento</Text>
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
    padding: 24,
    backgroundColor: "#F0F4F8", // Cor de fundo suave
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 30,
    color: "#4B0082", // Um roxo escuro
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  item: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  itemLabel: {
    fontWeight: "600",
    width: 110,
    color: "#555",
    fontSize: 15,
  },
  itemValue: {
    flex: 1,
    color: "#333",
    fontSize: 15,
    lineHeight: 22,
  },
  ingressoItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, // Linha fina para separar
    borderBottomColor: "#E0E0E0",
  },
  ingressoNome: {
    fontWeight: "bold",
    color: "#1A1A1A",
    fontSize: 16,
  },
  ingressoDetalhes: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  ingressoDescricao: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  chatOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chatOptionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginRight: 10,
    fontWeight: "500",
  },
  chatDescription: {
    fontSize: 13,
    color: "#777",
    fontStyle: "italic",
  },
  botaoConfirmar: {
    backgroundColor: "#4CAF50",
    padding: 18,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  botaoTexto: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 18,
  },
  botaoVoltar: {
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  botaoTextoVoltar: {
    color: "#6A5ACD", // Roxo suave
    fontWeight: "600",
    fontSize: 16,
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#D9534F",
    textAlign: "center",
    marginBottom: 20,
  },
});