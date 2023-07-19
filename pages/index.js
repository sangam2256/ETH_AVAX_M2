import {useState,useEffect} from "react";
import {ethers} from "ethers";
import crypto_making_tree_abi from "../artifacts/contracts/MySmartContract.sol/SmartContract_with_Front_end_interaction.json";

export default function Homepage() {

    const [meMessage,setMeMessage] = useState("Account Holder Name : Sangam ");
    const [defaultAccount,setDefaultAccount] = useState(undefined);
    const [balance,setBalance] = useState(undefined);
    const [ethWallet,setEthWallet] = useState(undefined); 
    const [mysmartcontract,setMysmartcontract] = useState(undefined); // it is the mysmartcontract
    
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const smcABI = crypto_making_tree_abi.abi;

    const getBalance = async() => {
        if(mysmartcontract) {
            setBalance( (await mysmartcontract.getBalance()).toNumber());
        }
    }

    const deposit = async() => {
        if(mysmartcontract) {
            let tx = await mysmartcontract.Deposite(1);
            await tx.wait();
            getBalance();
        }
    }
    const withdraw = async() => {
        if (mysmartcontract) {
            let tx = await mysmartcontract.Withdraw(1);
            await tx.wait();
            getBalance();
        }
    }
    const TransferFunds = async() => {
        if (mysmartcontract) {
          let tx = await mysmartcontract.TransferFunds("0x976EA74026E726554dB657fA54763abd0C3a0aa9", 1);
          await tx.wait()
          getBalance();
        }
      }
    
      const DisplayAddress  = async() => {
        if (mysmartcontract) {
          let tx = await mysmartcontract.DisplayAddress();
          await tx.wait()
          ;
        }
      }

    const getWallet = async() => {
        if(window.ethereum){
            setEthWallet(window.ethereum);
            console.log("getwallet is executed");
        }
        

        if(ethWallet){
            const account = await ethWallet.request({method: "eth_accounts"});
            accountHandler(account);
        }
    }

    const accountHandler = async(accounts) => {
        if(accounts){
            console.log("Account connected =",accounts);
            setDefaultAccount(accounts);
        }
        else {
            console.log("No Account Found");
        }
    }

    const connectWallettHandler = async() => {
        if(!ethWallet){
            alert("MetaMask Wallet is required to Connect");
            return;
        }
        

        const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });

        accountHandler(accounts);

        getMyContract();
    }
    
    const getMyContract = async() => {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, smcABI, signer);

        setMysmartcontract(contract);
    }

    const initUser = () => {
        if(!ethWallet){
            return <p>Please Install the MetaMask extension in your Browser</p>;
        }
        if(!defaultAccount){
            return (<button onClick={connectWallettHandler}><h3>"Connect With Your Wallet"</h3></button>)
        }

        getBalance();

        return (
            <div>
                <p>Your Account : {defaultAccount}</p>
                <p>Your Balance : {balance}</p>
                <button onClick={DisplayAddress}><h3 >Address Check</h3></button>
                <button onClick={deposit}><h3 >Deposit 1 ETH</h3></button>
                <button onClick={withdraw}><h3>Withdraw 1 ETH</h3></button>
                <button onClick={TransferFunds}><h3>TransferFunds 1 ETH</h3></button>
            </div>
        )
    }

    useEffect(() => {getWallet();}, []);

    return (
      <main className="sangam">
        <h1><marquee width="60%" direction="left" height="80%">Welcome to Sangam's Crypto Bank ATM!</marquee></h1>
        <h2>{meMessage}</h2>
        {initUser()}
        <style jsx>{`
            .sangam {
            width: 1500px;
            height: 800px;
            background-color:pink;
            text-align: center;
            color:  blue;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        `}
        </style>
      </main>
    )    
}