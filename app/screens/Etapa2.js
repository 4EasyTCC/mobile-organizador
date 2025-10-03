import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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

export default function Mapa({ navigation, route }) {
  const [region, setRegion] = useState({
    latitude: -23.5505, // Padrão São Paulo
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  // A chave da API de Geocodificação deve ser fornecida pelo usuário ou ambiente
  // Manter a chave fornecida na requisição original
  const GEOCODING_API_KEY = "f4e1b5352e5c4b62a81c7121891d3f76";

  const handleSearch = async () => {
    if (searchText.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          searchText
        )}&key=${GEOCODING_API_KEY}`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.log("Erro na busca:", error);
      Alert.alert("Erro", "Não foi possível buscar o endereço");
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = (item) => {
    const newRegion = {
      latitude: item.geometry.lat,
      longitude: item.geometry.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    setSearchText(item.formatted);
    setSelectedPlace(item);
    setResults([]);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const confirmLocation = async () => {
    if (!selectedPlace) {
      Alert.alert("Atenção", "Selecione um local no mapa");
      return;
    }
    try {
      const dadosEventoString = await AsyncStorage.getItem("@evento");
      const dadosEvento = dadosEventoString ? JSON.parse(dadosEventoString) : {};

      // Extrair componentes de endereço de forma segura
      const components = selectedPlace.components || {};
      const dadosAtualizados = {
        ...dadosEvento,
        localizacao: {
          latitude: selectedPlace.geometry.lat,
          longitude: selectedPlace.geometry.lng,
          endereco: selectedPlace.formatted || "Endereço não detalhado",
          cidade: components.city || components.town || components.village || "Não Informada",
          estado: components.state || "Não Informado",
          cep: components.postcode || "Não Informado",
          pais: components.country || "Não Informado",
        },
      };

      await AsyncStorage.setItem("@evento", JSON.stringify(dadosAtualizados));
      setShowConfirmation(false);
      navigation.navigate("Etapa3");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados da localização");
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    // Define a localização selecionada, assumindo um endereço temporário/genérico
    setSelectedPlace({
      geometry: { lat: latitude, lng: longitude },
      formatted: `Localização marcada (Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)})`,
      components: {
        // Campos em branco pois não fizemos reverse geocoding
        city: "Local no Mapa",
        state: "Manual",
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <View style={styles.container}>
        {/* Mapa */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          onPress={handleMapPress}
          customMapStyle={mapStyle} // Para o dark theme
        >
          {selectedPlace && (
            <Marker
              coordinate={{
                latitude: selectedPlace.geometry.lat,
                longitude: selectedPlace.geometry.lng,
              }}
              title={selectedPlace.formatted}
            >
              <View style={styles.customMarker}>
                <View style={styles.markerPulse} />
                <Ionicons
                  name="location"
                  size={48}
                  color={theme.colors.primary}
                />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Header Fixo */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>ETAPA 2 DE 5</Text>
          </View>
        </View>

        {/* Barra de Busca */}
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={22}
            color={theme.colors.primary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Buscar endereço do evento"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {loading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
          )}
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                setResults([]);
              }}
            >
              <Ionicons
                name="close-circle"
                size={22}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados da Busca */}
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={results}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => selectLocation(item)}
                >
                  <View style={styles.resultIcon}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.formatted}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Botão Flutuante de Confirmação */}
        {selectedPlace && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setShowConfirmation(true)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.floatingButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={theme.colors.white}
              />
              <Text style={styles.floatingButtonText}>
                Confirmar Localização
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Modal de Confirmação - Estilizado para Dark Theme */}
        <Modal
          visible={showConfirmation}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmation(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={theme.colors.primary}
                />
              </View>

              <Text style={styles.modalTitle}>Confirmar Localização</Text>
              <Text style={styles.modalSubtitle}>
                Este será o endereço do seu evento
              </Text>

              <View style={styles.locationCard}>
                <Feather name="map-pin" size={20} color={theme.colors.primary} />
                <Text style={styles.locationText} numberOfLines={3}>
                  {selectedPlace?.formatted || "Local selecionado"}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowConfirmation(false)}
                >
                  <Text style={styles.cancelButtonText}>Corrigir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmLocation}
                  style={styles.modalButtonConfirm}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.confirmButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: theme.colors.backgroundSecondary }] },
  { elementType: "labels.text.stroke", stylers: [{ color: theme.colors.backgroundSecondary }] },
  { elementType: "labels.text.fill", stylers: [{ color: theme.colors.textSecondary }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: theme.colors.textSecondary }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: theme.colors.textSecondary }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: theme.colors.surface }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: theme.colors.textSecondary }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: theme.colors.surface }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: theme.colors.background }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: theme.colors.textPrimary }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: theme.colors.primaryDark }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: theme.colors.backgroundSecondary }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: theme.colors.white }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: theme.colors.backgroundSecondary }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: theme.colors.surface }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: theme.colors.textSecondary }],
  },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  // --- HEADER STYLE ---
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: "rgba(15, 23, 42, 0.7)", // Background semitransparente
    zIndex: 10,
  },
  backButton: {
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  badgeContainer: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.white,
    letterSpacing: 1,
  },
  // --- SEARCH BAR STYLE ---
  searchContainer: {
    position: "absolute",
    top: 100, // Abaixo do header
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 5,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 52,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  // --- RESULTS LIST STYLE ---
  resultsContainer: {
    position: "absolute",
    top: 165, // Abaixo da barra de busca
    left: theme.spacing.md,
    right: theme.spacing.md,
    maxHeight: 280,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    zIndex: 5,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  resultText: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
  },
  // --- MARKER STYLE ---
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
  },
  // --- FLOATING BUTTON STYLE ---
  floatingButton: {
    position: "absolute",
    bottom: theme.spacing.xl,
    left: theme.spacing.md,
    right: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    elevation: 10,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  floatingButtonGradient: {
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: theme.spacing.sm,
  },
  // --- MODAL STYLE (Uses light background for contrast/focus) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)", // Fundo escuro
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: width - theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  modalHeader: {
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.background,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.textPrimary, // Off-white
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    width: "100%",
  },
  locationText: {
    marginLeft: theme.spacing.md,
    color: theme.colors.background,
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.textPrimary,
  },
  modalButtonConfirm: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  confirmButtonGradient: {
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButtonText: {
    fontWeight: "700",
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  confirmButtonText: {
    fontWeight: "700",
    color: theme.colors.white,
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
});
