import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather, AntDesign, Ionicons, Entypo } from "@expo/vector-icons";

const mensagensFake = Array.from({ length: 10 }).map((_, i) => ({
  id: i.toString(),
  nome: "Pessoa",
  mensagem: "mensagem pessoa",
  hora: "10:30",
}));

const MensagensScreen = () => {
  const [filtro, setFiltro] = useState("Todas");

  const renderItem = ({ item }) => (
    <View style={styles.mensagemContainer}>
      <Image
        source={require("../imagens/avatar-placeholder.png")} // Coloque um avatar genérico aqui
        style={styles.avatar}
      />
      <View style={styles.textoContainer}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.mensagem}>{item.mensagem}</Text>
      </View>
      <Text style={styles.hora}>{item.hora}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../imagens/branca.png")} // Sua logo branca aqui
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="pesquise"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        {["Todas", "Pessoas", "Grupos"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setFiltro(item)}
            style={[
              styles.filtroBotao,
              filtro === item && styles.filtroBotaoAtivo,
            ]}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === item && styles.filtroTextoAtivo,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de mensagens */}
      <FlatList
        data={mensagensFake}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Navegação inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity>
          <Feather name="home" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <AntDesign name="message1" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#03001E",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "white",
    height: 40,
  },
  filtrosContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  filtroBotao: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    marginHorizontal: 4,
  },
  filtroBotaoAtivo: {
    backgroundColor: "#1400B4",
  },
  filtroTexto: {
    color: "#aaa",
    fontSize: 14,
  },
  filtroTextoAtivo: {
    color: "white",
    fontWeight: "bold",
  },
  mensagemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#444",
    marginRight: 12,
  },
  textoContainer: {
    flex: 1,
  },
  nome: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  mensagem: {
    color: "#aaa",
    fontSize: 14,
  },
  hora: {
    color: "#aaa",
    fontSize: 12,
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1400B4",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MensagensScreen;
