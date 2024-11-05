import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../../../components/ScreenWrapper'
import Header from '../../../components/Header'
import { hp, wp } from '../../../helpers/common'
import { theme } from '../../../constants/theme'
import Avatar from '../../../components/Avatar'
import { useAuth } from '../../../contexts/AuthContext'
import RichTextEditor from '../../../components/RichTextEditor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import Icon from '../../../assets/icons'
import Button from '../../../components/Button'
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import DateTimePicker from '@react-native-community/datetimepicker'
import { getSupabaseFileUrl } from '../../../services/imageService'
import { Image } from 'expo-image'
import { createorUpdatePost } from '../../../services/postService'
import { Picker } from '@react-native-picker/picker'; // Import Picker

const NewCPost = () => {
  const post = useLocalSearchParams()
  const { user } = useAuth()
  const bodyRef = useRef("")
  const editorRef = useRef(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null) // Ensure initial state is null
  const [fileContent, setFileContent] = useState('') // New state for file content
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy Challenge'); // State for difficulty level
  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    if (post && post.id) {
      bodyRef.current = post.body
      setFile(post.file || null)
      setTimeout(() => {
        editorRef?.current?.setContentHTML(post.body)
      }, 300)
    }
  }, [post]) // Add dependency array

  const difficultyLevels = [
    { label: 'Easy', value: 'Easy Challenge' },
    { label: 'Medium', value: 'Medium Challenge' },
    { label: 'Hard', value: 'Hard Challenge' },
  ];

  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };

    if (!isImage) {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
      });

      console.log('Document Picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Accepted text file:', result.assets[0]);
        setFile(result.assets[0]);
        // Read the content of the text file
        const content = await getFileContent(result.assets[0]);
        setFileContent(content); // Set the content to the state
      } else {
        console.warn('Text file picking was canceled or failed.');
      }
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    console.log('Image Picker result:', result);

    if (!result.canceled) {
      console.log('Accepted image file:', result.assets[0]);
      setFile(result.assets[0]);
      setFileContent(''); // Clear file content when picking a new image
    }
  };

  const isLocalFile = file => {
    if(!file) return null
    if(typeof file == 'object') return true;

    return false
  }

  const getFileType = file => {
    if(!file) return null
    if(isLocalFile(file)){
      return file.type
    }

    // check image or video for remote file
    if(file.includes('postImages')){
      return 'image'
    }
    return 'files'
  }

  const getFileContent = async (file) => {
    try {
      const fileUri = file.uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return fileContent;
    } catch (error) {
      console.error("Error reading file content:", error);
      return "";
    }
  };

  const getFileUri = file => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }
    return getSupabaseFileUrl(file)?.uri;
  };

  const handleShowPicker = () => {
    if (!showPicker) {
      setShowPicker(true);
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
  
    const minTime = new Date();
    minTime.setMinutes(minTime.getMinutes() + 30);
    const maxTime = new Date();
    maxTime.setHours(maxTime.getHours() + 6);
  
    if (currentDate < minTime || currentDate > maxTime) {
      Alert.alert('Time Limit', 'Please select a valid time limit of at least 30 minutes and no more than 6 hours.', [
        { text: 'OK', onPress: () => setShowPicker(true) } // This will reopen the picker
      ]);
      return;
    }
  
    setShowPicker(false);
    setDate(currentDate);
  };

  const onSubmit = async () => {
    // Points mapping based on difficulty
    const difficultyPoints = {
      'Easy Challenge': 2,
      'Medium Challenge': 5,
      'Hard Challenge': 10,
    };
  
    // Get experience points based on selected difficulty
    const exp_points = difficultyPoints[selectedDifficulty] || 0;
  
    // Check if time limit is set within allowed range
    const minTime = new Date();
    minTime.setMinutes(minTime.getMinutes() + 30); // 30 minutes from now
    const maxTime = new Date();
    maxTime.setHours(maxTime.getHours() + 6); // 6 hours from now
  
    console.log("Selected Time:", date);
    console.log("Minimum Time:", minTime);
    console.log("Maximum Time:", maxTime);
  
    if (date < minTime || date > maxTime) {
      Alert.alert('Time Limit', 'Please set a valid time limit of at least 30 minutes and no more than 6 hours.');
      return; // Exit if time limit is invalid
    }
  
    // Validate post content
    const bodyContent = bodyRef.current.trim();
    console.log("Body Content:", bodyContent);
    console.log("File Attached:", !!file);
  
    if (!bodyContent && !file) {
      Alert.alert('Post', "Please add a caption and choose a file to post.");
      return;
    }
  
    if (bodyContent && !file) {
      Alert.alert('Post', "Please choose a file to post along with the caption.");
      return;
    }
  
    if (!bodyContent && file) {
      Alert.alert('Post', "Please add a caption along with the file.");
      return;
    }
  
    // Prepare data for submission
    const data = {
      file,
      body: bodyContent,
      userId: user?.id,
      difficulty: selectedDifficulty,
      time_limit: date.toISOString(),
      exp_points, // Add experience points here
    };
  
    if (post && post.id) {
      data.id = post.id; // Include post ID if updating an existing post
    }
  
    // Manage loading state
    setLoading(true);
    console.log("Data to Submit:", data);
  
    try {
      const res = await createorUpdatePost(data);
      console.log("Response from API:", res);
  
      if (res.success) {
        // Clear form and navigate back
        setFile(null);
        bodyRef.current = '';
        editorRef.current?.setContentHTML('');
        router.back();
      } else {
        Alert.alert('Post', res.msg); // Show error message from server
      }
    } catch (error) {
      console.error("Submission Error:", error); // Log unexpected errors
      Alert.alert('Post', 'An error occurred while submitting your post. Please try again.'); // Handle unexpected errors
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };
  

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title={post && post.id ? "Edit Post" : "Create Post"} />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          <View style={styles.header}>
            <Avatar uri={user?.image} size={hp(6.5)} rounded={theme.radius.xl} />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user && user.name}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>

          <View style={styles.difficultyPicker}>
          <Text style={styles.label}>Select Difficulty Level:</Text>
          <Picker
            selectedValue={selectedDifficulty}
            onValueChange={(itemValue) => setSelectedDifficulty(itemValue)}
            style={styles.picker}
          >
            {difficultyLevels.map((level) => (
              <Picker.Item key={level.value} label={level.label} value={level.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.timeLimitContainer}>
        <TouchableOpacity onPress={handleShowPicker}>
          <Text style={styles.timeLimitText}>
            Set Time Limit: {date.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onChange}
          />
        )}
      </View>

          <View style={styles.textEditor}>
            <RichTextEditor editorRef={editorRef} onChange={body => bodyRef.current = body} />
          </View>

          {
            file && (
              <View style={styles.file}>
                {
                  getFileType(file) === 'text' ? (
                    // Display text content if it's a .txt file
                    <ScrollView style={{ flex: 1 }}>
                      <Text>{fileContent}</Text> {/* Display the content from state */}
                    </ScrollView>
                  ) : (
                    // Display image if it's an image file
                    <Image source={{ uri: getFileUri(file) }} resizeMode="cover" style={{ flex: 1 }} />
                  )
                }
                <Pressable style={styles.closeIcon} onPress={() => {
                  setFile(null);
                  setFileContent(''); // Clear content on file removal
                }}>
                  <Icon name="delete" size={20} color="white" />
                </Pressable>
              </View>
            )
          }

          <View style={styles.media}>
          <Text style={styles.addImageText}> Add to your post</Text>
          <View style={styles.mediaIcons}>
            <TouchableOpacity onPress={() => onPick(true)}>
              <Icon name="image" size={30} color={theme.colors.dark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onPick(false)}>
              <Icon name="file" size={33} color={theme.colors.dark} />
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>

        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={post && post.id ? "Update" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  )
}

export default NewCPost

const styles = StyleSheet.create({

  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  avatar: {
    height: hp(6.5),
    weight: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1'
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },

  textEditor:{
    //marginTop: 10,
  },

  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray
  },
  mediaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },

  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  imageIcon: {
    borderRadius: theme.radius.md,
    
  },
  file: {
    height: hp(30),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous'
  },
  video: {

  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'rgba(255,0,0, 0.6)'
  },
  difficultyPicker:{
    justifyContent: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray
  },
  label:{
    justifyContent: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray
  },
  timeLimitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray
  },
  timeLimitText: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    paddingHorizontal: 18,
  }
})