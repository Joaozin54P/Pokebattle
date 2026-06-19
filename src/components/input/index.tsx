import { TextInput } from 'react-native';
import { styles } from './style';

export default function Input(props: any) {
    return (
        <TextInput
            {...props}
            style={styles.input}
            placeholderTextColor="#7E8792"
        />
    );
}