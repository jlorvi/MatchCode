import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';

const Onboard = () => {
    const router = useRouter();
    const slides = [
        {
            key: '1',
            title: 'Greetings! 👋',
            text: 'Connect with students',
            image: require('../assets/images/welcome.png'),
            backgroundColor: '#D04AFF',
        },
        {
            key: '2',
            title: 'Hello Again',
            text: 'Something even cooler!',
            image: require('../assets/images/welcome.png'),
            backgroundColor: '#D04AFF',
        },
        {
            key: '3',
            title: 'Final Slide',
            text: 'Coolest thing yet!',
            image: require('../assets/images/welcome.png'),
            backgroundColor: '#D04AFF',
        },
    ];

    const onDone = async () => {
        router.push('welcome');
    };

    const renderItem = ({ item }) => (
        <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.skipButton} onPress={() => router.push('welcome')}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <View style={styles.sliderContainer}>
                <AppIntroSlider
                    data={slides}
                    renderItem={renderItem}
                    onDone={onDone}
                    dotStyle={styles.dotStyle}
                    activeDotStyle={styles.activeDotStyle}
                />
            </View>
        </View>
    );
};

export default Onboard;

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: 'white', // Set color to white for visibility
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
        color: 'white', // Set color to white for visibility
    },
    image: {
        width: 200, // Adjust width as needed
        height: 200, // Adjust height as needed
        marginBottom: 20, // Space below the image
    },
    dotStyle: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeDotStyle: {
        backgroundColor: 'white',
    },
    sliderContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Position content to the bottom
    },
    skipButton: {
        position: 'absolute',
        top: 40, // Adjusted position to be more visible
        right: 20,
        backgroundColor: '#D04AFF',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 10,
        zIndex: 1, // Ensure the button appears above other components
    },
    skipText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
