import { View, StyleSheet, Text, ScrollView, RefreshControl } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import CircleButton from '@/components/CircleButton';
import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';


export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [output, setOutput] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showCircleButton, setShowCircleButton] = useState<boolean>(true);
  
  const PlaceholderImage = require('../../assets/images/Gemini_Generated_Image_cfk04bcfk04bcfk0.jpg');
  const REPLICATE_API_TOKEN = 'secret';

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      setShowAppOptions(true);
    } else {
      alert('You did not select any image.');
    }
  };

  const takePictureAsync = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      setShowAppOptions(true);
    } else {
      alert('You did not take any picture.');
    }
  };

  // ----------------------REPLICATE API START----------------------
  const callReplicateAPI = async () => {
    await replicateAPI(selectedImage!);
  };

  const replicateAPI = async (imageUri: string) => {
    setShowCircleButton(false);
    setLoading(true);

    try {
      const fileType = imageUri.split('.').pop();
      const formData = new FormData();
      formData.append('content', {
        uri: imageUri,
        name: `image.${fileType}`,
        type: `image/${fileType}`,
      });

      // Upload the image to Replicate to get a temporary URL
      const fileUploadResponse = await fetch('https://api.replicate.com/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const fileData = await fileUploadResponse.json();
      const imageUrl = fileData.urls.get;

      // Call the prediction endpoint with the uploaded image URL
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "8151e1c9f47e696fa316146a2e35812ccf79cfc9eba05b11c7f450155102af70",
          input: {
            mode: "best",
            image: imageUrl,
            clip_model_name: "ViT-L-14/openai",
          },
        }),
      });

      const data = await response.json();
      console.log('Prediction Response:', data);

      // Extract the get URL for polling
      const getUrl = data.urls.get;
      pollForResult(getUrl);
    } catch (error) {
      console.error('Error with Replicate API:', error);
      setLoading(false);
    }
  };

  const pollForResult = async (getUrl: string) => {
    try {
      const interval = setInterval(async () => {
        const response = await fetch(getUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        });
        
        const data = await response.json();
        console.log('Polling Response:', data);
        console.log('Output:', data.output);

        // Check if the output is ready
        if (data.status === 'succeeded' && data.output) {
          setOutput(data.output);
          clearInterval(interval);
          setLoading(false);
        } else if (data.status === 'failed' || data.error) {
          console.error('Prediction failed:', data.error);
          clearInterval(interval);
          setLoading(false);
        }
      }, 3000); // Poll every 3 seconds
    } catch (error) {
      console.error('Error while polling for result:', error);
      setLoading(false);
    }
  };

  // ----------------------REPLICATE API END----------------------

  const onReset = () => {
    setShowAppOptions(false);
    setSelectedImage(undefined);
    setOutput(undefined);
    setLoading(false);
    setRefreshing(false);
    setShowCircleButton(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    onReset();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          {showCircleButton && (
            <CircleButton onPress={callReplicateAPI} />
          )}
          {loading && (
            <Text style={styles.loadingText}>Genrateing...</Text>
          )}
          {output && (
            <Text style={styles.outputText}>Output: {output}</Text>
          )}
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button theme="secondary" label="Take a photo" onPress={takePictureAsync} />
          <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  outputText: {
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    marginVertical: 10,
  },
});
