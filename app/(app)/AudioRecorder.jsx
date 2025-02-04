import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, FlatList, Alert, TextInput, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [voiceNotes, setVoiceNotes] = useState([]); // Store list of voice notes
  const [sound, setSound] = useState(null); // Audio playback object
  const [currentNoteLength, setCurrentNoteLength] = useState(0); // Current note length
  const [playbackPosition, setPlaybackPosition] = useState(0); // Current playback position
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Request microphone permission on app load (using Audio API)
    const requestPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "You need to grant permission to access the microphone");
      }
    };
    requestPermissions();
    loadVoiceNotes();
  }, []);

  // Load saved voice notes from AsyncStorage
  const loadVoiceNotes = async () => {
    try {
      const notes = await AsyncStorage.getItem('voiceNotes');
      if (notes) {
        setVoiceNotes(JSON.parse(notes));
      }
    } catch (e) {
      console.error("Error loading voice notes", e);
    }
  };

  // Save voice notes to AsyncStorage
  const saveVoiceNotes = async (notes) => {
    try {
      await AsyncStorage.setItem('voiceNotes', JSON.stringify(notes));
    } catch (e) {
      console.error("Error saving voice notes", e);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      if (hasPermission) {
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
        setRecordingTime(0);
        await recording.startAsync();

        // Update the recording time every second
        const interval = setInterval(() => {
          setRecordingTime(prevTime => prevTime + 1);
        }, 1000);
        setRecordingInterval(interval);
      } else {
        Alert.alert('Permission Required', 'You must grant permission to record audio.');
      }
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        const newNote = { name: `Note ${voiceNotes.length + 1}`, uri, date: new Date() };
        const updatedNotes = [...voiceNotes, newNote];
        setVoiceNotes(updatedNotes);
        saveVoiceNotes(updatedNotes);
        setIsRecording(false);
        setRecording(null);

        // Clear the recording interval
        clearInterval(recordingInterval);
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };

  // Play the selected voice note
  const playSound = async (uri) => {
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(sound);
      setCurrentNoteLength(status.durationMillis / 1000); // Set the length in seconds
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  };

  // Update playback status
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis / 1000);
    }
  };

  // Stop the playback
  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setSound(null);
        setPlaybackPosition(0); // Reset the playback position
        setCurrentNoteLength(0); // Reset the length
      }
    } catch (err) {
      console.error('Error stopping playback:', err);
    }
  };

  // Delete a voice note
  const deleteVoiceNote = async (uri) => {
    try {
      const updatedNotes = voiceNotes.filter(note => note.uri !== uri);
      setVoiceNotes(updatedNotes);
      saveVoiceNotes(updatedNotes);
      await FileSystem.deleteAsync(uri);
    } catch (err) {
      console.error('Error deleting voice note:', err);
    }
  };

  // Function to handle feedback
  const sendFeedback = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Mail Composer Unavailable', 'Mail Composer is not available on this device.');
        return;
      }
      await MailComposer.composeAsync({
        recipients: ['your-email@example.com'], // Replace with your email address
        subject: 'App Feedback',
        body: 'Please provide your feedback here...',
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert('Error', 'An error occurred while sending feedback.');
    }
  };

  // Function to handle sharing
  const shareVoiceNote = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        Alert.alert('File Not Found', 'The voice note file does not exist.');
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error sharing voice note:', error);
      Alert.alert('Error', 'An error occurred while sharing the voice note.');
    }
  };

  // Search functionality
  const filteredVoiceNotes = voiceNotes.filter(note => note.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
    <Pressable title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={isRecording ? stopRecording : startRecording} disabled={!hasPermission} />
    {isRecording && <Text style={styles.timer}>Recording Time: {recordingTime}s</Text>}
    
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Voice Notes"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable style={styles.searchIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="black" fill="none">
          <path d="M14 14L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLineJoin="round" />
          <path d="M16.4333 18.5252C15.8556 17.9475 15.8556 17.0109 16.4333 16.4333C17.0109 15.8556 17.9475 15.8556 18.5252 16.4333L21.5667 19.4748C22.1444 20.0525 22.1444 20.9891 21.5667 21.5667C20.9891 22.1444 20.0525 22.1444 19.4748 21.5667L16.4333 18.5252Z" stroke="currentColor" strokeWidth="1.5" strokeLineCap="round" />
          <path d="M16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16C12.866 16 16 12.866 16 9Z" stroke="currentColor" strokeWidth="1.5" strokeLineJoin="round" />
        </svg>
      </Pressable>
    </View>
      <FlatList
  data={filteredVoiceNotes}
  keyExtractor={(item) => item.uri}
  renderItem={({ item }) => (
    <View style={styles.noteItem}>
      <Text style={styles.noteName}>{item.name}</Text>
      <Text style={styles.noteDate}>{item.date.toString()}</Text>
      
      {/* Play Button */}
      <Pressable onPress={() => playSound(item.uri)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="white" fill="none">
          <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Pressable>
      
      {/* Stop Button */}
      <Pressable onPress={stopSound}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="white" fill="none">
          <path d="M4 12C4 8.72077 4 7.08116 4.81382 5.91891C5.1149 5.48891 5.48891 5.1149 5.91891 4.81382C7.08116 4 8.72077 4 12 4C15.2792 4 16.9188 4 18.0811 4.81382C18.5111 5.1149 18.8851 5.48891 19.1862 5.91891C20 7.08116 20 8.72077 20 12C20 15.2792 20 16.9188 19.1862 18.0811C18.8851 18.5111 18.5111 18.8851 18.0811 19.1862C16.9188 20 15.2792 20 12 20C8.72077 20 7.08116 20 5.91891 19.1862C5.48891 18.8851 5.1149 18.5111 4.81382 18.0811C4 16.9188 4 15.2792 4 12Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Pressable>
      
      {/* Share Button */}
      <Pressable onPress={() => shareVoiceNote(item.uri)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="white" fill="none">
          <path d="M21 6.5C21 8.15685 19.6569 9.5 18 9.5C16.3431 9.5 15 8.15685 15 6.5C15 4.84315 16.3431 3.5 18 3.5C19.6569 3.5 21 4.84315 21 6.5Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M21 17.5C21 19.1569 19.6569 20.5 18 20.5C16.3431 20.5 15 19.1569 15 17.5C15 15.8431 16.3431 14.5 18 14.5C19.6569 14.5 21 15.8431 21 17.5Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8.72852 10.7495L15.2285 7.75M8.72852 13.25L15.2285 16.2495" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Pressable>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="white" fill="none">
    <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</svg>
      {/* Delete Button */}
      <Pressable onPress={() => deleteVoiceNote(item.uri)}>
        <Text>Delete</Text>
      </Pressable>
    </View>
  )}
/>

      <Pressable title="Send Feedback" onPress={sendFeedback} />
      {sound && currentNoteLength > 0 && (
        <View style={styles.sliderContainer}>
          <Text style={styles.timer}>Note Length: {currentNoteLength}s</Text>
          <Text style={styles.timer}>Current Position: {playbackPosition.toFixed(1)}s</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={currentNoteLength}
            value={playbackPosition}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            thumbTintColor="#FFFFFF"
            onSlidingComplete={async (value) => {
              if (sound) {
                await sound.setPositionAsync(value * 1000);
              }
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 12,
    backgroundColor: 'black',
  },
  timer: {
    fontSize: 24,
    marginBottom: 10,
    color: 'white',
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    fontSize: 16,
    borderRadius: 10,
    backgroundColor: '#B7B7B7',
    fontFamily: 'poppinsRegular',
  },
  searchIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#B7B7B7',
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A5EB0',
    marginBottom: 5,
    flex: 1,
    fontFamily: 'poppinsRegular',
  },
  noteDate: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'right',
    fontFamily: 'poppinsRegular',
  },
  sliderContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  slider: {
    width: '90%',
    height: 40,
  },
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

});
