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
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Função para buscar o endereço na API
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

      const dadosSalvos = await AsyncStorage.getItem("@evento");
      console.log("Dados salvos no AsyncStorage:", JSON.parse(dadosSalvos));
    } catch (error) {
      console.error("Erro ao salvar dados da Etapa 1:", error);
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
            <View style={styles.marker}>
              <MaterialIcons name="location-on" size={32} color="#3F51B5" />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={24}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Buscar endereço"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#3F51B5" />}
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
                <MaterialIcons name="place" size={20} color="#3F51B5" />
                <Text style={styles.resultText}>{item.formatted}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar localização</Text>

            <View style={styles.locationCard}>
              <MaterialIcons name="location-on" size={28} color="#3F51B5" />
              <Text style={styles.locationText} numberOfLines={2}>
                {selectedPlace?.formatted || "Local selecionado"}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.buttonText}>Corrigir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLocation}
              >
                <Text style={[styles.buttonText, { color: "white" }]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedPlace && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowConfirmation(true)}
        >
          <Text style={styles.floatingButtonText}>Confirmar local</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
  },
  resultsContainer: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    maxHeight: 200,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    paddingVertical: 5,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    marginLeft: 10,
    color: "#555",
    flex: 1,
  },
  marker: {
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#3F51B5",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    elevation: 3,
  },
  floatingButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 10,
    color: "#555",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
  },
  confirmButton: {
    backgroundColor: "#3F51B5",
  },
  buttonText: {
    fontWeight: "bold",
  },
});
