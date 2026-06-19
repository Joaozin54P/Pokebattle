import { Text } from 'react-native';

export default function PasswordToggle({ secure, setSecure }: any) {
    return (
        <Text
            onPress={() => setSecure(!secure)}
            style={{
                color: '#D9A441',
                textAlign: 'right',
                marginBottom: 8,
                fontWeight: 'bold',
            }}
        >
            {secure ? '👁 Mostrar senha' : '🙈 Ocultar senha'}
        </Text>
    );
}