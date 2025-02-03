import * as React from 'react';
import { SplashScreen, Stack } from "expo-router"; // From expo-router
import "@/global.css"; // Global styles
import { useEffect } from "react";
import { useFonts } from "expo-font";

// Create the stack navigator for the traditional navigation
// const Stack = createNativeStackNavigator();

export default function RootLayout() {
  // Load custom fonts
  const [loaded, error] = useFonts({
    poppinsRegular: require("@/assets/fonts/Poppins/Poppins-Regular.ttf"),
    poppinsMedium: require("@/assets/fonts/Poppins/Poppins-Medium.ttf"),
    poppinsSemiBold: require("@/assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    poppinsBold: require("@/assets/fonts/Poppins/Poppins-Bold.ttf"),
    poppinsExtraBold: require("@/assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
    poppinsBlack: require("@/assets/fonts/Poppins/Poppins-Black.ttf"),
    poppinsExtraLight: require("@/assets/fonts/Poppins/Poppins-ExtraLight.ttf"),
    poppinsItalic: require("@/assets/fonts/Poppins/Poppins-Italic.ttf"),
    poppinsBoldItalic: require("@/assets/fonts/Poppins/Poppins-BoldItalic.ttf"),
  });

  // Hide the splash screen when fonts are loaded or if there's an error
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // If fonts are not loaded yet, render nothing
  if (!loaded && !error) {
    return null;
  }

  // Return the stack navigator wrapped in the NavigationContainer
  return (
    
      <Stack>
        <Stack.Screen name="/(app)/Home"  />
        <Stack.Screen name="/(app)/Signup" />
        <Stack.Screen name="/(app/Login"  />
        <Stack.Screen name="/(app)/AudioRecorder"  />
      </Stack>
    
  );
}
