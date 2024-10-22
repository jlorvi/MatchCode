import { Alert, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { theme } from './../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import Icon from '../assets/icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common'
import Input from '../components/Input'
import Button from '../components/Button'
import { supabase } from '../lib/supabase';

const Login = () => {
    const router = useRouter();
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert('Login', "Please fill all the fields!");
            return;
        }
        
        let email = emailRef.current.trim();
        let password = passwordRef.current.trim();
        setLoading(true);
        const {error} = await supabase.auth.signInWithPassword({
            email,
            password
        })

        setLoading(false);
       
        if(error){
            Alert.alert('Login', error.message);
        }
    };

    return (
        <ScreenWrapper bg="white">
            <StatusBar style="dark" />
            <View style={styles.container}>
                {/* Keep the space for BackButton */}
                <View style={styles.backButtonPlaceholder} />

                {/* Welcome Section */}
                <View>
                <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                    Hey, hello!👋
                </Text>
                <Text style={styles.welcomeText}>Hey, hello!👋</Text>
                <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                    Please login to your account
                </Text>
            </View>

                {/* Form Section */}
                <View style={styles.form}>
                    <Input
                        icon={<Icon name="mail" size={26} strokeWidth={1.6} />} 
                        placeholder='Enter your email'
                        onChangeText={value => emailRef.current = value}    
                    />
                    <Input
                        icon={<Icon name="lock" size={26} strokeWidth={1.6} />} 
                        placeholder='Enter your password'
                        secureTextEntry
                        onChangeText={value => passwordRef.current = value}    
                    />
                    <Text style={styles.forgotPassword}>
                        Forgot Password?
                    </Text>
                    {/* Email/Password Button */}
                    <Button title={'Login'} loading={loading} onPress={onSubmit} />
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?
                    </Text>
                    <Pressable onPress={() => router.push('signUp')}>
                        <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>Create Account</Text>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    backButtonPlaceholder: {
        height: hp(4), // Set this to the height of your BackButton
        width: wp(100), // Set this to match the width of the container
    },
    welcomeText: {
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    form: {
        gap: 25,
    },
    googleButtonContainer: {
        alignItems: 'center', // Center the button horizontally
        marginVertical: 10,   // Add some vertical space
    },
    googleButton: {
        backgroundColor: theme.colors.white, // Background color
        width: wp(12), // Width of the circular button
        height: wp(12), // Height to make it circular
        borderRadius: wp(6), // Half of width/height for a circular effect
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border, // Optional: Add border color
    },
    googleLogo: {
        width: '60%', // Adjust logo size as needed
        height: '60%', // Maintain aspect ratio
    },
    forgotPassword: {
        textAlign: 'right',
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6)
    }
});