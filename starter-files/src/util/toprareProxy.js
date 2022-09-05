require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require("../abi/toprareProxy-abi.json");
const contractAddress = "0xd93e10d60225188537C73De0a0A32ACbAd111f89";

export const toprareProxyContract = new web3.eth.Contract(
    contractABI,
    contractAddress
);


export const loadBoxList = async (session) => { 
    const list = await toprareProxyContract.methods.getList(session, 0, 10).call();
    return list;
};

export const getCurrrentSession = async () => {
    const session = await toprareProxyContract.methods.TotalSession().call();
    return session;
};

export const getProxyAddress = async () => {
    return contractAddress;
}

export const getBoxInfo = async (session) => {
    const boxInfo = await toprareProxyContract.methods.getBoxesInfo(session).call();
    return boxInfo;
}

export const openBox = async (address, session, duration, price) => {

    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        data: toprareProxyContract.methods.openSpot(session, duration, price).encodeABI(),
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

export const initBox = async (address) => { 

    //set up transaction parameters
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        data: toprareProxyContract.methods.setNewSpot().encodeABI(),
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

};