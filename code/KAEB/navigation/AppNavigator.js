import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import PublicationScreen from '../screens/Publication/PublicationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    
    return(

    <Stack.Navigator initalRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Profile" component={ProfileScreen}/>
        <Stack.Screen name="Publication" component={PublicationScreen}/>
    </Stack.Navigator>

    );

}