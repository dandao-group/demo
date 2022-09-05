require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require("../abi/toprareMain-abi.json");
const contractAddress = "0xEbe33e28aeb0a234dad10552AaBF9CFFce727737";

export const toprareMainContract = new web3.eth.Contract(
    contractABI,
    contractAddress
);

export const loadGameList = async () => { 
    const list = await toprareMainContract.methods.list(0,10).call();
    return list;
};

export const bouncePayment = async (address, id, session) => {

    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        data: toprareMainContract.methods.bouncePay(id, session).encodeABI(),
        value: "100000"//web3.utils.toWei("1", "ether"),
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