import React, { useState } from "react";
import { View, Button, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

const ImageSelector = ({ onImageSelected }) => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      onImageSelected(uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      onImageSelected(uri);
    }
  };

  return (
    <View className="items-center gap-2 mt-4">
      <Button title="Selecionar da galeria" onPress={pickImage} />
      <Button title="Tirar uma foto" onPress={takePhoto} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 200, borderRadius: 10, marginTop: 10 }}
        />
      )}
    </View>
  );
};

export default ImageSelector;
