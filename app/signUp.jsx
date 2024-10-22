import { Alert, StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useRef, useState } from 'react'
import { theme } from './../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import Icon from '../assets/icons';
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import { hp, wp } from '../helpers/common'
import Input from '../components/Input'
import Button from '../components/Button'
import { supabase } from '../lib/supabase';

const SignUp = () => {
    const router = useRouter();
    const emailRef = useRef("");
    const nameRef = useRef("");
    const passwordRef = useRef("");
    const confirmPasswordRef = useRef("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (!emailRef.current || !passwordRef.current || !nameRef.current || !confirmPasswordRef.current) {
            Alert.alert('Sign Up', "Please fill all the fields!");
            return;
        }

        let name = nameRef.current.trim();
        let email = emailRef.current.trim();
        let password = passwordRef.current.trim();
        let confirmPassword = confirmPasswordRef.current.trim();

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            Alert.alert('Sign Up', "Passwords do not match!");
            return;
        }

        setLoading(true);

        const { data: { session }, error } = await supabase.auth.signUp({
            email,
            password,
            options:{
                data: {
                    name,
                    email
                }
            }
        });
        setLoading(false);

        if (error) {
            Alert.alert('Sign up', error.message);
        }
    }

    return (
        <ScreenWrapper bg="white">
            <StatusBar style="dark" />
            <View style={styles.container}>
                <BackButton router={router} />

                {/* form */}
                <View style={styles.form}>
                    <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                        Please log in credentials
                    </Text>
                    <Input
                        icon={<Icon name="user" size={26} strokeWidth={1.6} />}
                        placeholder='Name'
                        onChangeText={value => nameRef.current = value}
                    />
                    <Input
                        icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
                        placeholder='Email'
                        onChangeText={value => emailRef.current = value}
                    />
                    <Input
                        icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                        placeholder='Password'
                        secureTextEntry
                        onChangeText={value => passwordRef.current = value}
                    />
                    <Input
                        icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                        placeholder='Confirm Password'
                        secureTextEntry
                        onChangeText={value => confirmPasswordRef.current = value}
                    />
                    {/* button */}
                    <Button title={'Sign Up'} loading={loading} onPress={onSubmit} />
                </View>

                {/* footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Already have an account?
                    </Text>
                    <Pressable onPress={() => router.push('login')}>
                        <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>Login</Text>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default SignUp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 20,
        paddingHorizontal: wp(5),
    },
    form: {
        gap: 20,
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
})
