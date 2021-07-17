import dotenv from 'dotenv'
dotenv.config({path: "./../.env"});


import {signing} from './signing.js';
import axios from 'axios'; 

const API_HOST = "https://bitclout.com/api/v0";

const {BITCLOUT_PUBLIC_KEY} = process.env;

async function sendPrivateMessage(text, RecipientPublicKeyBase58Check) {
  try {

    let TstampNanos = new Date().getTime() * 1000000;
    console.log("encrypting message");
    const encryptedMessage = await signing.encryptShared(RecipientPublicKeyBase58Check, text);

    // send message

    console.log("sending message...");
    let tt = {
      EncryptedMessageText: encryptedMessage,
      MinFeeRateNanosPerKB: 1000,
      RecipientPublicKeyBase58Check,
      SenderPublicKeyBase58Check: BITCLOUT_PUBLIC_KEY
    };

    console.dir(tt);

    let sendMsg = await axios.post(`${API_HOST}/send-message-stateless`, tt, {
      headers: { 
        'Referer': 'https://bitclout.com/', 
        'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept', 
        'Accept': 'application/json, text/plain, */*', 
        'Accept-Encoding': 'gzip, deflate, br', 
        'accept-language': 'en-US,en;q=0.9', 
        'origin': 'https://bitclout.com', 
        'sec-fetch-dest': 'empty', 
        'sec-fetch-mode': 'cors', 
        'sec-fetch-site': 'same-site', 
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36 Edg/89.0.774.77', 
        'Content-Type': 'application/json', 
      }
    })
    ;

    // sign tx

    console.log("signing txo...");
    let tHex = sendMsg.data.TransactionHex;
    const signedTransactionHex = await signing.signTransaction(tHex);


    // send tx
    let submittedTransaction = await axios.post(`${API_HOST}/submit-transaction`, {
      TransactionHex: signedTransactionHex
    }, {
      headers: { 
        'Referer': 'https://bitclout.com/', 
        'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept', 
        'Accept': 'application/json, text/plain, */*', 
        'Accept-Encoding': 'gzip, deflate, br', 
        'accept-language': 'en-US,en;q=0.9', 
        'origin': 'https://bitclout.com', 
        'sec-fetch-dest': 'empty', 
        'sec-fetch-mode': 'cors', 
        'sec-fetch-site': 'same-site', 
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36 Edg/89.0.774.77', 
        'Content-Type': 'application/json', 
      }
    }); 

    console.log("sent a message to " + RecipientPublicKeyBase58Check);
    return true;

  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

export default sendPrivateMessage;