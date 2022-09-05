require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require("../abi/toprareERC20-abi.json");
const contractAddress = "0x9f43E03F74388cb301895457B670a21928cC74C9";

export const toprareERC20Contract = new web3.eth.Contract(
    contractABI,
    contractAddress
);


export const loadBalance = async (address) => {
    const balance = await toprareERC20Contract.methods.balanceOf(address).call();
    return balance;
}

export const loadPrice = async () => {
    const price = await toprareERC20Contract.methods.ticketPrice().call();
    return price;
}

export const buyTickets = async (address, amount, price) => {

    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        value: web3.utils.numberToHex(web3.utils.toWei((amount*price).toString(), "wei")),
        data: toprareERC20Contract.methods.buyTickets(amount).encodeABI(),
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
            <a target="_blank" href={`https://rinkeby.etherscan.io/tx/${txHash}`}>
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