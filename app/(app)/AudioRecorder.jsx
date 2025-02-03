import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, FlatList, Alert, TextInput } from 'react-native';
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
      <Button styles={styles.button}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={!hasPermission}
      />
      {isRecording && <Text style={styles.timer}>Recording Time: {recordingTime}s</Text>}
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search Voice Notes"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredVoiceNotes}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteName}>{item.name}</Text>
            <Text style={styles.noteDate}>{item.date.toString()}</Text>
            <Button title="Play" onPress={() => playSound(item.uri)} />
            <Button title="Stop" onPress={stopSound} />
            <Button title="Share" onPress={() => shareVoiceNote(item.uri)} />
            <Button title="Delete" onPress={() => deleteVoiceNote(item.uri)} />
          </View>
        )}
      />
      <Button title="Send Feedback" onPress={sendFeedback} />
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
    padding: 10,
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
  },
  noteDate: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'right',
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
});