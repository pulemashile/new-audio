import React from 'react';
import { StyleSheet, View, Text,Pressable } from 'react-native';
import Background from './Background';


import { router } from 'expo-router';

const Home = (props) => {
  return (
    <Background>
      <View classname="flex-1 items-center justify-center">
        <Text classname="text-white text-4xl font-bold" style={styles.poppinsRegular}> Let's Record</Text>
        <Text classname="text-white text-4xl font-bold" style={styles.poppinsRegular}>Your Memories</Text>
        <Pressable classname="mt-5 bg-[#6a8dff] text-white text-lg font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out" btnLabel="Login" Press={() => router.push("Login")}  style={styles.poppinsRegular}/>
        <Pressable classname="mt-5 bg-[#6a8dff] text-white text-lg font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out" btnLabel="Signup" Press={() => router.push("Signup")} style={styles.poppinsRegular} />
        
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  poppinsRegular:{
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
})

export default Home;

