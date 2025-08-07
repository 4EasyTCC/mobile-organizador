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
import { Ionicons } from "@expo/vector-icons"; // ícone de seta

export default function Etapa1({ navigation }) {
  const [evento, setEvento] = useState({
    nome: "",
    descricao: "",
    tipo: "",
    privacidade: "Público",
    dataInicio: new Date(),
    dataFim: new Date(Date.now() + 3600000),
  });

  const tiposEvento = ["Festa", "Conferência", "Workshop", "Encontro", "Lançamento"];
  const opcoesPrivacidade = ["Público", "Privado"];

  const SelectInput = ({ title, value, options, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, color: "#1400b4", marginBottom: 8, fontWeight: "500" }}>
          {title}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#f0f0f0",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text style={{ fontSize: 16, color: value ? "#1400b4" : "#8E8E93" }}>
            {value || placeholder}
          </Text>
        </TouchableOpacity>

        {isOpen && (
          <View
            style={{
              backgroundColor: "#f0f0f0",
              borderRadius: 12,
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#ddd",
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
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#ddd",
                }}
              >
                <Text style={{ fontSize: 16, color: "#1400b4" }}>{option}</Text>
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
      return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    };

    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, color: "#1400b4", marginBottom: 8, fontWeight: "500" }}>
          {title}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#f0f0f0",
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              flex: 1,
              marginRight: 8,
            }}
            onPress={() => showMode("date")}
          >
            <Text style={{ fontSize: 16, color: "#1400b4", textAlign: "center" }}>
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#f0f0f0",
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              flex: 0.5,
            }}
            onPress={() => showMode("time")}
          >
            <Text style={{ fontSize: 16, color: "#1400b4", textAlign: "center" }}>
              Alterar Hora
            </Text>
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
    if (!evento.nome || !evento.descricao || !evento.tipo || !evento.privacidade) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await AsyncStorage.setItem("@evento", JSON.stringify(evento));
      navigation.navigate("Etapa2");  // Navega para Etapa2
    } catch (error) {
      console.error("Erro ao salvar dados da Etapa 1:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1400b4" }}>
      {/* Topo com seta e logo */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require("../imagens/branca.png")}
          style={{ width: 250, height: 100, resizeMode: "contain" }}
        />
      </View>

      {/* Conteúdo */}
      <ScrollView
        contentContainerStyle={{
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          padding: 24,
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1400b4", marginBottom: 24 }}>
          1. INFORMAÇÕES DO EVENTO
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, color: "#1400b4", marginBottom: 8, fontWeight: "500" }}>
            Nome do Evento
          </Text>
          <TextInput
            style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              fontSize: 16,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
            placeholder="Digite o nome do evento"
            placeholderTextColor="#999"
            value={evento.nome}
            onChangeText={(texto) => setEvento({ ...evento, nome: texto })}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, color: "#1400b4", marginBottom: 8, fontWeight: "500" }}>
            Descrição
          </Text>
          <TextInput
            style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              fontSize: 16,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              height: 100,
              textAlignVertical: "top",
            }}
            placeholder="Descreva seu evento..."
            placeholderTextColor="#999"
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
          onChangeDate={(novaData) => setEvento({ ...evento, dataInicio: novaData })}
        />

        <DateTimeInput
          title="Data e Hora de Término"
          date={evento.dataFim}
          onChangeDate={(novaData) => setEvento({ ...evento, dataFim: novaData })}
        />

        <TouchableOpacity
          style={{
            backgroundColor: "#1400b4",
            padding: 18,
            borderRadius: 14,
            marginTop: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={avancar}
        >
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "600" }}>
            Continuar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
