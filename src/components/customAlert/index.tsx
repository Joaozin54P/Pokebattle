import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { styles } from './style';

type Props = {
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    onConfirm: () => void;
};

export default function CustomAlert({
    visible,
    type,
    title,
    message,
    onConfirm,
}: Props) {
    const isSuccess = type === 'success';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>

                    <Text style={styles.icon}>
                        {isSuccess ? '🏆' : '🚫'}
                    </Text>

                    <Text
                        style={[
                            styles.title,
                            isSuccess ? styles.success : styles.error,
                        ]}
                    >
                        {title}
                    </Text>

                    <Text style={styles.message}>
                        {message}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            isSuccess ? styles.successButton : styles.errorButton,
                        ]}
                        onPress={onConfirm}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.buttonText}>
                            {isSuccess ? 'CONTINUAR' : 'TENTAR NOVAMENTE'}
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}