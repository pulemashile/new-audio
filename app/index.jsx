import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg'; // Importing SvgXml from react-native-svg

// SVG Icons
const emailIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
`;

const lockIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M12 16.5V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4.2678 18.8447C4.49268 20.515 5.87612 21.8235 7.55965 21.9009C8.97626 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.8789 17.7547 20 16.6376 20 15.5C20 14.3624 19.8789 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97626 9.03397 7.55965 9.09909C5.87612 9.17649 4.49268 10.485 4.2678 12.1553C4.12104 13.2453 3.99999 14.3624 3.99999 15.5C3.99999 16.6376 4.12104 17.7547 4.2678 18.8447Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const validateEmail = (email) => {
    // Validate email format
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleLogin = () => {
    // Reset errors
    setEmailError(null);
    setPasswordError(null);

    // Basic validation for email and password
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    // If validation passes, route to the app screen
    router.push('/AudioRecorder');
  };

  return (
    <SafeAreaView className="flex-1 justify-between px-5 py-10 bg-gray-50">
      <Text className="text-3xl font-bold text-center text-black mb-4" style={styles.poppinsRegular}>
        Sign in
      </Text>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View>
          <Text className="text-sm text-center text-gray-600 mb-8" style={styles.poppinsRegular}>
            Sign in to your account to get access to various features of our recording app
          </Text>

          <View className="space-y-5">
            {/* Email Input */}
            <View className="relative">
              <TextInput
                style={styles.poppinsRegular}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                className="block rounded-sm w-full px-10 py-4 text-gray-400 bg-white border border-gray-400 shadow-"
              />
              <SvgXml xml={emailIcon} width={24} height={24} fill="none" style={{ position: 'absolute', left: 12, color: '#06bee1', top: '49%', transform: [{ translateY: -12 }] }} />
            </View>
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            {/* Password Input */}
            <View className="relative">
              <TextInput
                style={styles.poppinsRegular}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="block rounded-sm w-full shadow-sm px-10 py-4 text-gray-400 bg-white border border-gray-400"
              />
              <SvgXml xml={lockIcon} width={24} height={24} fill="none" style={{ position: 'absolute', color: '#06bee1', left: 12, top: '45%', transform: [{ translateY: -12 }] }} />
            </View>
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            {/* Login Button */}
            <Pressable
              className="bg-[#06bee1] rounded-sm h-[3rem] w-full pt-2 mt-10 align-self-center"
              onPress={handleLogin}
            >
              <Text className="text-white text-center text-lg font-semibold" style={styles.poppinsRegular}>
                Login
              </Text>
            </Pressable>

            {/* Social Login */}
            <View className="flex-row items-center justify-center mt-8 mb-4">
              <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#ccc' }} />
              <Text className="mx-4 text-sm text-gray-600" style={styles.poppinsRegular}>
                Login with
              </Text>
              <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#ccc' }} />
            </View>

            <View className="flex-row justify-between space-x-4">
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  paddingVertical: 12,
                  borderRadius: 999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  borderBlockColor: '#ccc',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                }}
              >
                <Image
                  source={require('@/assets/images/facebook.png')}
                  style={{ width: 22, height: 20 }}
                />
                <Text className="text-gray-600 text-center" style={styles.poppinsRegular}>
                  Facebook
                </Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  paddingVertical: 12,
                  borderRadius: 999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                }}
              >
                <Image
                  source={require('@/assets/images/google.png')}
                  style={{ width: 20, height: 20 }}
                />
                <Text className="text-gray-600 text-center" style={styles.poppinsRegular}>
                  Google
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-sm text-gray-600 text-center " style={styles.poppinsRegular}>
            Don't have an account?{' '}
            <Pressable onPress={() => router.push('/Signup')}>
              <Text className="font-medium text-[#001d4a] text-arial" style={styles.poppinsSemiBold}>
                Sign up here
              </Text>
            </Pressable>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  poppinsRegular: {
    fontFamily: 'poppinsRegular',
  },
  poppinsBold: {
    fontFamily: 'poppinsBold',
  },
  poppinsMedium: {
    fontFamily: 'poppinsMedium',
  },
  poppinsSemiBold: {
    fontFamily: 'poppinsSemiBold',
  },
  poppinsExtraBold: {
    fontFamily: 'poppinsExtraBold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default Login;
