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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Etapa4({ navigation }) {
  const [ingressos, setIngressos] = useState([]);
  const [novoIngresso, setNovoIngresso] = useState({
    nome: "",
    descricao: "",
    preco: "",
    quantidade: "",
    dataLimite: new Date(),
  });

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Configurar Ingressos</Text>

      <View style={styles.novoIngressoContainer}>
        <Text style={styles.subtitulo}>Adicionar Novo Ingresso</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do ingresso*"
          value={novoIngresso.nome}
          onChangeText={(text) =>
            setNovoIngresso({ ...novoIngresso, nome: text })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Descrição (opcional)"
          value={novoIngresso.descricao}
          onChangeText={(text) =>
            setNovoIngresso({ ...novoIngresso, descricao: text })
          }
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="Preço*"
            keyboardType="numeric"
            value={novoIngresso.preco}
            onChangeText={(text) =>
              setNovoIngresso({ ...novoIngresso, preco: text })
            }
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="Quantidade*"
            keyboardType="numeric"
            value={novoIngresso.quantidade}
            onChangeText={(text) =>
              setNovoIngresso({ ...novoIngresso, quantidade: text })
            }
          />
        </View>

        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={adicionarIngresso}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.botaoAdicionarTexto}>Adicionar Ingresso</Text>
        </TouchableOpacity>
      </View>

      {ingressos.length > 0 && (
        <View style={styles.listaContainer}>
          <Text style={styles.subtitulo}>
            Ingressos Adicionados ({ingressos.length})
          </Text>

          <FlatList
            data={ingressos}
            scrollEnabled={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.ingressoCard}>
                <View style={styles.ingressoHeader}>
                  <Text style={styles.ingressoNome}>{item.nome}</Text>
                  <TouchableOpacity onPress={() => removerIngresso(index)}>
                    <MaterialIcons name="delete" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>

                {item.descricao && (
                  <Text style={styles.ingressoDescricao}>{item.descricao}</Text>
                )}

                <View style={styles.ingressoFooter}>
                  <Text style={styles.ingressoPreco}>
                    R$ {item.preco.toFixed(2)}
                  </Text>
                  <Text style={styles.ingressoQuantidade}>
                    {item.quantidade} ingressos
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.botaoAvancar,
          ingressos.length === 0 && styles.botaoAvancarDisabled,
        ]}
        onPress={avancar}
        disabled={ingressos.length === 0}
      >
        <Text style={styles.botaoAvancarTexto}>Próximo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  novoIngressoContainer: {
    marginBottom: 30,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputSmall: {
    width: "48%",
  },
  botaoAdicionar: {
    flexDirection: "row",
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoAdicionarTexto: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  listaContainer: {
    marginBottom: 20,
  },
  ingressoCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  ingressoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ingressoNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ingressoDescricao: {
    color: "#666",
    marginBottom: 8,
  },
  ingressoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ingressoPreco: {
    fontWeight: "bold",
    color: "#6200ee",
  },
  ingressoQuantidade: {
    color: "#666",
  },
  botaoAvancar: {
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoAvancarDisabled: {
    backgroundColor: "#cccccc",
  },
  botaoAvancarTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
