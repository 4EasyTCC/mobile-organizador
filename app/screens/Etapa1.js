import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get('window');

export default function Etapa1({ navigation }) {
  const [evento, setEvento] = useState({
    nome: "",
    descricao: "",
    tipo: "",
    privacidade: "Público",
    dataInicio: new Date(),
    dataFim: new Date(Date.now() + 3600000),
  });

  const [focusedField, setFocusedField] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const tiposEvento = [
    { label: "🎉 Festa", value: "Festa", icon: "🎉" },
    { label: "📊 Conferência", value: "Conferência", icon: "📊" },
    { label: "🛠️ Workshop", value: "Workshop", icon: "🛠️" },
    { label: "👥 Encontro", value: "Encontro", icon: "👥" },
    { label: "🚀 Lançamento", value: "Lançamento", icon: "🚀" },
  ];
  
  const opcoesPrivacidade = [
    { label: "🌍 Público", value: "Público", icon: "globe-outline", desc: "Visível para todos" },
    { label: "🔒 Privado", value: "Privado", icon: "lock-closed-outline", desc: "Apenas convidados" },
  ];

  const ModernInput = ({ title, value, onChangeText, placeholder, multiline = false, icon }) => (
    <Animated.View 
      style={{ 
        marginBottom: 24, 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }] 
      }}
    >
      <View style={styles.inputHeader}>
        {icon && <Ionicons name={icon} size={20} color="#6366F1" />}
        <Text style={styles.inputLabel}>{title}</Text>
      </View>
      <View style={[
        styles.inputContainer,
        focusedField === title && styles.inputFocused,
      ]}>
        <TextInput
          style={[
            styles.textInput,
            multiline && { height: 100, textAlignVertical: "top" }
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          onFocus={() => setFocusedField(title)}
          onBlur={() => setFocusedField("")}
        />
      </View>
    </Animated.View>
  );

  const SelectInput = ({ title, value, options, onSelect, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <Animated.View 
        style={{ 
          marginBottom: 24,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }}
      >
        <View style={styles.inputHeader}>
          {icon && <Ionicons name={icon} size={20} color="#6366F1" />}
          <Text style={styles.inputLabel}>{title}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.selectButton,
            isOpen && styles.selectButtonOpen,
          ]}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text style={[
            styles.selectText,
            value && styles.selectTextSelected
          ]}>
            {value || placeholder}
          </Text>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6366F1" 
          />
        </TouchableOpacity>

        {isOpen && (
          <Animated.View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onSelect(option.value || option);
                  setIsOpen(false);
                }}
                style={[
                  styles.optionItem,
                  index === options.length - 1 && styles.optionItemLast
                ]}
              >
                <View style={styles.optionContent}>
                  {option.icon && (
                    <View style={styles.optionIconContainer}>
                      <Ionicons name={option.icon} size={20} color="#6366F1" />
                    </View>
                  )}
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionText}>
                      {option.label || option}
                    </Text>
                    {option.desc && (
                      <Text style={styles.optionDesc}>{option.desc}</Text>
                    )}
                  </View>
                </View>
                {(value === (option.value || option)) && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const DateTimeInput = ({ title, date, onChangeDate, icon }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [mode, setMode] = useState("date");

    const showMode = (currentMode) => {
      setShowPicker(true);
      setMode(currentMode);
    };

    const onChange = (event, selectedDate) => {
      setShowPicker(false);
      if (selectedDate) {
        onChangeDate(selectedDate);
      }
    };

    const formatDate = (date) => {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    const formatTime = (date) => {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <Animated.View 
        style={{ 
          marginBottom: 24,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }}
      >
        <View style={styles.inputHeader}>
          {icon && <Ionicons name={icon} size={20} color="#6366F1" />}
          <Text style={styles.inputLabel}>{title}</Text>
        </View>
        
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={[styles.dateTimeButton, { flex: 2 }]}
            onPress={() => showMode("date")}
          >
            <View style={styles.dateTimeContent}>
              <Ionicons name="calendar-outline" size={20} color="#6366F1" />
              <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dateTimeButton, { flex: 1, marginLeft: 12 }]}
            onPress={() => showMode("time")}
          >
            <View style={styles.dateTimeContent}>
              <Ionicons name="time-outline" size={20} color="#6366F1" />
              <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {showPicker && (
          <DateTimePicker
            value={date}
            mode={mode}
            display="default"
            onChange={onChange}
          />
        )}
      </Animated.View>
    );
  };

  const avancar = async () => {
    if (!evento.nome || !evento.descricao || !evento.tipo || !evento.privacidade) {
      Alert.alert("⚠️ Atenção", "Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await AsyncStorage.setItem("@evento", JSON.stringify(evento));
      
      // Simula um pequeno delay para mostrar o loading
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate("Etapa2");
      }, 800);
    } catch (error) {
      console.error("Erro ao salvar dados da Etapa 1:", error);
      setIsLoading(false);
      Alert.alert("❌ Erro", "Não foi possível salvar os dados");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Image
              source={require("../imagens/branca.png")}
              style={styles.logo}
            />
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '33%' }]} />
              </View>
              <Text style={styles.progressText}>Etapa 1 de 3</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Conteúdo principal */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>✨ Informações do Evento</Text>
            <Text style={styles.subtitle}>
              Vamos começar criando um evento incrível! Preencha as informações básicas.
            </Text>
          </View>

          <ModernInput
            title="Nome do Evento"
            value={evento.nome}
            onChangeText={(texto) => setEvento({ ...evento, nome: texto })}
            placeholder="Ex: Festa de Aniversário, Conferência Tech..."
            icon="text-outline"
          />

          <ModernInput
            title="Descrição"
            value={evento.descricao}
            onChangeText={(texto) => setEvento({ ...evento, descricao: texto })}
            placeholder="Descreva seu evento, o que os participantes podem esperar..."
            multiline={true}
            icon="document-text-outline"
          />

          <SelectInput
            title="Tipo do Evento"
            value={evento.tipo}
            options={tiposEvento}
            onSelect={(opcao) => setEvento({ ...evento, tipo: opcao })}
            placeholder="Selecione o tipo do seu evento"
            icon="grid-outline"
          />

          <SelectInput
            title="Privacidade"
            value={evento.privacidade}
            options={opcoesPrivacidade}
            onSelect={(opcao) => setEvento({ ...evento, privacidade: opcao })}
            placeholder="Quem pode ver este evento?"
            icon="shield-outline"
          />

          <DateTimeInput
            title="Data e Hora de Início"
            date={evento.dataInicio}
            onChangeDate={(novaData) => setEvento({ ...evento, dataInicio: novaData })}
            icon="play-outline"
          />

          <DateTimeInput
            title="Data e Hora de Término"
            date={evento.dataFim}
            onChangeDate={(novaData) => setEvento({ ...evento, dataFim: novaData })}
            icon="stop-outline"
          />

          <TouchableOpacity
            style={[styles.continueButton, isLoading && styles.continueButtonLoading]}
            onPress={avancar}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#6366F1', '#8B5CF6']}
              style={styles.continueButtonGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={styles.loadingSpinner}>
                    <Ionicons name="sync" size={20} color="#fff" />
                  </Animated.View>
                  <Text style={styles.continueButtonText}>Salvando...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.continueButtonText}>Continuar</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  logo: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    marginTop: -20,
    minHeight: height * 0.8,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  inputFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#fff',
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    padding: 16,
  },
  selectButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonOpen: {
    borderColor: '#6366F1',
    backgroundColor: '#fff',
  },
  selectText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  selectTextSelected: {
    color: '#1F2937',
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  optionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  dateTimeContainer: {
    flexDirection: 'row',
  },
  dateTimeButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  continueButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonLoading: {
    opacity: 0.8,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
};