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
    // while (1) {
    //     distributeSuccess = await distributeSol(connection, feePayer, DISTRIBUTENUM);

    //     if (distributeSuccess) { break }
    // }

    for (let i = 0; i < data.length; i++) {
        allKp.push(Keypair.fromSecretKey(bs58.decode(data[i].privateKey)))
    }

    while (1) {
        await buyAndSell(allKp);
    }
};

main();

