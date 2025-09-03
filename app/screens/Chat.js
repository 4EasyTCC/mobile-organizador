// MensagensScreen.js - Versão Modernizada
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withTiming,
  interpolateColor
} from "react-native-reanimated";

// Importar tema
import { theme } from "../theme";

// Componentes customizados
import SearchBar from "../components/SearchBar";
import MessageCard from "../components/MessageCard"; // ✅ mantém apenas esse
import FilterTabs from "../components/FilterTabs";
import BottomTabBar from "../components/BottomTabBar";

const mensagensFake = Array.from({ length: 15 }).map((_, i) => ({
  id: i.toString(),
  nome: `Usuário ${i + 1}`,
  mensagem: i % 3 === 0 
    ? "Olá! Como está o evento?" 
    : i % 2 === 0 
    ? "Preciso de ajuda com a organização" 
    : "Obrigado pela resposta!",
  hora: `${10 + (i % 12)}:${30 + (i % 30)}`,
  avatar: require("../imagens/avatar-placeholder.png"),
  tipo: i % 4 === 0 ? "grupo" : "pessoa",
  novasmensagens: i % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : 0,
  online: i % 2 === 0,
  ultimaVez: i % 2 === 0 ? null : "há 5 min"
}));

const MensagensScreen = ({ navigation }) => {
  const [filtro, setFiltro] = useState("Todas");
  const [searchText, setSearchText] = useState("");

  const filtrarMensagens = () => {
    let filtered = mensagensFake;
    
    if (filtro !== "Todas") {
      filtered = filtered.filter(msg => 
        filtro === "Pessoas" ? msg.tipo === "pessoa" : msg.tipo === "grupo"
      );
    }
    
    if (searchText.trim()) {
      filtered = filtered.filter(msg =>
        msg.nome.toLowerCase().includes(searchText.toLowerCase()) ||
        msg.mensagem.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderItem = ({ item, index }) => (
    <MessageCard 
      message={item} 
      index={index}
      onPress={() => navigation.navigate("ChatDetail", { contact: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={styles.container}
      >
        {/* Header com Logo */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.logoContainer}
          >
            <MaterialIcons name="chat" size={32} color={theme.colors.primary} />
            <Text style={styles.logoText}>Mensagens</Text>
          </LinearGradient>
          
          {/* Notification Badge */}
          <TouchableOpacity style={styles.notificationButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.notificationContainer}
            >
              <Feather name="bell" size={20} color={theme.colors.white} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>3</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar conversas..."
        />

        {/* Filter Tabs */}
        <FilterTabs
          tabs={["Todas", "Pessoas", "Grupos"]}
          selectedTab={filtro}
          onTabPress={setFiltro}
        />

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={theme.colors.primaryGradient}
            style={styles.statCard}
          >
            <Feather name="message-circle" size={20} color={theme.colors.white} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Ativas</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.statCard}
          >
            <Feather name="users" size={20} color={theme.colors.white} />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.statCard}
          >
            <Feather name="clock" size={20} color={theme.colors.white} />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </LinearGradient>
        </View>

        {/* Messages List */}
        <FlatList
          data={filtrarMensagens()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma conversa encontrada</Text>
              <Text style={styles.emptySubtext}>
                {searchText ? "Tente ajustar sua busca" : "Inicie uma nova conversa"}
              </Text>
            </View>
          )}
        />

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate("NewMessage")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.colors.primaryGradient}
            style={styles.fabGradient}
          >
            <Feather name="edit-3" size={24} color={theme.colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Tab Bar */}
        <BottomTabBar navigation={navigation} activeTab="Messages" />
      </LinearGradient>
    </SafeAreaView>
  );
};

// Mantém apenas o FilterTabs (MessageCard já vem de outro arquivo)
const FilterTabs = ({ tabs, selectedTab, onTabPress }) => {
  return (
    <View style={styles.filterContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabPress(tab)}
          style={styles.filterButton}
          activeOpacity={0.8}
        >
          {selectedTab === tab ? (
            <LinearGradient
              colors={theme.colors.primaryGradient}
              style={styles.activeFilter}
            >
              <Text style={styles.activeFilterText}>{tab}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveFilter}>
              <Text style={styles.inactiveFilterText}>{tab}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (todo o seu StyleSheet continua igual)
});

export default MensagensScreen;
