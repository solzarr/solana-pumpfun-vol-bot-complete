import {
    Connection,
    Keypair,
} from '@solana/web3.js';
import bs58 from 'bs58';

//load self module
import { distributeSol } from './src/distributeSol';
import { Data } from './src/utils';
import { readJson } from './src/utils';
import { PRIVATE_KEY, RPC_ENDPOINT, DISTRIBUTENUM, BASEMINT } from './src/constants';
import { buyAndSell } from './src/buyAndSell';


const feePayer = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

const main = async () => {

    const data: Data[] = readJson();

    let allKp: Keypair[] = [];
    let distributeSuccess;
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    // const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    while (1) {
        distributeSuccess = await distributeSol(connection, feePayer, DISTRIBUTENUM);
        if (distributeSuccess) { break }
    }

    for (let i = 0; i < data.length; i++) {
        allKp.push(Keypair.fromSecretKey(bs58.decode(data[i].privateKey)))
    }

    while (1) {
        await buyAndSell(allKp);
    }
};

main();






// [
//   {
//     "privateKey": "5aQ65EKUgaFVCC4YT8qFCPCXfc6EUAhcXxECak7B4u1UCTYUCKTHT2WXDmUVk2oohNxGurexvfVGBn4auZibt68M",
//     "pubkey": "F4KyQPP8aEvEiJvUW3noQZSnvgveXoKssL4pjw7ZPcVb"
//   },
//   {
//     "privateKey": "45nJmwbGmCsfFbdHugKu7SCAtFxyQWDHgWxdSVd2wvjAzJxkan61ZiNKmUQxBUDQ5qYKsqbQQc8GkUuyn9G1Skm2",
//     "pubkey": "hV5earwErZMMeqs46USFFPARR7oMxcYtESq2pSCm5kG"
//   },
//   {
//     "privateKey": "3oZCivBKifWoviJDeqXnf2E7txz9hC5vbqrZ9wubmFfidR67rHU7LS989p93HtBqr4CDgCiRVaBdPvTd2TDUrNbk",
//     "pubkey": "mZRHSZMUm95YFLvCRfckVatLHXsFDmLhNmYrHmCWYK4"
//   },
//   {
//     "privateKey": "4ixpKY4YTQ1djt61R4TicDVWCUPtXnvFAQKHPrZW4HHtAEQRdukvQFJePUisaqNu5jTuqWhzGwEci8zHgxGBMqHb",
//     "pubkey": "49HXXPNCfju37jx22DxWWBtkmki4qCbKCqAq3YeA2a8H"
//   },
//   {
//     "privateKey": "3989xjVkAZrm7NrV5Qv6haHS89JvfE67xA7Zfqt1hmfgEvzvisrkc2mNHk3nPHGEc7TwAD7wfmJ3kfC4erRAJux7",
//     "pubkey": "Awt5M3beL94W4M64Bn9E8bDgse7n6TJfKaKwaMM1S6Ew"
//   }
// ]

