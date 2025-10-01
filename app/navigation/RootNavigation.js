import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "../screens/Login";
import Home from "../screens/Home";
import Etapa1 from "../screens/Etapa1";
import Etapa2 from "../screens/Etapa2";
import ImageSelector from "../screens/ImageSelector";
import Chat from "../screens/Chat";
import Etapa3 from "../screens/Etapa3";
import Etapa4 from "../screens/Etapa4";
import Etapa5 from "../screens/Etapa5";
import EventDetails from "../screens/EventDetails";
import Perfil from "../screens/Perfil";
import GruposScreen from "../screens/GruposScreen";
const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Etapa5"
      >
        <Stack.Screen name="Login" component={Login}></Stack.Screen>
        <Stack.Screen name="EventDetails" component={EventDetails} />
        <Stack.Screen name="Home" component={Home}></Stack.Screen>
        <Stack.Screen name="Etapa1" component={Etapa1}></Stack.Screen>
        <Stack.Screen name="Perfil" component={Perfil}></Stack.Screen>
        <Stack.Screen name="Etapa2" component={Etapa2}></Stack.Screen>
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{
            headerShown: true,
            title: "Chat",
            headerStyle: {
              backgroundColor: "#6A5ACD",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="ImageSelector"
          component={ImageSelector}
        ></Stack.Screen>
        <Stack.Screen name="Etapa3" component={Etapa3}></Stack.Screen>
        <Stack.Screen name="Etapa4" component={Etapa4}></Stack.Screen>
        <Stack.Screen name="Etapa5" component={Etapa5}></Stack.Screen>
        <Stack.Screen
          name="GruposScreen"
          component={GruposScreen}
        ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
