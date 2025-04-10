import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    Text,
    Button,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
    ImageBackground,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditPet = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { petId } = route.params;

    const [petName, setPetName] = useState('');
    const [petBreed, setPetBreed] = useState('');
    const [petBirthday, setPetBirthday] = useState(null);
    const [petImage, setPetImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPetDetails = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                console.log('🔍 userId:', userId);
                console.log('🐾 petId:', petId);
    
                const url = `https://test2.playpals-app.com/api/pets/${userId}/${petId}`;
                console.log('🌐 Fetching from:', url);
    
                const response = await fetch(url);
                const text = await response.text();
                console.log('📬 Raw Response:', response.status, text);
    
                if (!response.ok) throw new Error('Failed to fetch pet');
    
                const data = JSON.parse(text);
                console.log('✅ Pet data:', data);
    
                setPetName(data.petName || '');
                setPetBreed(data.breed || '');
                setPetBirthday(data.birthday ? new Date(data.birthday) : null);
                setPetImage(data.profileImage || null);
            } catch (error) {
                console.error('❌ Error fetching pet:', error);
                Alert.alert('Error', 'Failed to load pet details.');
            }
        };
    
        fetchPetDetails();
    }, [petId]);
    

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setPetBirthday(selectedDate);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your media library!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPetImage(result.assets[0].uri);
        }
    };
    const uploadImageToServer = async (localUri) => {
        const formData = new FormData();
        formData.append('image', {
            uri: localUri,
            name: 'pet.jpg',
            type: 'image/jpeg',
        });
    
        try {
            const response = await fetch('https://test2.playpals-app.com/api/uploads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.log('Upload error:', errorText);
                throw new Error('Image upload failed');
            }
    
            const data = await response.json();
            console.log('✅ Uploaded image URL:', data.imageUrl);
            return data.imageUrl;
        } catch (err) {
            console.error('❌ Image upload failed:', err);
            throw err;
        }
    };
    
    const handleUpdatePet = async () => {
        if (!petName.trim() || !petBreed.trim() || !petBirthday) {
            setError('Please fill in all fields correctly.');
            return;
        }
    
        setError('');
        setIsLoading(true);
    
        try {
            const userId = await AsyncStorage.getItem('userId');
    
            let imageUrl = null;
    
            // If the image was selected from phone (local URI), upload it first
            if (petImage && petImage.startsWith('file://')) {
                imageUrl = await uploadImageToServer(petImage);
            } else {
                imageUrl = petImage; // Use existing image URL if already set
            }
    
            const payload = {
                petName,
                breed: petBreed,
                birthday: petBirthday.toISOString(),
                profileImage: imageUrl,
            };
    
            const url = `https://test2.playpals-app.com/api/pets/${userId}/${petId}`;
            console.log('🔄 PUT to:', url);
            console.log('📝 Payload:', payload);
    
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            const responseText = await response.text();
            console.log('📬 Server Response:', response.status, responseText);
    
            if (!response.ok) throw new Error('Failed to update pet.');
    
            Alert.alert('Success', 'Pet details updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            console.error('Error updating pet:', err);
            setError('An error occurred while updating pet details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    

    return (
        <ImageBackground source={require('../assets/petBackground.jpg')} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Edit Pet Details</Text>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TextInput
                    style={styles.input}
                    placeholder="Pet Name"
                    value={petName}
                    onChangeText={setPetName}
                    placeholderTextColor="#8B7E66"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Breed"
                    value={petBreed}
                    onChangeText={setPetBreed}
                    placeholderTextColor="#8B7E66"
                />

                <View style={styles.dateButton}>
                    <Button title="Select Birthday" onPress={() => setShowDatePicker(true)} color="#FF6F61" />
                </View>

                <Text style={styles.birthdayText}>
                    {petBirthday ? `Selected Birthday: ${petBirthday.toLocaleDateString()}` : 'No birthday selected'}
                </Text>

                {showDatePicker && (
                    <DateTimePicker
                        value={petBirthday || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}

                <View style={styles.imageButton}>
                    <Button title="Upload Pet Picture" onPress={pickImage} color="#FF6F61" />
                </View>

                {petImage ? (
                    <Image source={{ uri: petImage }} style={styles.image} />
                ) : (
                    <Image source={require('../assets/pet-placeholder.png')} style={styles.image} />
                )}

                {isLoading ? (
                    <ActivityIndicator size="large" color="#6D4C41" style={{ marginVertical: 20 }} />
                ) : (
                    <View style={styles.updateButton}>
                        <Button title="Update Pet" onPress={handleUpdatePet} color="#E76F51" />
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        margin: 20,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#4A4A4A',
        textShadowColor: '#fff',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#FFF',
        marginBottom: 15,
        borderColor: '#6D4C41',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    dateButton: {
        width: '100%',
        marginBottom: 10,
    },
    birthdayText: {
        marginVertical: 10,
        fontSize: 16,
        color: '#4A4A4A',
    },
    imageButton: {
        width: '100%',
        marginBottom: 15,
    },
    image: {
        width: 200,
        height: 200,
        marginVertical: 10,
        borderRadius: 15,
    },
    updateButton: {
        width: '100%',
        marginTop: 10,
    },
    errorText: {
        color: '#D9534F',
        marginBottom: 10,
    },
});

export default EditPet;
