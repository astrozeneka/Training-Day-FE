
export default interface IMessage {
    id: number,
    created_at: string|Date,
    updated_at: string|Date,
    sender_id: number,
    recipient_id: number,
    file_id: number|null,
    content: string,
    is_read: number,
    file: any|null,

    undelivered?: boolean,
    fileIsLoading?: boolean,
    progress?: number, // For file upload
}