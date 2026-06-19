import { TouchableOpacity, Text } from 'react-native';
import { styles } from './style';

export default function Button({ title, onPress }: any) {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}