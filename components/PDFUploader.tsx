import { useApp } from '@/contexts/AppContext';
import * as DocumentPicker from 'expo-document-picker';
import { AlertCircle, CheckCircle2, FileText, Upload } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface PDFUploaderProps {
    onUpload: (file: DocumentPicker.DocumentPickerAsset) => Promise<void>;
    isProcessing?: boolean;
}

export default function PDFUploader({ onUpload, isProcessing = false }: PDFUploaderProps) {
    const { theme } = useApp();
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string>('');

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                const file = result.assets[0];
                setSelectedFile(file);
                setUploadStatus('uploading');
                setError('');

                try {
                    await onUpload(file);
                    setUploadStatus('success');
                } catch (err) {
                    setUploadStatus('error');
                    setError(err instanceof Error ? err.message : 'Upload failed');
                }
            }
        } catch (err) {
            setUploadStatus('error');
            setError('Failed to pick document');
        }
    };

    return (
        <View style={styles.container}>
            <Pressable 
                style={[
                    styles.uploadArea,
                    { backgroundColor: theme.card, borderColor: theme.primaryMuted },
                    uploadStatus === 'success' && styles.uploadAreaSuccess,
                    uploadStatus === 'error' && styles.uploadAreaError,
                ]}
                onPress={pickDocument}
                disabled={isProcessing || uploadStatus === 'uploading'}
            >
                <View style={styles.iconContainer}>
                    {uploadStatus === 'uploading' ? (
                        <ActivityIndicator color={theme.primary} size={32} />
                    ) : uploadStatus === 'success' ? (
                        <CheckCircle2 color="#10B981" size={32} strokeWidth={2} />
                    ) : uploadStatus === 'error' ? (
                        <AlertCircle color="#EF4444" size={32} strokeWidth={2} />
                    ) : (
                        <Upload color={theme.primary} size={32} strokeWidth={2} />
                    )}
                </View>

                <Text style={[styles.title, { color: theme.textPrimary }]}>
                    {uploadStatus === 'uploading' ? 'Uploading...' :
                     uploadStatus === 'success' ? 'Upload Successful!' :
                     uploadStatus === 'error' ? 'Upload Failed' :
                     'Upload Academic Planning PDF'}
                </Text>

                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {uploadStatus === 'idle' ? 'Tap to select your academic schedule' :
                     uploadStatus === 'success' ? selectedFile?.name :
                     error || 'Processing your document'}
                </Text>

                {selectedFile && uploadStatus === 'success' && (
                    <View style={[styles.fileInfo, { backgroundColor: theme.background }]}>
                        <FileText color={theme.textTertiary} size={16} />
                        <Text style={[styles.fileName, { color: theme.textPrimary }]} numberOfLines={1}>
                            {selectedFile.name}
                        </Text>
                        <Text style={[styles.fileSize, { color: theme.textSecondary }]}>
                            {(selectedFile.size! / 1024).toFixed(0)} KB
                        </Text>
                    </View>
                )}
            </Pressable>

            {isProcessing && (
                <View style={[styles.processingCard, { backgroundColor: theme.primaryMuted }]}>
                    <ActivityIndicator color={theme.primary} size="small" />
                    <Text style={[styles.processingText, { color: theme.primary }]}>
                        AI is analyzing your planning document...
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    uploadArea: {
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    uploadAreaSuccess: {
        borderColor: '#10B981',
        borderStyle: 'solid',
    },
    uploadAreaError: {
        borderColor: '#EF4444',
        borderStyle: 'solid',
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 8,
    },
    fileName: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    fileSize: {
        fontSize: 12,
        fontWeight: '500',
    },
    processingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
    },
    processingText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
});
