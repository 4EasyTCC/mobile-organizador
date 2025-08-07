import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons, Feather, AntDesign } from "@expo/vector-icons";

const PerfilScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Image
          source={require("../imagens/branca.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Header do usuário */}
      <View style={styles.userHeader}>
        <Image
          source={require("../imagens/avatar-placeholder.png")}
          style={styles.avatarSmall}
        />
        <View>
          <Text style={styles.userName}>
            Jorge Junior <Text style={styles.crown}>👑</Text>
          </Text>
          <Text style={styles.userRole}>Organizador de Eventos</Text>
        </View>
      </View>

      {/* Seção Conta */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>
          Conta <Feather name="settings" size={16} />
        </Text>

        <View style={styles.profileSection}>
          <Image
            source={require("../imagens/avatar-placeholder.png")}
            style={styles.avatarLarge}
          />
          <View style={styles.nameArea}>
            <Text style={styles.fullName}>Jorge Junior</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Mudar Nome</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editPhoto}>
              <Text style={styles.linkText}>Alterar Foto</Text>
              <Feather name="edit-3" size={14} color="#1400B4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Opções */}
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notificações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Alterar Senha</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Alterar Conta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Chaves de Acesso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>
            Sair <Feather name="log-out" size={16} />
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.tabBar}>
        <MaterialIcons name="home" size={24} color="#fff" />
        <Feather name="message-circle" size={24} color="#fff" />
        <TouchableOpacity style={styles.centralButton}>
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>
        <AntDesign name="barschart" size={24} color="#fff" />
        <MaterialIcons name="person" size={24} color="#1400B4" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1400B4",
    padding: 16,
  },
  logo: { width: 100, height: 100 },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f3f3f3",
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  crown: {
    fontSize: 14,
    color: "#1400B4",
  },
  userRole: {
    fontSize: 12,
    color: "#777",
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 16,
  },
  nameArea: {
    flex: 1,
  },
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  linkText: {
    color: "#1400B4",
    marginBottom: 4,
  },
  editPhoto: {
    flexDirection: "row",
    alignItems: "center",
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    height: 70,
    paddingBottom: 10,
  },
  centralButton: {
    width: 60,
    height: 60,
    backgroundColor: "#1400B4",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
});

export default PerfilScreen;
