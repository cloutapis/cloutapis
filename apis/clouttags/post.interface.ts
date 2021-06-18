import CloutTag from './clouttag.interface';

interface Post {
    transactionHashHex: string;
    clouttags: [CloutTag]
}
   
export default Post;