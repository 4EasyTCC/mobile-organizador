import React, { useState, useRef } from "react";
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
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function Mapa({ navigation, route }) {
  const [region, setRegion] = useState({
    latitude: -23.5505,
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
        )}&key=f4e1b5352e5c4b62a81c7121891d3f76`
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

      const dadosAtualizados = {
        ...dadosEvento,
        localizacao: {
          latitude: selectedPlace.geometry.lat,
          longitude: selectedPlace.geometry.lng,
          endereco: selectedPlace.formatted,
          cidade: selectedPlace.components.city || selectedPlace.components.town,
          estado: selectedPlace.components.state,
          cep: selectedPlace.components.postcode,
        },
      };

      await AsyncStorage.setItem("@evento", JSON.stringify(dadosAtualizados));
      navigation.navigate("Etapa3");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados");
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        onPress={(e) => {
          setSelectedPlace({
            geometry: {
              lat: e.nativeEvent.coordinate.latitude,
              lng: e.nativeEvent.coordinate.longitude,
            },
            formatted: "Local selecionado no mapa",
            components: {},
          });
        }}
      >
        {selectedPlace && (
          <Marker
            coordinate={{
              latitude: selectedPlace.geometry.lat,
              longitude: selectedPlace.geometry.lng,
            }}
          >
            <View style={styles.customMarker}>
              <View style={styles.markerPulse} />
              <Ionicons name="location" size={48} color="#1400b4" />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={22}
          color="#7575a3"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Buscar endereço do evento"
          placeholderTextColor="#a0a0b8"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#1400b4" />}
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchText("");
            setResults([]);
          }}>
            <Ionicons name="close-circle" size={22} color="#a0a0b8" />
          </TouchableOpacity>
        )}
      </View>

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
                  <Ionicons name="location-outline" size={20} color="#1400b4" />
                </View>
                <Text style={styles.resultText} numberOfLines={2}>
                  {item.formatted}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#1400b4" />
            </View>
            
            <Text style={styles.modalTitle}>Confirmar Localização</Text>
            <Text style={styles.modalSubtitle}>
              Este será o endereço do seu evento
            </Text>

            <View style={styles.locationCard}>
              <Ionicons name="location" size={24} color="#1400b4" />
              <Text style={styles.locationText} numberOfLines={3}>
                {selectedPlace?.formatted || "Local selecionado"}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Corrigir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLocation}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedPlace && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowConfirmation(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
          <Text style={styles.floatingButtonText}>Confirmar Localização</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fd",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#1400b4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    color: "#1a1a2e",
    fontSize: 16,
  },
  resultsContainer: {
    position: "absolute",
    top: 130,
    left: 20,
    right: 20,
    maxHeight: 280,
    backgroundColor: "white",
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#1400b4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f5",
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f0edff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  resultText: {
    flex: 1,
    color: "#1a1a2e",
    fontSize: 15,
    lineHeight: 20,
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1400b4",
    opacity: 0.2,
  },
  floatingButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#1400b4",
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#1400b4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  floatingButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 26, 46, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#7575a3",
    marginBottom: 24,
    textAlign: "center",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8f9fd",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#e8e8f0",
    width: "100%",
  },
  locationText: {
    marginLeft: 12,
    color: "#1a1a2e",
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButton: {
    backgroundColor: "#f0f0f5",
    borderWidth: 2,
    borderColor: "#e8e8f0",
  },
  confirmButton: {
    backgroundColor: "#1400b4",
    shadowColor: "#1400b4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    fontWeight: "700",
    color: "#7575a3",
    fontSize: 16,
  },
  confirmButtonText: {
    fontWeight: "700",
    color: "#ffffff",
    fontSize: 16,
    marginRight: 8,
  },
});