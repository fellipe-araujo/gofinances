import React from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { ThemeProvider } from 'styled-components';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import AppLoading from 'expo-app-loading';

import { AuthProvider, useAuth } from './src/hooks/auth';
import theme from './src/global/styles/theme';

import { Routes } from './src/routes';

import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const { userStorageIsLoading } = useAuth();

  if (!fontsLoaded || userStorageIsLoading) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ThemeProvider>
  );
}
