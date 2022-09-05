import React from "react";
import { useEffect, useState } from "react";
import {
  helloWorldContract,
  connectWallet,
  updateMessage,
  loadCurrentMessage,
  getCurrentWalletConnected,
} from "./util/interact.js";

import {
  loadGameList,
  bouncePayment,
} from "./util/toprareMain.js";

import {
  loadBoxList,
  initBox,
  getCurrrentSession,
  getProxyAddress,
  getBoxInfo,
  openBox,
} from "./util/toprareProxy.js";

import {
  safeMintNFT,
  getTokenURI,
} from "./util/toprareERC721.js";

import {
  loadBalance,
  buyTickets,
  loadPrice,
} from "./util/toprareERC20.js";

import alchemylogo from "./alchemylogo.svg";
import { PhotoProvider, PhotoView } from 'react-photo-view';


const HelloWorld = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("No connection to the network."); //default message
  const [newMessage, setNewMessage] = useState("");
  const [gameList, setGameList] = useState([]);
  const [boxList, setBoxList] = useState([]);
  const [boxInfo, setBoxInfo] = useState([]);
  //cosnt [session, setSession] = useState(0);
  const [tickets, setTickets] = useState(0);

  //called only once
  useEffect(() => {
    async function fetchMessage() {
      const message = await loadCurrentMessage();
      setMessage(message);
    }
    fetchMessage();
    addSmartContractListener();

    async function fetchWallet() {
      const {address, status} = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status); 
    }
    fetchWallet();
    addWalletListener();

    async function fetchGameList() {
      const gameList = await loadGameList();
      console.log(gameList);
      setGameList(gameList);
    }
    fetchGameList();

    async function fetchBoxInfo() {
      const boxInfo = await getBoxInfo(0);
      console.log(boxInfo);
      setBoxInfo(boxInfo);
    }
    fetchBoxInfo();

  
  }, []);

  function addSmartContractListener() { //TODO: implement
    helloWorldContract.events.UpdatedMessages({}, (error, data) => {
      if (error) {
        setStatus("😥 " + error.message);
      } else {
        setMessage(data.returnValues[1]);
        setNewMessage("");
        setStatus("🎉 Your message has been updated!");
      }
    });
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 填写一个游戏合约地址根据游戏列表.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

  const imageURL = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60";

  const connectWalletPressed = async () => { //TODO: implement
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onUpdatePressed = async () => {
    const session = await getCurrrentSession();
    if (session === '0') {
        await initBox(walletAddress);
    } else {
        const boxList = await loadBoxList(0);
        var resp = [{}];
        boxList.forEach(async (box, index, group) => {
            if (box.addr !== '0x0000000000000000000000000000000000000000') {
              const tokenURI = await getTokenURI(box.addr, box.tokenId);
              var client = new HttpClient();
              client.get(tokenURI, function(response) {
                var obj = JSON.parse(response) 
                const newObj = Object.assign({image: obj.image}, group[index]);
                resp.push(newObj);
              });    
            }
            if (box.state !== 3) {
              resp.push(box);
            }
        });
        console.log(resp);
        setBoxList(boxList);
    }
    setStatus("🎉 哇哦😮,你选择了一个游戏来play!");
    const balance = await loadBalance(walletAddress);
    setTickets(balance);
  };

  const onMintPressed = async () => {
    const proxyAddress = await getProxyAddress();
    console.log(proxyAddress);
    const { status } = await safeMintNFT(walletAddress, proxyAddress, 15, 0);
    setStatus(status);
  };

  const onMintPressedFinal = async () => {
    const proxyAddress = await getProxyAddress();
    console.log(proxyAddress);
    await safeMintNFT(walletAddress, proxyAddress, 1, 0);
  };

  const openABox = async () => {
    const { status } = await openBox(walletAddress, 0, 86401,1);
    setStatus(status);
    const boxInfo = await getBoxInfo(0);
    setBoxInfo(boxInfo);
  };

  const bouncePaymentPressed = async () => {
    const { status } = await bouncePayment(walletAddress, 0, 0);
    setStatus(status);
  };

  const buyTicketsPressed = async () => {
    const price = await loadPrice();
    const { status } = await buyTickets(walletAddress, 10, price);
    setStatus(status);
    const balance = await loadBalance(walletAddress);
    setTickets(balance);
  }

  //the UI of our component
  return (
    <div id="container">
      <img id="logo" src={alchemylogo}></img>
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <h2 style={{ paddingTop: "50px" }}>游戏列表:</h2>
      <div>
        <ul>
          {
            gameList.map(function (value, key) {
              return (<li key={key}>name:{value.name} spot:{value.spot}</li>);
            })
          }
        </ul>
      </div>
      
      <h2 style={{ paddingTop: "18px" }}>NFT列表:</h2> 

      <div>
        <input
          type="text"
          placeholder="填写游戏合约(spot)地址"
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
        />
        <p id="status">{status}</p>

        <button id="publish" onClick={onUpdatePressed}>
          刷新
        </button>
        <button id="publish" onClick={buyTicketsPressed}>
          购票
        </button>
        <button id="transfer" onClick={onMintPressed}>
          移入nft
        </button>
      </div>

      <p>票数: {tickets} </p>
      
      <h2 style={{ paddingTop: "50px" }}>宝物列表:</h2>

      <div>
        <PhotoProvider>
          <div className="foo">
            {boxList.map((item, index) => (
              <PhotoView key={index} src={imageURL}>
                <img src={imageURL} alt="" width='100px' height='100px' />
              </PhotoView>
            ))}
          </div>
        </PhotoProvider>
      </div>

      <h2 style={{ paddingTop: "50px" }}>游戏状态:</h2>
      <p>状态: {boxInfo.step} </p>
      <p>开始时间: {boxInfo.begin} </p>
      <p>结束时间: {boxInfo.end} </p>
      <p>抽一次需要票数: {boxInfo.price}  </p>
      <p>剩余nft未抽: {boxInfo.remain} </p>


      <h2 style={{ paddingTop: "50px" }}>操作:</h2>



      <button id="transfer" onClick={onMintPressedFinal}>
          移入最终赏
      </button>

      <button id="opengame" onClick={openABox}>
          开始游戏
      </button>

      <button id="bounce" onClick={bouncePaymentPressed}>
          抽奖付费
      </button>

      <button id="bounce" onClick={onUpdatePressed}>
          抽奖付票
      </button>

    </div>
  );
};

export default HelloWorld;
