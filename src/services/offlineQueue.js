import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API_BASE } from '../api';

const OFFLINE_QUEUE_KEY = 'OFFLINE_RECORDING_QUEUE';

/**
 * Offline Queue Service for SpeechTrack
 * 
 * Handles queuing recordings when offline and syncing when connectivity returns.
 * PRD Requirement: "Use best practices to queue recordings locally and upload when
 * connectivity is restored."
 */

class OfflineQueueService {
    constructor() {
        this._isProcessing = false;
        this._listeners = new Set();
        this._unsubscribeNetInfo = null;
    }

    /**
     * Initialize the service and start listening for network changes
     */
    init() {
        if (this._unsubscribeNetInfo) return; // Already initialized

        this._unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                this.processQueue();
            }
        });

        // Process any pending items on init
        this.processQueue();
    }

    /**
     * Cleanup listeners
     */
    destroy() {
        if (this._unsubscribeNetInfo) {
            this._unsubscribeNetInfo();
            this._unsubscribeNetInfo = null;
        }
    }

    /**
     * Add a listener for queue changes
     * @param {Function} callback - Called with queue items array
     * @returns {Function} Unsubscribe function
     */
    addListener(callback) {
        this._listeners.add(callback);
        this._notifyListeners();
        return () => this._listeners.delete(callback);
    }

    async _notifyListeners() {
        const items = await this.getQueue();
        this._listeners.forEach(cb => cb(items));
    }

    /**
     * Get all pending items in the queue
     * @returns {Promise<Array>} Queue items
     */
    async getQueue() {
        try {
            const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[OfflineQueue] Failed to get queue:', error);
            return [];
        }
    }

    /**
     * Add a recording to the offline queue
     * @param {Object} recording - Recording data to queue
     * @param {string} recording.uri - Local URI of the recording
     * @param {number} recording.childId - Child ID the recording belongs to
     * @param {string} recording.childName - Child name (for display)
     * @param {number} recording.duration - Recording duration in seconds
     * @param {Date} recording.recordedAt - When the recording was made
     */
    async addToQueue(recording) {
        try {
            const queue = await this.getQueue();
            const item = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...recording,
                recordedAt: recording.recordedAt || new Date().toISOString(),
                status: 'pending',
                attempts: 0,
                lastError: null,
            };
            queue.push(item);
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            console.log('[OfflineQueue] Added recording to queue:', item.id);
            this._notifyListeners();

            // Try to process immediately if online
            this.processQueue();

            return item;
        } catch (error) {
            console.error('[OfflineQueue] Failed to add to queue:', error);
            throw error;
        }
    }

    /**
     * Remove an item from the queue
     * @param {string} itemId - ID of the item to remove
     */
    async removeFromQueue(itemId) {
        try {
            const queue = await this.getQueue();
            const filtered = queue.filter(item => item.id !== itemId);
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
            this._notifyListeners();
        } catch (error) {
            console.error('[OfflineQueue] Failed to remove from queue:', error);
        }
    }

    /**
     * Update an item's status in the queue
     */
    async _updateItemStatus(itemId, updates) {
        try {
            const queue = await this.getQueue();
            const index = queue.findIndex(item => item.id === itemId);
            if (index !== -1) {
                queue[index] = { ...queue[index], ...updates };
                await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
                this._notifyListeners();
            }
        } catch (error) {
            console.error('[OfflineQueue] Failed to update item:', error);
        }
    }

    /**
     * Process all pending items in the queue
     * @param {string} token - Auth token for API calls
     */
    async processQueue(token = null) {
        // Prevent concurrent processing
        if (this._isProcessing) return;

        // Check connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            console.log('[OfflineQueue] Offline, skipping queue processing');
            return;
        }

        this._isProcessing = true;
        console.log('[OfflineQueue] Processing queue...');

        try {
            const queue = await this.getQueue();
            const pendingItems = queue.filter(item =>
                item.status === 'pending' || item.status === 'failed'
            );

            if (pendingItems.length === 0) {
                console.log('[OfflineQueue] No pending items');
                return;
            }

            console.log(`[OfflineQueue] Processing ${pendingItems.length} items`);

            for (const item of pendingItems) {
                if (item.attempts >= 3) {
                    console.log(`[OfflineQueue] Skipping item ${item.id} - max attempts reached`);
                    continue;
                }

                try {
                    await this._uploadItem(item, token);
                    await this.removeFromQueue(item.id);
                    console.log(`[OfflineQueue] Successfully uploaded item ${item.id}`);
                } catch (error) {
                    console.error(`[OfflineQueue] Failed to upload item ${item.id}:`, error);
                    await this._updateItemStatus(item.id, {
                        status: 'failed',
                        attempts: item.attempts + 1,
                        lastError: error.message,
                    });
                }
            }
        } finally {
            this._isProcessing = false;
        }
    }

    /**
     * Upload a single queued item
     */
    async _uploadItem(item, token) {
        if (!token) {
            throw new Error('No auth token available');
        }

        await this._updateItemStatus(item.id, { status: 'uploading' });

        const formData = new FormData();

        // Fetch the recording from local storage
        const response = await fetch(item.uri);
        const blob = await response.blob();

        const filename = `recording_${Date.now()}.wav`;
        formData.append('file', blob, filename);

        const uploadResponse = await fetch(
            `${API_BASE}/recordings/?child_id=${item.childId}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}));
            throw new Error(errorData.detail || `Upload failed: ${uploadResponse.status}`);
        }

        return uploadResponse.json();
    }

    /**
     * Get count of pending items
     */
    async getPendingCount() {
        const queue = await this.getQueue();
        return queue.filter(item => item.status !== 'uploaded').length;
    }

    /**
     * Clear all items from the queue (use with caution)
     */
    async clearQueue() {
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
        this._notifyListeners();
    }
}

// Export singleton instance
const offlineQueue = new OfflineQueueService();
export default offlineQueue;
