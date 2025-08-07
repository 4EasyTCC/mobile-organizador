import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function Etapa5({ navigation }) {
  const [dadosEvento, setDadosEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);

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
      console.log("Token sendo usado:", token);
      if (!token) {
        Alert.alert("Erro", "Você precisa estar logado para criar um evento");
        return;
      }

      const dadosParaEnviar = {
        nome: dadosEvento.nome,
        descricao: dadosEvento.descricao,
        estado: dadosEvento.estado,
        tipo: dadosEvento.tipo,
        privacidade: dadosEvento.privacidade,
        dataInicio: dadosEvento.dataInicio,
        dataFim: dadosEvento.dataFim,
        localizacao: dadosEvento.localizacao,
        fotos: dadosEvento.fotos,
        ingressos: dadosEvento.ingressos,
      };
      const response = await axios.post(`${API_URL}/eventos`, dadosParaEnviar, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert("Sucesso!", "Evento criado com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            AsyncStorage.removeItem("@evento");
            navigation.navigate("Home");
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      Alert.alert("Erro", "Não foi possível criar o evento");
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
