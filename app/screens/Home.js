import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("Ativos");
  const [searchText, setSearchText] = useState("");

  // Dados mockados para demonstração
  const eventosMock = [
    {
      id: "1",
      titulo: "Evento de Tecnologia",
      subtitulo: "Organizado por TechCorp",
      data: "15 NOV",
      categoria: "Ativos",
    },
    {
      id: "2",
      titulo: "Workshop de Design",
      subtitulo: "Organizado por DesignStudio",
      data: "22 NOV",
      categoria: "Ativos",
    },
    {
      id: "3",
      titulo: "Conferência Finalizada",
      subtitulo: "Organizado por EventCorp",
      data: "05 OUT",
      categoria: "Concluídos",
    },
    {
      id: "4",
      titulo: "Rascunho do Evento",
      subtitulo: "Organizado por MeuEvento",
      data: "TBD",
      categoria: "Rascunhos",
    },
  ];

  const renderEvento = ({ item }) => (
    <BlurView intensity={20} style={styles.card}>
      <LinearGradient
        colors={["rgba(30, 30, 30, 0.9)", "rgba(20, 0, 180, 0.3)"]}
        style={styles.cardGradient}
      >
        <View style={styles.iconContainer}>
          <Feather name="calendar" size={24} color="#1400B4" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.subtitulo}>{item.subtitulo}</Text>
        </View>
        <LinearGradient
          colors={["#1400B4", "#6B46C1"]}
          style={styles.dataContainer}
        >
          <Text style={styles.dataTexto}>{item.data}</Text>
        </LinearGradient>
      </LinearGradient>
    </BlurView>
  );

  const eventosFiltrados = eventosMock.filter(
    (evento) => 
      evento.categoria === selectedTab &&
      (evento.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
       evento.subtitulo.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <LinearGradient colors={["#0e0033", "#1a0066"]} style={styles.container}>
      {/* Logo/Header */}
      <BlurView intensity={30} style={styles.logoContainer}>
        <Feather name="zap" size={40} color="#1400B4" />
        <Text style={styles.logoText}>EventApp</Text>
      </BlurView>

      {/* Search Container */}
      <BlurView intensity={20} style={styles.searchContainer}>
        <Feather name="search" size={20} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquise"
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={setSearchText}
        />
      </BlurView>

      {/* Tabs */}
      <View style={styles.tabs}>
        {["Ativos", "Concluídos", "Rascunhos"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
          >
            <LinearGradient
              colors={
                selectedTab === tab
                  ? ["#1400B4", "#6B46C1"]
                  : ["rgba(30, 30, 30, 0.8)", "rgba(30, 30, 30, 0.8)"]
              }
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de Eventos */}
      <FlatList
        data={eventosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderEvento}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <BlurView intensity={20} style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#6B46C1" />
            <Text style={styles.emptyText}>Nenhum evento encontrado</Text>
          </BlurView>
        }
      />

      {/* Tab Bar */}
      <BlurView intensity={80} style={styles.tabBar}>
        <LinearGradient
          colors={["rgba(30, 30, 30, 0.9)", "rgba(20, 0, 180, 0.2)"]}
          style={styles.tabBarGradient}
        >
          <TouchableOpacity style={styles.tabBarItem}>
            <MaterialIcons name="home" size={24} color="#1400B4" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabBarItem}>
            <Feather name="message-circle" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.centralButton}>
            <LinearGradient
              colors={["#1400B4", "#6B46C1"]}
              style={styles.centralButtonGradient}
            >
              <Feather name="plus" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabBarItem}>
            <AntDesign name="barschart" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabBarItem}>
            <MaterialIcons name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
  },
  logoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },

  listContainer: {
    paddingBottom: 100,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 15,
    overflow: "hidden",
  },
  cardGradient: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  titulo: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  subtitulo: {
    color: "#aaa",
    fontSize: 13,
  },
  dataContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dataTexto: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginHorizontal: 16,
    borderRadius: 15,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },

  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  tabBarGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 10,
  },
  tabBarItem: {
    alignItems: "center",
  },
  centralButton: {
    marginBottom: 30,
  },
  centralButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;