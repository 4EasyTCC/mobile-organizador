import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Etapa3({ navigation }) {
  const [fotoCapa, setFotoCapa] = useState(null);
  const [fotos, setFotos] = useState([]);

  const escolherImagem = async (callback) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos acessar sua galeria para selecionar fotos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        callback(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    }
  };

  const adicionarFotoGeral = async () => {
    if (fotos.length >= 10) {
      Alert.alert("Limite atingido", "Você pode adicionar no máximo 10 fotos");
      return;
    }
    escolherImagem((uri) => setFotos((prev) => [...prev, uri]));
  };

  const removerFoto = (index) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const avancar = async () => {
    const dadosEventoString = await AsyncStorage.getItem("@evento");
    const dadosEvento = dadosEventoString ? JSON.parse(dadosEventoString) : {};

    const dadosAtualizados = {
      ...dadosEvento,
      fotos: {
        capa: fotoCapa,
        galeria: fotos,
      },
    };
    await AsyncStorage.setItem("@evento", JSON.stringify(dadosAtualizados));
    navigation.navigate("Etapa4");

    const dadosSalvos = await AsyncStorage.getItem("@evento");
    console.log("Dados salvos no AsyncStorage:", JSON.parse(dadosSalvos));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Adicionar Fotos</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Foto de Capa</Text>

        <TouchableOpacity
          style={styles.capaContainer}
          onPress={() => escolherImagem(setFotoCapa)}
        >
          {fotoCapa ? (
            <Image source={{ uri: fotoCapa }} style={styles.capaImagem} />
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="add-a-photo" size={32} color="#888" />
              <Text style={styles.placeholderText}>
                Selecionar Foto de Capa
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
          <Text style={styles.limitText}>{fotos.length}/10 fotos</Text>
        </View>

        <FlatList
          data={fotos}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.fotoItemContainer}>
              <Image source={{ uri: item }} style={styles.fotoItem} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removerFoto(index)}
              >
                <FontAwesome name="times-circle" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.adicionarBotao}
              onPress={adicionarFotoGeral}
              disabled={fotos.length >= 10}
            >
              <MaterialIcons name="add" size={28} color="#6200ee" />
            </TouchableOpacity>
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryContainer}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, !fotoCapa && styles.buttonDisabled]}
        onPress={avancar}
        disabled={!fotoCapa}
      >
        <Text style={styles.buttonText}>Próximo</Text>
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  limitText: {
    fontSize: 14,
    color: "#6200ee",
  },
  capaContainer: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  capaImagem: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#888",
    marginTop: 10,
    fontSize: 16,
  },
  galleryContainer: {
    paddingVertical: 5,
  },
  fotoItemContainer: {
    position: "relative",
    marginRight: 15,
  },
  fotoItem: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 10,
  },
  adicionarBotao: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#6200ee",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
