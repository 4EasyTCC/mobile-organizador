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
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@env";

export default function Etapa3({ navigation }) {
  const [fotoCapa, setFotoCapa] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const adicionarFotoGeral = () => {
    if (fotos.length >= 10) {
      Alert.alert("Limite atingido", "Você pode adicionar no máximo 10 fotos");
      return;
    }
    escolherImagem((uri) => setFotos((prev) => [...prev, uri]));
  };

  const removerFoto = (index) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const uploadImagem = async (uri) => {
    const formData = new FormData();
    formData.append("arquivo", {
      uri: uri,
      name: `foto_${Date.now()}.jpg`,
      type: "image/jpeg",
    });

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.url;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      Alert.alert("Erro de Upload", "Não foi possível enviar a imagem.");
      return null;
    }
  };

  const avancar = async () => {
    if (!fotoCapa) {
      Alert.alert("Atenção", "Selecione uma foto de capa.");
      return;
    }

    setLoading(true);

    try {
      const uploadedFotos = [];

      const capaUrl = await uploadImagem(fotoCapa);
      if (capaUrl) {
        uploadedFotos.push({ url: capaUrl, tipo: "capa" });
      }

      for (const fotoUri of fotos) {
        const fotoUrl = await uploadImagem(fotoUri);
        if (fotoUrl) {
          uploadedFotos.push({ url: fotoUrl, tipo: "galeria" });
        }
      }

      const dadosEventoString = await AsyncStorage.getItem("@evento");
      const dadosEvento = dadosEventoString
        ? JSON.parse(dadosEventoString)
        : {};

      const dadosAtualizados = {
        ...dadosEvento,
        fotos: uploadedFotos,
      };
      await AsyncStorage.setItem("@evento", JSON.stringify(dadosAtualizados));

      navigation.navigate("Etapa4");
    } catch (error) {
      console.error("Erro ao processar as fotos:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1400b4" />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.progressText}>Etapa 3 de 5</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Adicione Fotos</Text>
        <Text style={styles.subtitulo}>
          Imagens atraentes ajudam a aumentar o interesse no seu evento
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image" size={24} color="#1400b4" />
            <Text style={styles.sectionTitle}>Foto de Capa</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Esta será a imagem principal do seu evento
          </Text>

          <TouchableOpacity
            style={styles.capaContainer}
            onPress={() => escolherImagem(setFotoCapa)}
            activeOpacity={0.8}
          >
            {fotoCapa ? (
              <>
                <Image source={{ uri: fotoCapa }} style={styles.capaImagem} />
                <View style={styles.capaOverlay}>
                  <Ionicons name="camera" size={32} color="#ffffff" />
                  <Text style={styles.capaOverlayText}>Alterar Foto</Text>
                </View>
              </>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholderIcon}>
                  <Ionicons name="image-outline" size={48} color="#1400b4" />
                </View>
                <Text style={styles.placeholderTitle}>Adicionar Foto de Capa</Text>
                <Text style={styles.placeholderSubtitle}>
                  Toque para selecionar da galeria
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images" size={24} color="#1400b4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
              <Text style={styles.limitBadge}>{fotos.length}/10 fotos</Text>
            </View>
          </View>
          <Text style={styles.sectionDescription}>
            Adicione mais fotos para mostrar detalhes do evento
          </Text>

          <FlatList
            data={[...fotos, 'add']}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => {
              if (item === 'add') {
                return (
                  <TouchableOpacity
                    style={styles.adicionarBotao}
                    onPress={adicionarFotoGeral}
                    disabled={fotos.length >= 10}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addIcon}>
                      <Ionicons 
                        name="add" 
                        size={32} 
                        color={fotos.length >= 10 ? "#a0a0b8" : "#1400b4"} 
                      />
                    </View>
                    <Text style={[
                      styles.addText,
                      fotos.length >= 10 && styles.addTextDisabled
                    ]}>
                      Adicionar
                    </Text>
                  </TouchableOpacity>
                );
              }
              
              return (
                <View style={styles.fotoItemContainer}>
                  <Image source={{ uri: item }} style={styles.fotoItem} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removerFoto(index)}
                  >
                    <Ionicons name="close-circle" size={28} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              );
            }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!fotoCapa || loading) && styles.buttonDisabled]}
          onPress={avancar}
          disabled={!fotoCapa || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fd",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#1400b4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f8f9fd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#e8e8f0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1400b4",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: "#7575a3",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    color: "#7575a3",
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 36,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  limitBadge: {
    fontSize: 13,
    color: "#1400b4",
    fontWeight: "600",
    marginTop: 2,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#7575a3",
    marginBottom: 16,
    lineHeight: 20,
  },
  capaContainer: {
    height: 220,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e8e8f0",
    shadowColor: "#1400b4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  capaImagem: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  capaOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(20, 0, 180, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  capaOverlayText: {
    color: "#ffffff",
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#f0edff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  placeholderTitle: {
    color: "#1a1a2e",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  placeholderSubtitle: {
    color: "#7575a3",
    fontSize: 14,
  },
  galleryContainer: {
    gap: 12,
  },
  fotoItemContainer: {
    position: "relative",
  },
  fotoItem: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: "#f0f0f5",
    borderWidth: 2,
    borderColor: "#e8e8f0",
  },
  removeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  adicionarBotao: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1400b4",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fd",
  },
  addIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0edff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  addText: {
    color: "#1400b4",
    fontSize: 14,
    fontWeight: "600",
  },
  addTextDisabled: {
    color: "#a0a0b8",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#1400b4",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
    shadowColor: "#1400b4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: "#c0c0d0",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});