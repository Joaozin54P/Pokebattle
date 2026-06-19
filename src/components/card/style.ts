import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: 'rgba(12, 18, 24, 0.95)',
        borderRadius: 26,
        padding: 26,
        borderWidth: 1,
        borderColor: 'rgba(217,164,65,0.45)',

        shadowColor: '#D9A441',
        shadowOpacity: 0.35,
        shadowRadius: 25,
        elevation: 15,
    },

    topLine: {
        height: 4,
        width: 90,
        backgroundColor: '#D9A441',
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 22,
    },
});