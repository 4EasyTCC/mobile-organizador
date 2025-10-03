import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

// Definição do tema para consistência
const theme = {
  colors: {
    primary: "#6366F1", // Indigo
    primaryDark: "#4F46E5",
    secondary: "#8B5CF6", // Violet/Fuchsia-ish
    background: "#0F172A", // Dark Blue/Slate
    backgroundSecondary: "#1E293B", // Slightly lighter Dark Blue/Slate
    surface: "#334155", // Even lighter Slate
    white: "#FFFFFF",
    textPrimary: "#F1F5F9", // Off-white
    textSecondary: "#94A3B8", // Light Slate/Gray
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
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

export default function Etapa1({ navigation }) {
  const [evento, setEvento] = useState({
    nome: "",
    descricao: "",
    tipo: "",
    privacidade: "Público",
    dataInicio: new Date(),
    dataFim: new Date(Date.now() + 3600000),
  });

  const tiposEvento = [
    "Arte, Cultura e Lazer",
    "Congressos e Palestras",
    "Cursos e Workshops",
    "Esporte",
    "Festas e Shows",
    "Gastronomia",
    "Games e Geek",
    "Grátis",
    "Infantil",
    "Moda e Beleza",
    "Passeios e Tours",
    "Religião e Espiritualidade",
    "Saúde e Bem-Estar",
    "Teatros e Espetáculos",
  ];
  const opcoesPrivacidade = ["Público", "Privado"];

  // Componente SelectInput refatorado para o Dark Theme
  const SelectInput = ({ title, value, options, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{title}</Text>
        <TouchableOpacity
          style={[
            styles.selectField,
            { borderColor: isOpen ? theme.colors.primary : theme.colors.surface },
          ]}
          onPress={() => setIsOpen(!isOpen)}
        >
          <View style={styles.selectFieldContent}>
            <Text
              style={[
                styles.selectText,
                { color: value ? theme.colors.textPrimary : theme.colors.textSecondary },
              ]}
            >
              {value || placeholder}
            </Text>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.primary}
            />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.selectOptionsContainer}>
            <ScrollView style={{ maxHeight: 200 }}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  style={[
                    styles.selectOptionItem,
                    {
                      borderBottomWidth: index < options.length - 1 ? 1 : 0,
                      backgroundColor:
                        value === option
                          ? theme.colors.surface
                          : theme.colors.backgroundSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      {
                        fontWeight: value === option ? "600" : "400",
                        color:
                          value === option
                            ? theme.colors.primary
                            : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Componente DateTimeInput refatorado para o Dark Theme
  const DateTimeInput = ({ title, date, onChangeDate }) => {
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
        month: "short",
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
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{title}</Text>
        <View style={styles.dateTimeRow}>
          {/* Botão de Data */}
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => showMode("date")}
          >
            <View style={styles.dateTimeButtonContent}>
              <View>
                <Text style={styles.dateTimeLabel}>Data</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDate(date)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Botão de Hora */}
          <TouchableOpacity
            style={[styles.dateTimeButton, styles.timeButton]}
            onPress={() => showMode("time")}
          >
            <View style={styles.dateTimeButtonContent}>
              <View>
                <Text style={styles.dateTimeLabel}>Hora</Text>
                <Text style={styles.dateTimeValue}>
                  {formatTime(date)}
                </Text>
              </View>
              <Ionicons name="time-outline" size={22} color={theme.colors.primary} />
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
      </View>
    );
  };

  const avancar = async () => {
    if (
      !evento.nome ||
      !evento.descricao ||
      !evento.tipo ||
      !evento.privacidade
    ) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
      return;
    }
    
    if (evento.dataInicio >= evento.dataFim) {
        Alert.alert("Atenção", "A Data/Hora de Início deve ser anterior à Data/Hora de Término.");
        return;
    }

    // --- CORREÇÃO DE DATA APLICADA AQUI ---
  if (evento.dataInicio >= evento.dataFim) {
    Alert.alert("Atenção", "A Data/Hora de Início deve ser anterior à Data/Hora de Término.");
    return;
  }

  // CORREÇÃO: Converter objetos Date para string ISO 8601
  const dadosParaSalvar = {
    ...evento,
    dataInicio: evento.dataInicio.toISOString(),
    dataFim: evento.dataFim.toISOString(), // Garante a conversão
  };

  try {
    await AsyncStorage.setItem("@evento", JSON.stringify(dadosParaSalvar));
    navigation.navigate("Etapa2");
  } catch (error) {
      console.error("Erro ao salvar dados da Etapa 1:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Image
          source={require("../imagens/branca.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Etapa Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>ETAPA 1 DE 5</Text>
        </View>

        <Text style={styles.title}>Informações do Evento</Text>
        <Text style={styles.subtitle}>
          Preencha os detalhes básicos para começar a criar seu evento
        </Text>

        {/* Nome do Evento */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nome do Evento</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Festival de Música 2025"
            placeholderTextColor={theme.colors.textSecondary}
            value={evento.nome}
            onChangeText={(texto) => setEvento({ ...evento, nome: texto })}
          />
        </View>

        {/* Descrição */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Descrição</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Conte aos participantes sobre seu evento..."
            placeholderTextColor={theme.colors.textSecondary}
            value={evento.descricao}
            onChangeText={(texto) => setEvento({ ...evento, descricao: texto })}
            multiline
          />
        </View>

        {/* Tipo do Evento */}
        <SelectInput
          title="Tipo do Evento"
          value={evento.tipo}
          options={tiposEvento}
          onSelect={(opcao) => setEvento({ ...evento, tipo: opcao })}
          placeholder="Selecione o tipo"
        />

        {/* Privacidade */}
        <SelectInput
          title="Privacidade do Evento"
          value={evento.privacidade}
          options={opcoesPrivacidade}
          onSelect={(opcao) => setEvento({ ...evento, privacidade: opcao })}
          placeholder="Selecione"
        />

        {/* Data/Hora de Início */}
        <DateTimeInput
          title="Data e Hora de Início"
          date={evento.dataInicio}
          onChangeDate={(novaData) =>
            setEvento({ ...evento, dataInicio: novaData })
          }
        />

        {/* Data/Hora de Término */}
        <DateTimeInput
          title="Data e Hora de Término"
          date={evento.dataFim}
          onChangeDate={(novaData) =>
            setEvento({ ...evento, dataFim: novaData })
          }
        />

        {/* Botão Avançar */}
        <TouchableOpacity style={styles.continueButton} onPress={avancar}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <Feather name="arrow-right" size={20} color={theme.colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  backButton: {
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  logo: {
    width: 150,
    height: 50,
  },
  scrollContent: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    paddingBottom: 80, // Espaço extra para o botão de continuar
    flexGrow: 1,
  },
  badgeContainer: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.white,
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  textInput: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textPrimary,
    fontSize: 16,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    // Sombra sutil para dark mode
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  // SelectInput Styles
  selectField: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectFieldContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectOptionsContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    overflow: "hidden",
    elevation: 5,
  },
  selectOptionItem: {
    padding: theme.spacing.md,
    borderBottomColor: theme.colors.surface,
  },
  selectOptionText: {
    fontSize: 16,
  },
  // DateTimeInput Styles
  dateTimeRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  dateTimeButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateTimeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTimeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  timeButton: {
    width: 130, // Largura fixa para o botão de hora
    flex: 0,
  },
  // Continue Button
  continueButton: {
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.xl,
    overflow: "hidden",
    // Sombra para o botão gradiente
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  continueButtonGradient: {
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginRight: theme.spacing.sm,
  },
});
