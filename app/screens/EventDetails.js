import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function EventDetails({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('Informações');

  // Dados fictícios de convidados com status coloridos
  const convidados = [
    { id: '1', nome: 'João Silva', convite: 'Confirmado', avatar: '👨‍💼' },
    { id: '2', nome: 'Maria Oliveira', convite: 'Pendente', avatar: '👩‍💻' },
    { id: '3', nome: 'Carlos Souza', convite: 'Confirmado', avatar: '👨‍🎨' },
    { id: '4', nome: 'Ana Santos', convite: 'Recusado', avatar: '👩‍🔬' },
    { id: '5', nome: 'Pedro Costa', convite: 'Confirmado', avatar: '👨‍🏫' },
  ];

  const ingresso = {
    tipo: 'VIP Premium',
    preco: 'R$ 150,00',
    validade: 'Até 01/07/2025',
    codigo: 'EVT2024VIP001',
    secao: 'Área VIP - Setor A',
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return '#00D4AA';
      case 'Pendente': return '#FFB800';
      case 'Recusado': return '#FF6B6B';
      default: return '#6C7B7F';
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Informações':
        return (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Icon name="location" size={20} color="#6366F1" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Localização</Text>
                  <Text style={styles.infoText}>Rua Augusta, 1508 - Consolação</Text>
                  <Text style={styles.infoSubText}>São Paulo, SP</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Icon name="calendar" size={20} color="#EC4899" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Data</Text>
                  <Text style={styles.infoText}>23 de Julho, 2022</Text>
                  <Text style={styles.infoSubText}>Sábado</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Icon name="time" size={20} color="#10B981" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Horário</Text>
                  <Text style={styles.infoText}>13:00 - 14:00</Text>
                  <Text style={styles.infoSubText}>1 hora de duração</Text>
                </View>
              </View>
            </View>
          </View>
        );
        
      case 'Convidados':
        return (
          <View style={styles.convidadosContainer}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{convidados.filter(c => c.convite === 'Confirmado').length}</Text>
                <Text style={styles.statLabel}>Confirmados</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{convidados.filter(c => c.convite === 'Pendente').length}</Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{convidados.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
            
            <FlatList
              data={convidados}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.convidadoCard}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{item.avatar}</Text>
                  </View>
                  <View style={styles.convidadoInfo}>
                    <Text style={styles.convidadoNome}>{item.nome}</Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.convite) }]} />
                      <Text style={[styles.convidadoStatus, { color: getStatusColor(item.convite) }]}>
                        {item.convite}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <Icon name="ellipsis-horizontal" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        );
        
      case 'Ingresso':
        return (
          <View style={styles.ingressoContainer}>
            <View style={styles.ticketCard}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ticketGradient}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketTipo}>{ingresso.tipo}</Text>
                  <Text style={styles.ticketPreco}>{ingresso.preco}</Text>
                </View>
                
                <View style={styles.ticketDivider} />
                
                <View style={styles.ticketDetails}>
                  <View style={styles.ticketDetailRow}>
                    <Text style={styles.ticketDetailLabel}>Código:</Text>
                    <Text style={styles.ticketDetailValue}>{ingresso.codigo}</Text>
                  </View>
                  <View style={styles.ticketDetailRow}>
                    <Text style={styles.ticketDetailLabel}>Seção:</Text>
                    <Text style={styles.ticketDetailValue}>{ingresso.secao}</Text>
                  </View>
                  <View style={styles.ticketDetailRow}>
                    <Text style={styles.ticketDetailLabel}>Válido até:</Text>
                    <Text style={styles.ticketDetailValue}>{ingresso.validade}</Text>
                  </View>
                </View>
                
                <View style={styles.qrCodePlaceholder}>
                  <Icon name="qr-code" size={60} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.qrCodeText}>QR Code</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header com imagem */}
        <View style={styles.headerContainer}>
          <Image source={require('../imagens/evento.jpg')} style={styles.headerImage} />
          
          {/* Overlay gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.headerOverlay}
          />
          
          {/* Botões de navegação */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BlurView intensity={20} style={styles.blurButton}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.editButton}>
            <BlurView intensity={20} style={styles.blurButton}>
              <Icon name="create-outline" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          
          {/* Informações do evento */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Grande Evento</Text>
            <View style={styles.locationContainer}>
              <Icon name="location" size={16} color="#E5E7EB" />
              <Text style={styles.eventLocation}>SÃO PAULO, SP</Text>
            </View>
          </View>
        </View>

        {/* Tabs modernas */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsWrapper}>
            {['Informações', 'Convidados', 'Ingresso'].map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
                {selectedTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Conteúdo das tabs */}
        {renderTabContent()}

        {/* Descrição */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Sobre o Evento</Text>
          <Text style={styles.descriptionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tempor velit et lacus iaculis. Praesent malesuada mi in nunc iaculis, sed sodales risus tincidunt. Nullam facilisis, nunc id aliquam tempus, nisi nulla tincidunt nunc, vel facilisis nunc nunc id nunc.
          </Text>
          
          <TouchableOpacity style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Ler mais</Text>
            <Icon name="chevron-down" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation moderna */}
      <BlurView intensity={20} style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="chatbubble-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.addButtonGradient}>
            <Icon name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="notifications-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    height: 280,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  editButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: 16,
    color: '#E5E7EB',
    marginLeft: 6,
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#fff',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  infoContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoSubText: {
    fontSize: 14,
    color: '#64748B',
  },
  convidadosContainer: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  convidadoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    fontSize: 20,
  },
  convidadoInfo: {
    flex: 1,
  },
  convidadoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  convidadoStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
  },
  ingressoContainer: {
    padding: 20,
  },
  ticketCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ticketGradient: {
    padding: 24,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ticketTipo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  ticketPreco: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  ticketDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 20,
  },
  ticketDetails: {
    marginBottom: 24,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketDetailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  ticketDetailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrCodeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  descriptionContainer: {
    padding: 20,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#E2E8F0',
    marginBottom: 16,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginRight: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  navItem: {
    padding: 12,
  },
  addButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});