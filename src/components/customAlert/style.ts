import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.82)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },

    alertBox: {
        width: '100%',
        maxWidth: 330,
        backgroundColor: '#08121E',
        borderRadius: 26,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 20,
    },

    icon: {
        fontSize: 50,
        marginBottom: 12,
    },

    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 10,
        textAlign: 'center',
    },

    success: {
        color: '#D9A441',
    },

    error: {
        color: '#FF4D4D',
    },

    message: {
        color: '#C9D1D9',
        textAlign: 'center',
        fontSize: 15,
        marginBottom: 24,
        lineHeight: 22,
    },

    button: {
        width: '100%',
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
    },

    successButton: {
        backgroundColor: '#D9A441',
    },

    errorButton: {
        backgroundColor: '#FF4D4D',
    },

    buttonText: {
        color: '#07111C',
        fontWeight: '900',
        letterSpacing: 1.5,
    },
});