import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function Etapa4({ navigation }) {
  const [ingressos, setIngressos] = useState([]);
  const [novoIngresso, setNovoIngresso] = useState({
    nome: "",
    descricao: "",
    preco: "",
    quantidade: "",
    dataLimite: new Date(),
  });
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const adicionarIngresso = () => {
    if (!novoIngresso.nome || !novoIngresso.preco || !novoIngresso.quantidade) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios");
      return;
    }

    setIngressos([
      ...ingressos,
      {
        ...novoIngresso,
        preco: parseFloat(novoIngresso.preco),
        quantidade: parseInt(novoIngresso.quantidade),
      },
    ]);

    setNovoIngresso({
      nome: "",
      descricao: "",
      preco: "",
      quantidade: "",
      dataLimite: new Date(),
    });
  };

  const removerIngresso = (index) => {
    const novosIngressos = [...ingressos];
    novosIngressos.splice(index, 1);
    setIngressos(novosIngressos);
  };

  const avancar = async () => {
    const dadosEventoString = await AsyncStorage.getItem("@evento");
    const dadosEvento = dadosEventoString ? JSON.parse(dadosEventoString) : {};

    const dadosAtualizados = {
      ...dadosEvento,
      ingressos: ingressos,
    };

    await AsyncStorage.setItem("@evento", JSON.stringify(dadosAtualizados));
    navigation.navigate("Etapa5");

    const dadosSalvos = await AsyncStorage.getItem("@evento");
    console.log("Dados salvos no AsyncStorage:", JSON.parse(dadosSalvos));
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="confirmation-number" size={40} color="#fff" />
            </View>
            <Text style={styles.titulo}>Ingressos do Evento</Text>
            <Text style={styles.subtituloHeader}>
              Configure os tipos de ingressos disponíveis
            </Text>
          </View>

          <View style={styles.novoIngressoContainer}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="add-circle" size={24} color="#667eea" />
              <Text style={styles.cardTitulo}>Novo Ingresso</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome do ingresso*"
              placeholderTextColor="#999"
              value={novoIngresso.nome}
              onChangeText={(text) =>
                setNovoIngresso({ ...novoIngresso, nome: text })
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição (opcional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={novoIngresso.descricao}
              onChangeText={(text) =>
                setNovoIngresso({ ...novoIngresso, descricao: text })
              }
            />

            <View style={styles.row}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Preço*</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="0,00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={novoIngresso.preco}
                    onChangeText={(text) =>
                      setNovoIngresso({ ...novoIngresso, preco: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Quantidade*</Text>
                <View style={styles.inputWithIcon}>
                  <MaterialIcons name="people" size={18} color="#999" />
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="100"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={novoIngresso.quantidade}
                    onChangeText={(text) =>
                      setNovoIngresso({ ...novoIngresso, quantidade: text })
                    }
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botaoAdicionar}
              onPress={adicionarIngresso}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="add" size={24} color="white" />
                <Text style={styles.botaoAdicionarTexto}>Adicionar Ingresso</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {ingressos.length > 0 && (
            <View style={styles.listaContainer}>
              <View style={styles.listaHeader}>
                <MaterialIcons name="receipt" size={24} color="#667eea" />
                <Text style={styles.listaTitulo}>
                  Ingressos Configurados
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{ingressos.length}</Text>
                </View>
              </View>

              <FlatList
                data={ingressos}
                scrollEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.ingressoCard}>
                    <View style={styles.ingressoLeft}>
                      <View style={styles.ingressoIconContainer}>
                        <MaterialIcons
                          name="confirmation-number"
                          size={28}
                          color="#667eea"
                        />
                      </View>
                      <View style={styles.ingressoInfo}>
                        <Text style={styles.ingressoNome}>{item.nome}</Text>
                        {item.descricao && (
                          <Text style={styles.ingressoDescricao}>
                            {item.descricao}
                          </Text>
                        )}
                        <View style={styles.ingressoFooter}>
                          <View style={styles.priceTag}>
                            <Text style={styles.ingressoPreco}>
                              R$ {item.preco.toFixed(2)}
                            </Text>
                          </View>
                          <View style={styles.quantityTag}>
                            <MaterialIcons name="people" size={14} color="#666" />
                            <Text style={styles.ingressoQuantidade}>
                              {item.quantidade}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => removerIngresso(index)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="delete-outline" size={24} color="#ff4757" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.botaoAvancar]}
            onPress={avancar}
            disabled={ingressos.length === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                ingressos.length === 0
                  ? ["#e0e0e0", "#e0e0e0"]
                  : ["#4facfe", "#00f2fe"]
              }
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.botaoAvancarTexto}>Continuar</Text>
              <MaterialIcons name="arrow-forward" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f8f9fd",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    opacity: 0.1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2d3436",
    marginBottom: 8,
    textAlign: "center",
  },
  subtituloHeader: {
    fontSize: 16,
    color: "#636e72",
    textAlign: "center",
  },
  novoIngressoContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3436",
    marginLeft: 10,
  },
  input: {
    backgroundColor: "#f8f9fd",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#e9ecef",
    fontSize: 16,
    color: "#2d3436",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  inputWrapper: {
    width: "48%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636e72",
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fd",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#636e72",
    marginRight: 5,
  },
  inputSmall: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: "#2d3436",
  },
  botaoAdicionar: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  gradientButton: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoAdicionarTexto: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  listaContainer: {
    marginBottom: 20,
  },
  listaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  listaTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3436",
    marginLeft: 10,
    flex: 1,
  },
  badge: {
    backgroundColor: "#667eea",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  ingressoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  ingressoLeft: {
    flexDirection: "row",
    flex: 1,
  },
  ingressoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ingressoInfo: {
    flex: 1,
  },
  ingressoNome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 4,
  },
  ingressoDescricao: {
    color: "#636e72",
    fontSize: 14,
    marginBottom: 8,
  },
  ingressoFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceTag: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  ingressoPreco: {
    fontWeight: "700",
    color: "#667eea",
    fontSize: 16,
  },
  quantityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ingressoQuantidade: {
    color: "#636e72",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 71, 87, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  botaoAvancar: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  botaoAvancarTexto: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
    marginRight: 8,
  },
});