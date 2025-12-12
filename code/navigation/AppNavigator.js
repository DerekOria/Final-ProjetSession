import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import PostScreen from '../screens/Post/PostScreen';
import HabitTrackerScreen from '../screens/Habits/HabitTrackerScreen';
import LockInScreen from '../screens/Focus/LockInScreen';
import CreatePostScreen from '../screens/Post/CreatePostScreen'
import EditPostScreen from '../screens/Post/EditPostScreen';
import RegisterScreen from '../screens/Login/RegisterScreen';
import AddHabitScreen from '../screens/Habits/AddHabitScreen';
import EditHabitScreen from '../screens/Habits/EditHabitScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ViewProfileScreen from '../screens/Profile/ViewProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    
    return(

    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ animation: 'none' }}/>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Register" component={RegisterScreen}/>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'none' }}/>
        <Stack.Screen name="Post" component={PostScreen}/>
        <Stack.Screen name="HabitTracker" component={HabitTrackerScreen} options={{ animation: 'none' }}/>
        <Stack.Screen name="LockIn" component={LockInScreen} options={{ animation: 'none' }}/>
        <Stack.Screen name="CreatePost" component={CreatePostScreen}/>
        <Stack.Screen name="EditPost" component={EditPostScreen}/>
        <Stack.Screen name="AddHabit" component={AddHabitScreen}/>
        <Stack.Screen name="EditHabit" component={EditHabitScreen}/>
        <Stack.Screen name="EditProfile" component={EditProfileScreen}/>
        <Stack.Screen name="ViewProfile" component={ViewProfileScreen}/>
    </Stack.Navigator>

    );

}