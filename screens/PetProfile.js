import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const PetProfile = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { petId } = route.params;

    // Assuming a function fetchPetDetails() that fetches pet details by ID
    const [petDetails, setPetDetails] = useState(null);

    useEffect(() => {
        const fetchPetDetails = async () => {
            // This would be replaced with your API call
            const details = {
                id: petId,
                name: 'Buddy',
                breed: 'Golden Retriever',
                age: 3,
               // profileImage: require('../assets/pet-placeholder.png'),
            };
            setPetDetails(details);
        };

        fetchPetDetails();
    }, [petId]);

    if (!petDetails) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={petDetails.profileImage} style={styles.petImage} />
            <Text style={styles.petName}>{petDetails.name}</Text>
            <Text style={styles.petDetails}>Breed: {petDetails.breed}</Text>
            <Text style={styles.petDetails}>Age: {petDetails.age}</Text>

            <Button
                title="Edit Profile"
                onPress={() => navigation.navigate('EditPet', { petId: petDetails.id })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEDD5',
        padding: 20,
    },
    petImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    petName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6D4C41',
    },
    petDetails: {
        fontSize: 18,
        color: '#6D4C41',
        marginVertical: 5,
    },
});

export default PetProfile;
