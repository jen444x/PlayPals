import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, ImageBackground, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PetProfile = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { petId } = route.params;

    const [petDetails, setPetDetails] = useState(null);

    useEffect(() => {
        const fetchPetDetails = async () => {
            // Simulated API call: replace this with your actual API call
            /*
            const details = {
                id: petId,
                name: 'Buddy',
                breed: 'Golden Retriever',
                age: 3,
                birthday: '2019-06-15', // Use a string date or a Date object as needed
                profileImage: 'https://example.com/path-to-pet-image.jpg',
            };
            */
            try {
                console.log("Hello")
                const userId = await AsyncStorage.getItem('userId'); // or pass it as a prop
                console.log("User ID:", userId)
                const response = await fetch(`${BASE_URL}api/pets/${userId}/${petId}`);
            
                if (!response.ok) {
                  throw new Error('Failed to fetch pet');
                }
            
                const data = await response.json();
                setPetDetails(data); // Assuming backend returns { pets: [...] }
                console.log(data)
              } catch (error) {
                console.error('Error fetching pets:', error);
                Alert.alert('Error', 'Could not load your pets.');
              }
        };

        fetchPetDetails();
    }, [petId]);

    if (!petDetails) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6D4C41" />
                <Text style={styles.loadingText}>Loading pet details...</Text>
            </View>
        );
    }

    // If a profileImage URL is provided, use it; otherwise, fallback to a local placeholder
    const imageSource = petDetails.profileImage
        ? { uri: petDetails.profileImage }
        : require('../assets/pet-placeholder.png');

    // Safely format the birthday if available
    const formattedBirthday = petDetails.birthday
        ? new Date(petDetails.birthday).toLocaleDateString()
        : 'Not Provided';

    return (
        <ImageBackground
            source={require('../assets/petBackground.jpg')}
            style={styles.background}
        >
            <View style={styles.container}>
                <Image source={imageSource} style={styles.petImage} />
                <Text style={styles.petName}>{petDetails.petName}</Text>
                <Text style={styles.petDetails}>Breed: {petDetails.breed}</Text>
                <Text style={styles.petDetails}>Age: {petDetails.age}</Text>
                <Text style={styles.petDetails}>Birthday: {formattedBirthday}</Text>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Edit Profile"
                        onPress={() => navigation.navigate('EditPet', { petId: petDetails.id })}
                        color="#E76F51"
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Go to Nav"
                        onPress={() => navigation.navigate('Navigation')}
                        color="#E76F51"
                    />
                </View>
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
    petImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: '#FF6F61',
        marginBottom: 20,
    },
    petName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6D4C41',
        marginBottom: 10,
        textShadowColor: '#fff',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    petDetails: {
        fontSize: 18,
        color: '#6D4C41',
        marginVertical: 5,
    },
    buttonContainer: {
        marginTop: 20,
        width: '60%',
        borderRadius: 25,
        overflow: 'hidden',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEDD5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#6D4C41',
    },
});

export default PetProfile;
