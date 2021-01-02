import React, { useRef, useCallback } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import Icon from 'react-native-vector-icons/Feather';

import * as Yup from 'yup';

import api from '../../services/api';

import { useNavigation } from '@react-navigation/native';

import Input from '../../components/Input';
import Button from '../../components/Button';

import getValidationErrors from '../../utils/getValidationErrors';

import { useAuth } from '../../hooks/auth';

import { Container, Title, AvatarProfileButton, AvatarProfile, BackButton } from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  old_password: string;
}

const Profile: React.FC = () => {
  const navigation = useNavigation();
  const { user, signOut, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);

  const inputEmailRef = useRef<TextInput>(null);
  const inputPasswordRef = useRef<TextInput>(null);
  const oldPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation])

  const handleSignUp = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório'),
          email: Yup.string()
            .required('E-mail é obrigatório')
            .email('Digite um e-mail válido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (val) => val !== '' && val !== undefined,
            then: Yup.string().required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: (val) => val !== '' && val !== undefined,
              then: Yup.string().required('Campo obrigatório'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), null], 'Confirmação Incorreta'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(data.old_password
            ? {
              old_password,
              password,
              password_confirmation,
            }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro ao atualizar perfil'
        );
      }
    },
    [],
  );

  const handleLogout = useCallback(() => {
    signOut()
  }, [signOut])

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}>

          <Container>
            <BackButton onPress={handleBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <AvatarProfileButton onPress={() => { }}>
              <AvatarProfile source={{ uri: user.avatar_url ?? `https://ui-avatars.com/api/?name=${user.name}` }} />
            </AvatarProfileButton>

            <View>
              <Title>Meu Perfil</Title>
            </View>

            <Form initialData={user} ref={formRef} onSubmit={handleSignUp}>
              <Input
                name="name"
                icon="user"
                placeholder="Nome"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => {
                  inputEmailRef.current?.focus();
                }}
              />

              <Input
                ref={inputEmailRef}
                name="email"
                icon="mail"
                placeholder="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => {
                  oldPasswordRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordRef}
                name="old_password"
                icon="lock"
                placeholder="Senha Atual"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="next"
                textContentType="none"
                containerStyle={{ marginTop: 15 }}
                onSubmitEditing={() => {
                  inputPasswordRef.current?.focus();
                }}
              />

              <Input
                ref={inputPasswordRef}
                name="password"
                icon="lock"
                placeholder="Nova Senha"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="next"
                textContentType="none"
                onSubmitEditing={() => {
                  confirmPasswordRef.current?.focus();
                }}
              />

              <Input
                ref={confirmPasswordRef}
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar Senha"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="send"
                textContentType="none"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />
            </Form>

            <Button onPress={() => formRef.current?.submitForm()}>Confirmar</Button>
          </Container>

        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
