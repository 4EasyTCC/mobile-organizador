import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

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
    "Festa",
    "Conferência",
    "Workshop",
    "Encontro",
    "Lançamento",
  ];
  const opcoesPrivacidade = ["Público", "Privado"];

  const SelectInput = ({ title, value, options, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 15,
            color: "#1a1a2e",
            marginBottom: 10,
            fontWeight: "600",
            letterSpacing: 0.3,
          }}
        >
          {title}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#ffffff",
            padding: 18,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: isOpen ? "#1400b4" : "#e8e8f0",
            shadowColor: "#1400b4",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
          onPress={() => setIsOpen(!isOpen)}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: value ? "#1400b4" : "#a0a0b8", fontWeight: value ? "500" : "400" }}>
              {value || placeholder}
            </Text>
            <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#1400b4" />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              marginTop: 8,
              borderWidth: 2,
              borderColor: "#e8e8f0",
              overflow: "hidden",
              shadowColor: "#1400b4",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                style={{
                  padding: 18,
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: "#f0f0f5",
                  backgroundColor: value === option ? "#f0edff" : "#ffffff",
                }}
              >
                <Text style={{ fontSize: 16, color: "#1400b4", fontWeight: value === option ? "600" : "400" }}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

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
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 15,
            color: "#1a1a2e",
            marginBottom: 10,
            fontWeight: "600",
            letterSpacing: 0.3,
          }}
        >
          {title}
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#ffffff",
              padding: 18,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "#e8e8f0",
              flex: 1,
              shadowColor: "#1400b4",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
            onPress={() => showMode("date")}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 12, color: "#7575a3", marginBottom: 4 }}>Data</Text>
                <Text style={{ fontSize: 15, color: "#1400b4", fontWeight: "600" }}>
                  {formatDate(date)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={22} color="#1400b4" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: "#ffffff",
              padding: 18,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "#e8e8f0",
              width: 120,
              shadowColor: "#1400b4",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
            onPress={() => showMode("time")}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 12, color: "#7575a3", marginBottom: 4 }}>Hora</Text>
                <Text style={{ fontSize: 15, color: "#1400b4", fontWeight: "600" }}>
                  {formatTime(date)}
                </Text>
              </View>
              <Ionicons name="time-outline" size={22} color="#1400b4" />
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

    try {
      await AsyncStorage.setItem("@evento", JSON.stringify(evento));
      navigation.navigate("Etapa2");
    } catch (error) {
      console.error("Erro ao salvar dados da Etapa 1:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1400b4" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 60,
          paddingBottom: 20,
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ 
            marginRight: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            padding: 10,
            borderRadius: 12,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require("../imagens/branca.png")}
          style={{ width: 250, height: 100, resizeMode: "contain" }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          backgroundColor: "#f8f9fd",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          padding: 24,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ 
          backgroundColor: "#1400b4",
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 20,
          marginBottom: 28,
          alignSelf: "flex-start",
        }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: 1,
            }}
          >
            ETAPA 1 DE 5
          </Text>
        </View>

        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: "#1a1a2e",
            marginBottom: 8,
          }}
        >
          Informações do Evento
        </Text>
        
        <Text
          style={{
            fontSize: 15,
            color: "#7575a3",
            marginBottom: 32,
            lineHeight: 22,
          }}
        >
          Preencha os detalhes básicos para começar a criar seu evento
        </Text>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 15,
              color: "#1a1a2e",
              marginBottom: 10,
              fontWeight: "600",
              letterSpacing: 0.3,
            }}
          >
            Nome do Evento
          </Text>
          <TextInput
            style={{
              backgroundColor: "#ffffff",
              color: "#1a1a2e",
              fontSize: 16,
              padding: 18,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "#e8e8f0",
              shadowColor: "#1400b4",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
            placeholder="Ex: Festival de Música 2025"
            placeholderTextColor="#a0a0b8"
            value={evento.nome}
            onChangeText={(texto) => setEvento({ ...evento, nome: texto })}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 15,
              color: "#1a1a2e",
              marginBottom: 10,
              fontWeight: "600",
              letterSpacing: 0.3,
            }}
          >
            Descrição
          </Text>
          <TextInput
            style={{
              backgroundColor: "#ffffff",
              color: "#1a1a2e",
              fontSize: 16,
              padding: 18,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "#e8e8f0",
              height: 120,
              textAlignVertical: "top",
              shadowColor: "#1400b4",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
            placeholder="Conte aos participantes sobre seu evento..."
            placeholderTextColor="#a0a0b8"
            value={evento.descricao}
            onChangeText={(texto) => setEvento({ ...evento, descricao: texto })}
            multiline
          />
        </View>

        <SelectInput
          title="Tipo do Evento"
          value={evento.tipo}
          options={tiposEvento}
          onSelect={(opcao) => setEvento({ ...evento, tipo: opcao })}
          placeholder="Selecione o tipo"
        />

        <SelectInput
          title="Privacidade do Evento"
          value={evento.privacidade}
          options={opcoesPrivacidade}
          onSelect={(opcao) => setEvento({ ...evento, privacidade: opcao })}
          placeholder="Selecione"
        />

        <DateTimeInput
          title="Data e Hora de Início"
          date={evento.dataInicio}
          onChangeDate={(novaData) =>
            setEvento({ ...evento, dataInicio: novaData })
          }
        />

        <DateTimeInput
          title="Data e Hora de Término"
          date={evento.dataFim}
          onChangeDate={(novaData) =>
            setEvento({ ...evento, dataFim: novaData })
          }
        />

        <TouchableOpacity
          style={{
            backgroundColor: "#1400b4",
            padding: 20,
            borderRadius: 18,
            marginTop: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            shadowColor: "#1400b4",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
          onPress={avancar}
        >
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginRight: 8 }}>
            Continuar
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}