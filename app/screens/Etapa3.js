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
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

// Definição do tema para consistência
const theme = {
  colors: {
    primary: "#6366F1", // Indigo
    primaryDark: "#4F46E5",
    secondary: "#8B5CF6", // Violet/Fuchsia-ish
    background: "#0F172A", // Dark Blue/Slate
    backgroundSecondary: "#1E293B", // Slightly lighter Dark Blue/Slate
    surface: "#334155", // Even lighter Slate
    white: "#FFFFFF",
    textPrimary: "#F1F5F9", // Off-white
    textSecondary: "#94A3B8", // Light Slate/Gray
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};

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

  // Funções de upload sem alteração, conforme solicitado
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
      } else {
        setLoading(false);
        Alert.alert("Erro Crítico", "Falha ao enviar a foto de capa.");
        return;
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>

          {/* Progress Bar e Etapa */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "60%" }]} />
            </View>
            <Text style={styles.progressText}>Etapa 3 de 5</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titulo}>Adicione Mídias</Text>
          <Text style={styles.subtitulo}>
            Imagens atraentes ajudam a aumentar o interesse no seu evento
          </Text>

          {/* Seção Foto de Capa */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="camera" size={24} color={theme.colors.primary} />
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
                  <LinearGradient
                    colors={["rgba(0,0,0,0.5)", theme.colors.primaryDark]}
                    style={styles.capaOverlay}
                  >
                    <Ionicons name="camera" size={32} color={theme.colors.white} />
                    <Text style={styles.capaOverlayText}>Alterar Foto</Text>
                  </LinearGradient>
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <View style={styles.placeholderIcon}>
                    <Ionicons name="image-outline" size={48} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.placeholderTitle}>
                    Adicionar Foto de Capa
                  </Text>
                  <Text style={styles.placeholderSubtitle}>
                    Toque para selecionar da galeria
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Seção Galeria de Fotos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="image" size={24} color={theme.colors.primary} />
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
                <View style={styles.limitBadgeContainer}>
                    <Text style={styles.limitBadge}>{fotos.length}/10 fotos</Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionDescription}>
              Adicione mais fotos para mostrar detalhes do evento
            </Text>

            <FlatList
              data={[...fotos, "add"]}
              horizontal
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => {
                if (item === "add") {
                  return (
                    <TouchableOpacity
                      style={[
                        styles.adicionarBotao,
                        fotos.length >= 10 && styles.adicionarBotaoDisabled,
                      ]}
                      onPress={adicionarFotoGeral}
                      disabled={fotos.length >= 10}
                      activeOpacity={0.7}
                    >
                      <View style={styles.addIcon}>
                        <Ionicons
                          name="add"
                          size={32}
                          color={
                            fotos.length >= 10
                              ? theme.colors.textSecondary
                              : theme.colors.primary
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.addText,
                          fotos.length >= 10 && styles.addTextDisabled,
                        ]}
                      >
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
                      <Ionicons name="close-circle" size={28} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                );
              }}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContainer}
            />
          </View>

          {/* Botão de Continuar */}
          <TouchableOpacity
            style={[styles.button, (!fotoCapa || loading) && styles.buttonDisabled]}
            onPress={avancar}
            disabled={!fotoCapa || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                (!fotoCapa || loading) ? [theme.colors.surface, theme.colors.surface] : [theme.colors.primary, theme.colors.secondary]
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Continuar</Text>
                  <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitulo: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  section: {
    marginBottom: theme.spacing.lg * 1.5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  limitBadgeContainer: {
    marginLeft: theme.spacing.md
  },
  limitBadge: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  capaContainer: {
    height: 220,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.surface,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    backgroundColor: "rgba(79, 70, 229, 0.7)", // primaryDark com opacidade
    alignItems: "center",
    justifyContent: "center",
  },
  capaOverlayText: {
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  placeholderTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  placeholderSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  galleryContainer: {
    gap: theme.spacing.md,
  },
  fotoItemContainer: {
    position: "relative",
  },
  fotoItem: {
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  removeButton: {
    position: "absolute",
    top: -theme.spacing.sm,
    right: -theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs / 2,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  adicionarBotao: {
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
  },
  adicionarBotaoDisabled: {
    borderColor: theme.colors.surface,
  },
  addIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  addText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  addTextDisabled: {
    color: theme.colors.textSecondary,
  },
  button: {
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.lg,
    overflow: "hidden",
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
