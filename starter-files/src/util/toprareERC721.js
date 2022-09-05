require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require("../abi/toprareERC721-abi.json");
const contractAddress = "0xbcf6F78f825C4485c746e84fED7B7e574008945e";

export const toprareERC721Contract = new web3.eth.Contract(
    contractABI,
    contractAddress
);

export const getTokenURI = async (address, tokenId) => {
    const c = new web3.eth.Contract(
        contractABI,
        address
    );
    const uri = await c.methods.tokenURI(tokenId).call();
    return uri;
}

export const safeMintNFT = async (address, proxyAddress, level, session) => {
    const uri = 'https://hugi37q26wgrwiyayewbq7iipqrjkwmnugdvgmqy3oym2llvp6pa.arweave.net/PQyN_hr1jRsjAMEsGH0IfCKVWY2hh1MyGNuwzS11f54'
    //set up transaction parameters

    const data = web3.eth.abi.encodeParameters(['uint16', 'uint32'], [level, session])

    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        data: toprareERC721Contract.methods.safeMint(proxyAddress, uri, data).encodeABI(),
    };

     //sign the transaction
     try {
        const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
        });
        return {
        status: (
            <span>
            ✅{" "}
            <a target="_blank" href={`https://goerli.etherscan.io/tx/${txHash}`}>
                View the status of your transaction on Etherscan!
            </a>
            <br />
            ℹ️ Once the transaction is verified by the network, the message will
            be updated automatically.
            </span>
        ),
        };
    } catch (error) {
        return {
        status: "😥 " + error.message,
        };
    }

}

