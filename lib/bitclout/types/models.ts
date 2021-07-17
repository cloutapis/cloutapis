export interface User {
    publicKey: string;
}

export interface CoinEntry {
    BitCloutLockedNanos: number
    CoinWatermarkNanos: number;
    CoinsInCirculationNanos: number;
    CreatorBasisPoints: number;
}

export interface User {
    BalanceNanos: number;
    BlockedPubKeys: any;
    CanCreateProfile: boolean;
    HasPhoneNumber: boolean;
    IsAdmin: boolean;
    ProfileEntryResponse: Profile;
    PublicKeyBase58Check: string;
    PublicKeysBase58CheckFollowedByUser: string[];
    UsersWhoHODLYou: CreatorCoinHODLer[];
    UsersYouHODL: CreatorCoinHODLer[];
}

export interface Profile {
    ProfilePic: string;
    Username: string;
    Description: string;
    PublicKeyBase58Check: string;
    CoinPriceBitCloutNanos: number;
    CoinEntry: CoinEntry;
    IsVerified: boolean;
    CoinPriceUSD?: number;
    FormattedCoinPriceUSD?: string;
    Posts: Post[];
    UsersThatHODL?: CreatorCoinHODLer[];
}

export interface PostReaderState {
    LikedByReader: boolean;
    RecloutedByReader: boolean;
    RecloutPostHashHex?: string;
    DiamondLevelBestowed: number;
}

export interface PostExtraData {
    EmbedVideoURL: string;
}

export interface Post {
    PostHashHex: string;
    Body: string;
    ImageURLs: string[];
    TimestampNanos: number;
    ProfileEntryResponse: Profile;
    LikeCount: number;
    PostEntryReaderState: PostReaderState;
    CommentCount: number;
    Comments: Post[];
    RecloutCount: number;
    RecloutedPostEntryResponse: Post;
    DiamondCount: number;
    ParentStakeID: string;
    PostExtraData: PostExtraData;
    ConfirmationBlockHeight: number;
    CreatorBasisPoints: number;
    InGlobalFeed: boolean;
    InMempool: boolean;
    IsHidden: boolean;
    IsPinned: boolean;
    ParentPosts: Post;
    PosterPublicKeyBase58Check: string;
    StakeMultipleBasisPoints: number;
}

export enum NotificationType {
    SubmitPost = 'SUBMIT_POST',
    BasicTransfer = 'BASIC_TRANSFER',
    CreatorCoin = 'CREATOR_COIN',
    Follow = 'FOLLOW',
    Like = 'LIKE',
    CreatorCoinTransfer = 'CREATOR_COIN_TRANSFER'
}

export interface NotificationLikeMetaData {
    IsUnlike: boolean;
    PostHashHex: string;
}

export interface NotificationFollowMetaData {
    IsUnfollow: boolean;
}

export interface NotificationSubmitPostMetaData {
    ParentPostHashHex: string;
    PostHashBeingModifiedHex: string;
}

export interface NotificationCreatorCoinMetaData {
    BitCloutToAddNanos: number;
    BitCloutToSellNanos: number;
    CreatorCoinToSellNanos: number;
    OperationType: string;
}

export interface NotificationCreatorCoinTransferMetaData {
    CreatorCoinToTransferNanos: number;
    CreatorUsername: string;
    DiamondLevel: number;
    PostHashHex: string;
}

export interface NotificationTransactionOutputResponse {
    AmountNanos: number;
    PublicKeyBase58Check: string;
}

export interface NotificationMetaData {
    TxnType: NotificationType;
    TransactorPublicKeyBase58Check: string;
    CreatorCoinTxindexMetadata?: NotificationCreatorCoinMetaData;
    SubmitPostTxindexMetadata?: NotificationSubmitPostMetaData;
    FollowTxindexMetadata?: NotificationFollowMetaData;
    LikeTxindexMetadata?: NotificationLikeMetaData;
    CreatorCoinTransferTxindexMetadata?: NotificationCreatorCoinTransferMetaData;
}

export interface Notification {
    Index: number;
    Metadata: NotificationMetaData;
    TxnOutputResponses: NotificationTransactionOutputResponse[];
}

export interface CreatorCoinHODLer {
    BalanceNanos: number;
    CreatorPublicKeyBase58Check: string;
    HODLerPublicKeyBase58Check: string;
    ProfileEntryResponse: Profile;
    HasPurchased: boolean;
}

export interface ContactWithMessages {
    Messages: Message[];
    NumMessagesRead: number;
    ProfileEntryResponse: Profile;
    PublicKeyBase58Check: string;
    CreatorCoinHoldingAmount?: number;
    UnreadMessages?: boolean;
}

export interface Message {
    DecryptedText?: string,
    EncryptedText: string;
    IsSender: boolean;
    RecipientPublicKeyBase58Check: string;
    SenderPublicKeyBase58Check: string;
    TstampNanos: number;
    LastOfGroup?: boolean;
    V2: boolean;
}

export interface DiamondSender {
    HighestDiamondLevel: number;
    ProfileEntryResponse: Profile;
    ReceiverPublicKeyBase58Check: string;
    SenderPublicKeyBase58Check: string;
    TotalDiamonds: string;
}

export interface CreatorCoinTransaction {
    transactorPublicKey: string;
    coinsInCirculation: number,
    coinsChange: number,
    coinPrice: number,
    bitcloutValue: number,
    usdValue: number;
    timeStamp: number
}

export interface CloutTag {
    clouttag: string;
    count: number;
}