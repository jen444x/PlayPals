import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Button, StyleSheet, Platform, ActivityIndicator, Alert, Image, ImageBackground } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

const EditPet = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { petId } = route.params;

    // State variables for pet details
    const [petName, setPetName] = useState('');
    const [petBreed, setPetBreed] = useState('');
    const [petBirthday, setPetBirthday] = useState(null);
    const [petImage, setPetImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState('');

    // Fetch existing pet details (simulate API call)
    useEffect(() => {
        const fetchPetDetails = async () => {
            // Replace this with your actual API call
            const details = {
                id: petId,
                name: 'Buddy',
                breed: 'Golden Retriever',
                birthday: '2019-06-15',
                image: 'https://example.com/path-to-pet-image.jpg',
            };

            setPetName(details.name);
            setPetBreed(details.breed);
            setPetBirthday(new Date(details.birthday));
            setPetImage(details.image);
        };

        fetchPetDetails();
    }, [petId]);

    // Handle date change from the date picker
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setPetBirthday(selectedDate);
        }
    };

    // Function to pick an image from the media library
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your media library!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setPetImage(result.uri);
        }
    };

    // Handle updating pet details
    const handleUpdatePet = async () => {
        if (!petName.trim() || !petBreed.trim() || !petBirthday) {
            setError('Please fill in all fields correctly.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            // Simulate an API update delay (replace with actual API call)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const updatedPet = {
                id: petId,
                name: petName,
                breed: petBreed,
                birthday: petBirthday,
                image: petImage,
            };

            console.log('Updated pet:', updatedPet);

            Alert.alert('Success', 'Pet details updated successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (err) {
            console.error('Error updating pet:', err);
            setError('An error occurred while updating pet details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../assets/petBackground.jpg')}
            style={styles.background}
        >
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
                {petBirthday && (
                    <Text style={styles.birthdayText}>
                        Selected Birthday: {petBirthday.toLocaleDateString()}
                    </Text>
                )}
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
                {petImage && (
                    <Image source={{ uri: petImage }} style={styles.image} />
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
