import { Client, Storage, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('69f2f7b0003de9dfaeea'); // Your project ID

const storage = new Storage(client);

/**
 * Uploads a video file to Appwrite Storage
 * @param {File} file - The video file to upload
 * @param {string} bucketId - The Appwrite Bucket ID
 * @returns {Promise<string>} - The direct URL to the uploaded file
 */
export const uploadVideoToAppwrite = async (file, bucketId = '69f2f87b001a641b3d8b') => {
    try {
        const response = await storage.createFile(
            bucketId,
            ID.unique(),
            file
        );

        // Construct the file URL
        // Format: https://[ENDPOINT]/storage/buckets/[BUCKET_ID]/files/[FILE_ID]/view?project=[PROJECT_ID]
        const fileUrl = `${client.config.endpoint}/storage/buckets/${bucketId}/files/${response.$id}/view?project=${client.config.project}`;
        
        return fileUrl;
    } catch (error) {
        console.error('Appwrite Upload Error:', error);
        throw error;
    }
};

export { client, storage };
