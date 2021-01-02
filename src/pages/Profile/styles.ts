import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px;
`;

export const Title = styled.Text`
  font-size: 20px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0;
`;

export const AvatarProfileButton = styled.TouchableOpacity`
  margin-top: 32px;
`;

export const AvatarProfile = styled.Image`
    width: 130px;
    height: 130px;
    border-radius: 98px;
    align-self: center;
`;

export const BackButton = styled.TouchableOpacity`
  
`;