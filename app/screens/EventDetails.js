import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function EventDetails({ route, navigation }) {
  const { evento } = route.params;
  const [selectedTab, setSelectedTab] = useState("Informações");
  const [eventoDetalhes, setEventoDetalhes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarEvento();
  }, []);

  const buscarEvento = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token não encontrado.");
      }

      const idDoEvento = evento.id;
      const response = await fetch(`${API_URL}/api/eventos/${idDoEvento}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro na resposta do servidor.");
      }

      setEventoDetalhes(data.evento);
    } catch (err) {
      console.error("Erro ao carregar evento:", err);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do evento");
    } finally {
      setLoading(false);
    }
  };

  const handleEditIngresso = (ingresso) => {
    Alert.alert(
      "Editar Ingresso",
      `Você clicou para editar o ingresso ${ingresso.nome}`
    );
    // Implemente a navegação ou modal para a tela de edição
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Informações":
        return (
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Icon name="location-outline" size={20} color="#FF3A5C" />
              <Text style={styles.infoText}>
                {eventoDetalhes.localizacao?.endereco ||
                  "Endereço não informado"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="calendar-outline" size={20} color="#FF3A5C" />
              <Text style={styles.infoText}>
                {new Date(eventoDetalhes.dataInicio).toLocaleDateString(
                  "pt-BR"
                )}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="time-outline" size={20} color="#FF3A5C" />
              <Text style={styles.infoText}>
                {new Date(eventoDetalhes.dataInicio).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" }
                )}
                {" - "}
                {new Date(eventoDetalhes.dataFim).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        );
      case "Galeria":
        const fotosGaleria = eventoDetalhes.Midia?.filter(
          (m) => m.tipo === "galeria"
        );
        return (
          <View style={styles.galleryContainer}>
            {fotosGaleria?.length > 0 ? (
              <FlatList
                data={fotosGaleria}
                keyExtractor={(item) => item.midiaId.toString()}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: `${API_URL}${item.url}` }}
                    style={styles.galleryImage}
                  />
                )}
                numColumns={2}
                columnWrapperStyle={styles.galleryRow}
              />
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyStateText}>
                  Nenhuma foto na galeria.
                </Text>
              </View>
            )}
          </View>
        );
      case "Ingressos":
        return (
          <View style={styles.ingressoCardsContainer}>
            {eventoDetalhes.Ingressos?.length > 0 ? (
              eventoDetalhes.Ingressos.map((ing) => (
                <View key={ing.ingressoId} style={styles.ingressoCard}>
                  <View style={styles.ingressoHeader}>
                    <Text style={styles.ingressoTitulo}>{ing.nome}</Text>
                    <TouchableOpacity onPress={() => handleEditIngresso(ing)}>
                      <Icon name="pencil-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.ingressoDetails}>
                    <View style={styles.ingressoDetailItem}>
                      <Text style={styles.ingressoDetailTitle}>Preço</Text>
                      <Text style={styles.ingressoDetailText}>
                        R$ {ing.preco.toFixed(2).replace(".", ",")}
                      </Text>
                    </View>
                    <View style={styles.ingressoDetailItem}>
                      <Text style={styles.ingressoDetailTitle}>Quantidade</Text>
                      <Text style={styles.ingressoDetailText}>
                        {ing.quantidade}
                      </Text>
                    </View>
                    <View style={styles.ingressoDetailItem}>
                      <Text style={styles.ingressoDetailTitle}>
                        Disponível até
                      </Text>
                      <Text style={styles.ingressoDetailText}>
                        {ing.dataLimiteVenda
                          ? new Date(ing.dataLimiteVenda).toLocaleDateString(
                              "pt-BR"
                            )
                          : "Não definida"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyStateText}>
                  Nenhum ingresso disponível.
                </Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  if (loading || !eventoDetalhes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5C" />
        <Text style={styles.loadingText}>Carregando evento...</Text>
      </View>
    );
  }

  const imagemCapa = eventoDetalhes.Midia?.find(
    (midia) => midia.tipo === "capa"
  );
  const capaSource = imagemCapa
    ? { uri: `${API_URL}${imagemCapa.url}` }
    : require("../imagens/roxa.png");

  return (
    <ScrollView style={styles.container}>
      <ImageBackground source={capaSource} style={styles.headerImage}>
        <View style={styles.overlay}>
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
      </ImageBackground>

      <View style={styles.contentContainer}>
        <View style={styles.tabs}>
          {["Informações", "Galeria", "Ingressos"].map((tab) => (
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

        <View style={styles.descriptionCard}>
          <Text style={styles.descTitle}>Descrição</Text>
          <Text style={styles.desc}>{eventoDetalhes.descEvento}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0032",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0c0032",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  headerImage: {
    width: "100%",
    height: 250,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 0, 50, 0.6)",
    justifyContent: "flex-end",
    padding: 20,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  city: {
    color: "#ccc",
    fontSize: 16,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#14004a",
    borderRadius: 30,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 30,
  },
  tabActive: {
    backgroundColor: "#FF3A5C",
  },
  tabText: {
    color: "#ccc",
    fontWeight: "600",
  },
  tabActiveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#14004a",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  descriptionCard: {
    backgroundColor: "#14004a",
    borderRadius: 15,
    padding: 20,
    marginBottom: 80,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
  },
  descTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  desc: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 22,
  },
  emptyStateText: {
    color: "#aaa",
    textAlign: "center",
    paddingVertical: 20,
  },
  // GALERIA
  galleryContainer: {
    marginBottom: 20,
  },
  galleryRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  galleryImage: {
    width: "48%", // 2 colunas com um pequeno espaço entre elas
    height: 150,
    borderRadius: 15,
  },
  // INGRESSOS
  ingressoCardsContainer: {
    marginBottom: 20,
  },
  ingressoCard: {
    backgroundColor: "#14004a",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  ingressoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  ingressoTitulo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  ingressoDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ingressoDetailItem: {
    flex: 1,
    alignItems: "center",
  },
  ingressoDetailTitle: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 5,
  },
  ingressoDetailText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
