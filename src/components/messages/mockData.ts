export type MessageStatus = 'sent' | 'sending' | 'read';

export interface Message {
    id: string;
    text: string;
    isMe: boolean;
    time: string;
    status: MessageStatus;
}

export interface Conversation {
    id: string;
    partnerName: string;
    partnerAvatar: string;
    isOnline: boolean;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    bikeId: string;
    bikeTitle: string;
    bikePrice: string;
    bikeImage: string;
    bikeStatus: 'Đang giao dịch' | 'Đã bán' | 'Còn hàng';
}

export const FAKE_CONVERSATIONS: Conversation[] = [
    {
        id: 'c1',
        partnerName: 'Nguyễn Văn A',
        partnerAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        isOnline: true,
        lastMessage: 'Xe này có bớt được không bạn?',
        lastMessageTime: '10:30',
        unreadCount: 2,
        bikeId: 'b1',
        bikeTitle: 'Xe đạp Giant ATX 720',
        bikePrice: '5.500.000đ',
        bikeImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=100&q=80',
        bikeStatus: 'Còn hàng'
    },
    {
        id: 'c2',
        partnerName: 'Trần Thị B',
        partnerAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026703d',
        isOnline: false,
        lastMessage: 'Ok mình chốt nhé, chiều qua lấy',
        lastMessageTime: 'Hôm qua',
        unreadCount: 0,
        bikeId: 'b2',
        bikeTitle: 'Xe đạp đua Trek Emonda',
        bikePrice: '12.000.000đ',
        bikeImage: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=100&q=80',
        bikeStatus: 'Đang giao dịch'
    },
    {
        id: 'c3',
        partnerName: 'Lê Văn C',
        partnerAvatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
        isOnline: false,
        lastMessage: 'Xe đẹp quá nhưng mình hết tiền rồi hic',
        lastMessageTime: 'Thứ 2',
        unreadCount: 0,
        bikeId: 'b3',
        bikeTitle: 'Xe đạp Fixed Gear',
        bikePrice: '2.500.000đ',
        bikeImage: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=100&q=80',
        bikeStatus: 'Đã bán'
    }
];

export const getMessagesForChat = (chatId: string): Message[] => {
    const defaultMessages: Message[] = [
        { id: 'm1', text: 'Chào bạn, xe này còn không?', isMe: false, time: '10:00', status: 'read' },
        { id: 'm2', text: 'Chào bạn, xe vẫn còn nhé.', isMe: true, time: '10:15', status: 'read' },
    ];

    if (chatId === 'c1') {
        return [
            ...defaultMessages,
            { id: 'm3', text: 'Xe này có bớt được không bạn?', isMe: false, time: '10:30', status: 'sent' }
        ];
    }

    if (chatId === 'c2') {
        return [
            { id: 'm1', text: 'Bạn fix giá 11tr được không?', isMe: false, time: 'Hôm qua 15:00', status: 'read' },
            { id: 'm2', text: 'Không được bạn ơi, xe còn rất mới.', isMe: true, time: 'Hôm qua 15:30', status: 'read' },
            { id: 'm3', text: 'Ok mình chốt nhé, chiều qua lấy', isMe: false, time: 'Hôm qua 16:00', status: 'read' }
        ];
    }

    return defaultMessages;
};
