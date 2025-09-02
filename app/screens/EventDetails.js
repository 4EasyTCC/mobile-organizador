import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function EventDetails({ route, navigation }) {
  const { evento } = route.params; // veio da Home
  const [selectedTab, setSelectedTab] = useState("Informações");
  const [eventoDetalhes, setEventoDetalhes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarEvento();
  }, []);

  const buscarEvento = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${API_URL}/api/eventos/${evento.rawData.eventoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setEventoDetalhes(data.evento);
    } catch (err) {
      console.error("Erro ao carregar evento:", err);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do evento");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#1400B4" />
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Carregando evento...
        </Text>
      </View>
    );
  }

  if (!eventoDetalhes) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>Evento não encontrado</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Informações":
        return (
          <View style={styles.info}>
            <View style={styles.row}>
              <Icon name="location-outline" size={18} color="#fff" />
              <Text style={styles.infoText}>
                {eventoDetalhes.localizacao?.endereco ||
                  "Endereço não informado"}
              </Text>
            </View>
            <View style={styles.row}>
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.infoText}>
                {new Date(eventoDetalhes.dataInicio).toLocaleDateString(
                  "pt-BR"
                )}
              </Text>
            </View>
            <View style={styles.row}>
              <Icon name="time-outline" size={18} color="#fff" />
              <Text style={styles.infoText}>
                {new Date(eventoDetalhes.dataInicio).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" }
                )}{" "}
                -{" "}
                {new Date(eventoDetalhes.dataFim).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        );
      case "Convidados":
        return (
          <View style={styles.convidadosContainer}>
            {/* Aqui você pode integrar com rota de convidados */}
            <Text style={{ color: "#aaa" }}>
              Convidados não implementado ainda
            </Text>
          </View>
        );
      case "Ingresso":
        return (
          <View style={styles.ingressoContainer}>
            {eventoDetalhes.ingressos && eventoDetalhes.ingressos.length > 0 ? (
              eventoDetalhes.ingressos.map((ing) => (
                <View key={ing.ingressoId}>
                  <Text style={styles.ingressoTitulo}>{ing.nome}</Text>
                  <Text style={styles.ingressoPreco}>
                    Preço: R$ {ing.preco}
                  </Text>
                  <Text style={styles.ingressoValidade}>
                    Validade:{" "}
                    {ing.dataLimite
                      ? new Date(ing.dataLimite).toLocaleDateString("pt-BR")
                      : "Não definida"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#aaa" }}>Nenhum ingresso disponível</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerImage}>
        <Image
          source={
            eventoDetalhes.midia?.[0]
              ? { uri: eventoDetalhes.midia[0].url }
              : require("../imagens/branca.png")
          }
          style={styles.image}
        />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{eventoDetalhes.nomeEvento}</Text>
        <Text style={styles.city}>
          {eventoDetalhes.localizacao?.cidade || "Cidade"},{" "}
          {eventoDetalhes.localizacao?.estado || ""}
        </Text>
      </View>

      {/* Abas */}
      <View style={styles.tabs}>
        {["Informações", "Convidados", "Ingresso"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={
                selectedTab === tab ? styles.tabActiveText : styles.tabText
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderTabContent()}

      <Text style={styles.descTitle}>Descrição</Text>
      <Text style={styles.desc}>{eventoDetalhes.descEvento}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0032", paddingBottom: 80 },
  headerImage: { position: "relative" },
  image: { width: "100%", height: 180 },
  backBtn: { position: "absolute", top: 15, left: 15 },
  title: {
    position: "absolute",
    bottom: 35,
    left: 20,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  city: {
    position: "absolute",
    bottom: 15,
    left: 20,
    color: "#aaa",
    fontSize: 14,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  tab: { paddingBottom: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#fff" },
  tabText: { color: "#aaa" },
  tabActiveText: { color: "#fff", fontWeight: "bold" },
  info: { paddingHorizontal: 20, marginTop: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { color: "#fff", marginLeft: 8 },
  descTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 20,
    marginLeft: 20,
  },
  desc: { color: "#ccc", marginHorizontal: 20, marginTop: 6 },
  convidadosContainer: { paddingHorizontal: 20, marginTop: 10 },
  ingressoContainer: { paddingHorizontal: 20, marginTop: 10 },
  ingressoTitulo: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  ingressoPreco: { color: "#fff", fontSize: 16, marginTop: 10 },
  ingressoValidade: { color: "#aaa", fontSize: 14, marginTop: 5 },
});
