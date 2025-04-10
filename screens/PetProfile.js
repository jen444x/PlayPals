import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Button,
    ImageBackground,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PetProfile = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { petId } = route.params;

    const [petDetails, setPetDetails] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            const fetchPetDetails = async () => {
                try {
                    const userId = await AsyncStorage.getItem('userId');
                    console.log("🔍 userId:", userId);
                    console.log("🐾 petId:", petId);

                    const response = await fetch(`https://test2.playpals-app.com/api/pets/${userId}/${petId}`);
                    if (!response.ok) throw new Error('Failed to fetch pet');

                    const data = await response.json();
                    console.log('✅ Pet details:', data);
                    setPetDetails(data);
                } catch (error) {
                    console.error('Error fetching pet:', error);
                    Alert.alert('Error', 'Could not load your pet.');
                }
            };

            fetchPetDetails();
        }, [petId])
    );

    if (!petDetails) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6D4C41" />
                <Text style={styles.loadingText}>Loading pet details...</Text>
            </View>
        );
    }

    const imageSource =
        petDetails.profileImage && petDetails.profileImage.startsWith('http')
            ? { uri: petDetails.profileImage }
            : require('../assets/pet-placeholder.png');

    const formattedBirthday = petDetails.birthday
        ? new Date(petDetails.birthday).toLocaleDateString()
        : 'Not provided';
        const calculateAge = (birthday) => {
            if (!birthday) return 'Not provided';
        
            const birthDate = new Date(birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
        
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        
            return `${age} year${age !== 1 ? 's' : ''}`;
        };
        

    return (
        <ImageBackground
            source={require('../assets/petBackground.jpg')}
            style={styles.background}
        >
            <View style={styles.container}>
                <Image source={imageSource} style={styles.petImage} />
                <Text style={styles.petName}>{petDetails.petName}</Text>
                <Text style={styles.petDetails}>Breed: {petDetails.breed}</Text>
                <Text style={styles.petDetails}>Age: {calculateAge(petDetails.birthday)}</Text>
                <Text style={styles.petDetails}>Birthday: {formattedBirthday}</Text>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Edit Profile"
                        onPress={() => navigation.navigate('EditPet', { petId: petDetails.petId })}
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
