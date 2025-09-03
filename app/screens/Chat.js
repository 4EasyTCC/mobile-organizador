// MensagensScreen.js - Versão Simplificada
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
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";

// ===== TEMA =====
const theme = {
  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    secondary: '#8B5CF6',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    surface: '#334155',
    white: '#FFFFFF',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
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

// ===== DADOS FAKE =====
const mensagensFake = [
  {
    id: '1',
    nome: 'João Silva',
    mensagem: 'Olá! Como está o evento?',
    hora: '10:30',
    avatar: null,
    tipo: 'pessoa',
    novasmensagens: 2,
    online: true,
  },
  {
    id: '2',
    nome: 'Grupo de Organização',
    mensagem: 'Reunião confirmada para amanhã',
    hora: '11:45',
    avatar: null,
    tipo: 'grupo',
    novasmensagens: 0,
    online: false,
  },
  {
    id: '3',
    nome: 'Maria Santos',
    mensagem: 'Obrigada pela resposta!',
    hora: '12:15',
    avatar: null,
    tipo: 'pessoa',
    novasmensagens: 0,
    online: true,
  },
  {
    id: '4',
    nome: 'Pedro Costa',
    mensagem: 'Preciso de ajuda com a organização',
    hora: '14:20',
    avatar: null,
    tipo: 'pessoa',
    novasmensagens: 5,
    online: false,
  },
  {
    id: '5',
    nome: 'Equipe de Marketing',
    mensagem: 'Material aprovado!',
    hora: '15:00',
    avatar: null,
    tipo: 'grupo',
    novasmensagens: 0,
    online: false,
  },
];

// ===== COMPONENTE PRINCIPAL =====
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

  const renderMessageCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.messageCard}
      onPress={() => navigation.navigate("ChatDetail", { contact: item })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.messageCardGradient}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {item.nome.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          {item.online && <View style={styles.onlineIndicator} />}
          {item.tipo === "grupo" && (
            <View style={styles.groupBadge}>
              <Feather name="users" size={10} color={theme.colors.white} />
            </View>
          )}
        </View>

        {/* Conteúdo */}
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageName}>{item.nome}</Text>
            <Text style={styles.messageTime}>{item.hora}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.mensagem}
          </Text>
        </View>

        {/* Badge de mensagens não lidas */}
        {item.novasmensagens > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.novasmensagens}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSecondary]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mensagens</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Feather name="bell" size={24} color={theme.colors.white} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.searchBar}
          >
            <Feather name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar conversas..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Feather name="x" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {["Todas", "Pessoas", "Grupos"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setFiltro(tab)}
              style={styles.filterButton}
            >
              {filtro === tab ? (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
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

        {/* Stats Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
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
        </ScrollView>

        {/* Lista de Mensagens */}
        <FlatList
          data={filtrarMensagens()}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma conversa encontrada</Text>
            </View>
          )}
        />

        {/* FAB - Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate("NewMessage")}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.fabGradient}
          >
            <Feather name="edit-3" size={24} color={theme.colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Tab Bar */}
        <View style={styles.bottomTabBar}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)']}
            style={styles.tabBarGradient}
          >
            <TouchableOpacity style={styles.tabButton}>
              <MaterialIcons name="home" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tabButton}>
              <Feather name="message-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.centerTabButton}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.centerTabGradient}
              >
                <Feather name="plus" size={28} color={theme.colors.white} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tabButton}>
              <Feather name="bar-chart" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tabButton}>
              <MaterialIcons name="person" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  
  notificationButton: {
    position: 'relative',
  },
  
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  searchInput: {
    flex: 1,
    color: theme.colors.white,
    fontSize: 16,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  
  filterButton: {
    marginHorizontal: theme.spacing.xs,
  },
  
  activeFilter: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  
  inactiveFilter: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  activeFilterText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  inactiveFilterText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  
  statsScroll: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  
  statCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginVertical: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  
  listContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 120,
  },
  
  messageCard: {
    marginBottom: theme.spacing.sm,
  },
  
  messageCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  
  groupBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  messageContent: {
    flex: 1,
  },
  
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  messageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  
  messageTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  
  messageText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  
  unreadText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  
  separator: {
    height: theme.spacing.sm,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  
  fab: {
    position: 'absolute',
    bottom: 100,
    right: theme.spacing.lg,
  },
  
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  tabBarGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  
  tabButton: {
    padding: theme.spacing.sm,
  },
  
  centerTabButton: {
    marginBottom: theme.spacing.md,
  },
  
  centerTabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MensagensScreen;