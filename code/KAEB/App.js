import AppNavigator from './navigation/AppNavigator'
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './config/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        < AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
