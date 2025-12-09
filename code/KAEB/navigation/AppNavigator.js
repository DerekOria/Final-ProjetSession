import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import PublicationScreen from '../screens/Publication/PublicationScreen';
import CommunauteScreen from '../screens/Outils/CommunauteScreen';
import FocusRoomScreen from '../screens/Outils/FocusRoomScreen';
import HabitTrackerScreen from '../screens/Outils/HabitTrackerScreen';
import LockInScreen from '../screens/Outils/LockInScreen';
import RechercheScreen from '../screens/Outils/RechercheScreen';
import CreatePostScreen from '../screens/Publication/CreatePostScreen'
import EditPostScreen from '../screens/Publication/EditPostScreen';
import RegisterScreen from '../screens/Login/RegisterScreen';
import AddHabitScreen from '../screens/Outils/AddHabitScreen';
import EditHabitScreen from '../screens/Outils/EditHabitScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    
    return(

    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Register" component={RegisterScreen}/>
        <Stack.Screen name="Profile" component={ProfileScreen}/>
        <Stack.Screen name="Publication" component={PublicationScreen}/>
        <Stack.Screen name="Recherche" component={RechercheScreen}/>
        <Stack.Screen name="Communaute" component={CommunauteScreen}/>
        <Stack.Screen name="FocusRoom" component={FocusRoomScreen}/>
        <Stack.Screen name="HabitTracker" component={HabitTrackerScreen}/>
        <Stack.Screen name="LockIn" component={LockInScreen}/>
        <Stack.Screen name="CreatePost" component={CreatePostScreen}/>
        <Stack.Screen name="EditPost" component={EditPostScreen}/>
        <Stack.Screen name="AddHabit" component={AddHabitScreen}/>
        <Stack.Screen name="EditHabit" component={EditHabitScreen}/>
        <Stack.Screen name="EditProfile" component={EditProfileScreen}/>
    </Stack.Navigator>

    );

}