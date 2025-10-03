import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  StatusBar,
} from "react-native";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function Etapa4({ navigation }) {
  const [ingressos, setIngressos] = useState([]);
  const [novoIngresso, setNovoIngresso] = useState({
    nome: "",
    descricao: "",
    preco: "",
    quantidade: "",
    // dataLimite: new Date(), // Desabilitado para simplificar o input nesta refatoração
  });
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Carregar ingressos salvos se o usuário voltar
    carregarIngressosSalvos();
  }, [fadeAnim]);

  const carregarIngressosSalvos = async () => {
    try {
        const dadosEventoString = await AsyncStorage.getItem("@evento");
        if (dadosEventoString) {
            const dadosEvento = JSON.parse(dadosEventoString);
            if (dadosEvento.ingressos) {
                setIngressos(dadosEvento.ingressos);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar ingressos salvos:", error);
    }
  }

  const adicionarIngresso = () => {
    if (!novoIngresso.nome || !novoIngresso.preco || !novoIngresso.quantidade) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios (Nome, Preço e Quantidade).");
      return;
    }

    const preco = parseFloat(novoIngresso.preco.replace(",", "."));
    const quantidade = parseInt(novoIngresso.quantidade);

    if (isNaN(preco) || preco < 0) {
        Alert.alert("Atenção", "Preço inválido.");
        return;
    }
    if (isNaN(quantidade) || quantidade <= 0) {
        Alert.alert("Atenção", "Quantidade deve ser um número inteiro positivo.");
        return;
    }


    setIngressos((prevIngressos) => [
      ...prevIngressos,
      {
        ...novoIngresso,
        preco: preco,
        quantidade: quantidade,
        dataLimiteVenda: null, // Placeholder
      },
    ]);

    setNovoIngresso({
      nome: "",
      descricao: "",
      preco: "",
      quantidade: "",
      // dataLimite: new Date(),
    });
  };

  const removerIngresso = (index) => {
    const novosIngressos = [...ingressos];
    novosIngressos.splice(index, 1);
    setIngressos(novosIngressos);
  };

  const avancar = async () => {
    if (ingressos.length === 0) {
        Alert.alert("Atenção", "Adicione pelo menos um tipo de ingresso para continuar.");
        return;
    }
    
    const dadosEventoString = await AsyncStorage.getItem("@evento");
    const dadosEvento = dadosEventoString ? JSON.parse(dadosEventoString) : {};

    const dadosAtualizados = {
      ...dadosEvento,
      ingressos: ingressos,
    };

    try {
        await AsyncStorage.setItem("@evento", JSON.stringify(dadosAtualizados));
        navigation.navigate("Etapa5");
    } catch (error) {
        console.error("Erro ao salvar ingressos:", error);
        Alert.alert("Erro", "Não foi possível salvar os dados dos ingressos.");
    }
  };

  const renderIngressoCard = ({ item, index }) => (
    <View style={styles.ingressoCard}>
      <View style={styles.ingressoLeft}>
        <View style={styles.ingressoIconContainer}>
          <MaterialIcons
            name="confirmation-number"
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.ingressoInfo}>
          <Text style={styles.ingressoNome}>{item.nome}</Text>
          {item.descricao ? (
            <Text style={styles.ingressoDescricao} numberOfLines={1}>
              {item.descricao}
            </Text>
          ) : (
             <Text style={styles.ingressoDescricao}>Sem descrição</Text>
          )}

          <View style={styles.ingressoFooter}>
            <View style={styles.priceTag}>
              <Text style={styles.ingressoPreco}>
                R$ {item.preco?.toFixed(2).replace(".", ",")}
              </Text>
            </View>
            <View style={styles.quantityTag}>
              <Feather name="users" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.ingressoQuantidade}>
                {item.quantidade}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removerIngresso(index)}
        style={styles.deleteButton}
      >
        <Feather name="trash-2" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

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
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "80%" }]} />
          </View>
          <Text style={styles.progressText}>Etapa 4 de 5</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.titulo}>Ingressos do Evento</Text>
            <Text style={styles.subtituloHeader}>
              Configure os tipos de ingressos e suas quantidades.
            </Text>

          {/* NOVO INGRESSO FORM */}
          <View style={styles.novoIngressoContainer}>
            <View style={styles.cardHeader}>
              <Feather name="plus-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.cardTitulo}>Novo Ingresso</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome do ingresso*"
              placeholderTextColor={theme.colors.textSecondary}
              value={novoIngresso.nome}
              onChangeText={(text) =>
                setNovoIngresso({ ...novoIngresso, nome: text })
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição (opcional)"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
              value={novoIngresso.descricao}
              onChangeText={(text) =>
                setNovoIngresso({ ...novoIngresso, descricao: text })
              }
            />

            <View style={styles.row}>
              {/* Preço */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Preço (R$)*</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="0,00"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    value={novoIngresso.preco}
                    onChangeText={(text) =>
                      setNovoIngresso({ ...novoIngresso, preco: text.replace(",", ".") })
                    }
                  />
                </View>
              </View>

              {/* Quantidade */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Quantidade*</Text>
                <View style={styles.inputGroup}>
                  <Feather name="hash" size={18} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="100"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    value={novoIngresso.quantidade}
                    onChangeText={(text) =>
                      setNovoIngresso({ ...novoIngresso, quantidade: text.replace(/[^0-9]/g, '') })
                    }
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botaoAdicionar}
              onPress={adicionarIngresso}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Feather name="check-circle" size={20} color="white" />
                <Text style={styles.botaoAdicionarTexto}>Adicionar Ingresso</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* LISTA DE INGRESSOS */}
          {ingressos.length > 0 && (
            <View style={styles.listaContainer}>
              <View style={styles.listaHeader}>
                <Feather name="check-square" size={24} color={theme.colors.primary} />
                <Text style={styles.listaTitulo}>
                  Ingressos Configurados
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{ingressos.length}</Text>
                </View>
              </View>

              <FlatList
                data={ingressos}
                scrollEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderIngressoCard}
              />
            </View>
          )}

          {/* BOTÃO DE AVANÇAR */}
          <TouchableOpacity
            style={styles.botaoAvancar}
            onPress={avancar}
            disabled={ingressos.length === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                ingressos.length === 0
                  ? [theme.colors.surface, theme.colors.surface]
                  : [theme.colors.primary, theme.colors.secondary]
              }
              style={styles.gradientButtonAvancar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.botaoAvancarTexto}>Continuar</Text>
              <MaterialIcons name="arrow-forward" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },

  // --- CONTENT STYLE ---
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
    backgroundColor: theme.colors.background,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: "left",
  },
  subtituloHeader: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: "left",
  },
  novoIngressoContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    fontSize: 15, 
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  textArea: {
    height: 50, // Menor
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  inputWrapper: {
    width: "48%",
  },
  inputLabel: {
    fontSize: 13, // Ligeiramente menor
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  inputSmall: {
    flex: 1,
    paddingVertical: theme.spacing.sm, // Padding vertical menor
    paddingHorizontal: theme.spacing.xs,
    fontSize: 15,
    color: theme.colors.textPrimary,
    height: 48, // Altura fixa menor
  },
  botaoAdicionar: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginTop: theme.spacing.sm,
    elevation: 4,
  },
  gradientButton: {
    flexDirection: "row",
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  botaoAdicionarTexto: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 15, // Ligeiramente menor
  },
  // --- LISTA DE INGRESSOS ---
  listaContainer: {
    marginBottom: theme.spacing.xl,
  },
  listaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  listaTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  ingressoCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  ingressoLeft: {
    flexDirection: "row",
    flex: 1,
  },
  ingressoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  ingressoInfo: {
    flex: 1,
  },
  ingressoNome: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs / 2,
  },
  ingressoDescricao: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  ingressoFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  priceTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  ingressoPreco: {
    fontWeight: "700",
    color: theme.colors.primary,
    fontSize: 15,
  },
  quantityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  ingressoQuantidade: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
    fontSize: 14,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.spacing.md,
  },
  // --- AVANÇAR BUTTON ---
  botaoAvancar: {
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    elevation: 10,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  gradientButtonAvancar: {
    flexDirection: "row",
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  botaoAvancarTexto: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 18,
  },
});
