import { View } from 'react-native';
import { styles } from './style';

export default function Card({ children }: any) {
    return (
        <View style={styles.card}>
            <View style={styles.topLine} />
            {children}
        </View>
    );
}