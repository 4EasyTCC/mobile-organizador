import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function EventDetails({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('Informações'); // Estado para controlar a aba selecionada

  // Dados fictícios de convidados
  const convidados = [
    { id: '1', nome: 'João Silva', convite: 'Confirmado' },
    { id: '2', nome: 'Maria Oliveira', convite: 'Pendente' },
    { id: '3', nome: 'Carlos Souza', convite: 'Confirmado' },
  ];

  // Dados fictícios do ingresso
  const ingresso = {
    tipo: 'VIP',
    preco: 'R$ 150,00',
    validade: 'Até 01/07/2025',
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Informações':
        return (
          <View style={styles.info}>
            <View style={styles.row}>
              <Icon name="location-outline" size={18} color="#fff" />
              <Text style={styles.infoText}>rua xxxx xxxxx, 00 - Bairro</Text>
            </View>
            <View style={styles.row}>
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.infoText}>23/07/2022</Text>
            </View>
            <View style={styles.row}>
              <Icon name="time-outline" size={18} color="#fff" />
              <Text style={styles.infoText}>13:00-14:00</Text>
            </View>
          </View>
        );
      case 'Convidados':
        return (
          <View style={styles.convidadosContainer}>
            <FlatList
              data={convidados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.convidadoCard}>
                  <Text style={styles.convidadoNome}>{item.nome}</Text>
                  <Text style={styles.convidadoStatus}>Status: {item.convite}</Text>
                </View>
              )}
            />
          </View>
        );
      case 'Ingresso':
        return (
          <View style={styles.ingressoContainer}>
            <Text style={styles.ingressoTitulo}>Ingresso {ingresso.tipo}</Text>
            <Text style={styles.ingressoPreco}>Preço: {ingresso.preco}</Text>
            <Text style={styles.ingressoValidade}>Validade: {ingresso.validade}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerImage}>
        <Image source={require('../imagens/evento.jpg')} style={styles.image} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn}>
          <Icon name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Grande evento</Text>
        <Text style={styles.city}>SÃO PAULO, SP</Text>
      </View>

      {/* Abas */}
      <View style={styles.tabs}>
        {['Informações', 'Convidados', 'Ingresso'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)} // Atualiza a aba selecionada
          >
            <Text style={selectedTab === tab ? styles.tabActiveText : styles.tabText}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo das abas */}
      {renderTabContent()}

      <Text style={styles.descTitle}>Descrição</Text>
      <Text style={styles.desc}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tempor velit et lacus iaculis. Praesent malesuada mi in nunc iaculis, sed sodales risus tincidunt...
      </Text>

      <View style={styles.navbar}>
        <Icon name="home-outline" size={24} color="#fff" />
        <Icon name="chatbubble-outline" size={24} color="#fff" />
        <View style={styles.plusButton}>
          <Icon name="add" size={28} color="#fff" />
        </View>
        <Icon name="notifications-outline" size={24} color="#fff" />
        <Icon name="person-outline" size={24} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0032', paddingBottom: 80 },
  headerImage: { position: 'relative' },
  image: { width: '100%', height: 180, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  backBtn: { position: 'absolute', top: 15, left: 15 },
  editBtn: { position: 'absolute', top: 15, right: 15 },
  title: {
    position: 'absolute',
    bottom: 35,
    left: 20,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  city: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    color: '#aaa',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#0c0032',
  },
  tab: { color: '#aaa', paddingBottom: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#fff' },
  tabText: { color: '#aaa' },
  tabActiveText: { color: '#fff', fontWeight: 'bold' },
  info: { paddingHorizontal: 20, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { color: '#fff', marginLeft: 8 },
  descTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 20, marginLeft: 20 },
  desc: { color: '#ccc', marginHorizontal: 20, marginTop: 6 },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  plusButton: {
    backgroundColor: '#1400b4',
    borderRadius: 25,
    padding: 10,
  },
  convidadosContainer: { paddingHorizontal: 20, marginTop: 10 },
  convidadoCard: { backgroundColor: '#1e1e1e', marginBottom: 10, padding: 15, borderRadius: 10 },
  convidadoNome: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  convidadoStatus: { color: '#aaa', fontSize: 14 },
  ingressoContainer: { paddingHorizontal: 20, marginTop: 10 },
  ingressoTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  ingressoPreco: { color: '#fff', fontSize: 16, marginTop: 10 },
  ingressoValidade: { color: '#aaa', fontSize: 14, marginTop: 5 },
});
