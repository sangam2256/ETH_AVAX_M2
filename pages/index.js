import { useState, useEffect } from "react";
import { ethers } from "ethers";
import BikeSharingSystemAbi from "../artifacts/contracts/BikeSharingSystem.sol/BikeSharingSystem.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [BikeSharingSystem, setBikeSharingSystem] = useState(undefined);
  const [bikeAvailability, setBikeAvailability] = useState({});
  const [message, setMessage] = useState("");
  const [bikeModel, setBikeModel] = useState("");
  const [bikeId, setBikeId] = useState("");

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Update with your contract address
  const BikeSharingSystemABI = BikeSharingSystemAbi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(undefined);
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getBikeSharingSystemContract();
    } catch (error) {
      setMessage("Error connecting account: " + (error.message || error));
    }
  };

  const getBikeSharingSystemContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const BikeSharingSystemContract = new ethers.Contract(contractAddress, BikeSharingSystemABI, signer);
    setBikeSharingSystem(BikeSharingSystemContract);
  };

  const addBike = async () => {
    setMessage("");
    if (BikeSharingSystem) {
      try {
        let tx = await BikeSharingSystem.addBike(bikeModel);
        await tx.wait();
        setMessage("Bike added successfully!");
      } catch (error) {
        setMessage("Error adding bike: " + (error.message || error));
      }
    }
  };

  const rentBike = async () => {
    setMessage("");
    if (BikeSharingSystem) {
      try {
        let tx = await BikeSharingSystem.rentBike(bikeId);
        await tx.wait();
        checkBikeAvailability(bikeId);
        setMessage("Bike rented successfully!");
      } catch (error) {
        setMessage("Unable to rent bike: " + (error.message || error));
      }
    }
  };

  const returnBike = async () => {
    setMessage("");
    if (BikeSharingSystem) {
      try {
        let tx = await BikeSharingSystem.returnBike(bikeId);
        await tx.wait();
        checkBikeAvailability(bikeId);
        setMessage("Bike returned successfully!");
      } catch (error) {
        setMessage("Unable to return bike: " + (error.message || error));
      }
    }
  };

  const checkBikeAvailability = async (bikeId) => {
    try {
      if (BikeSharingSystem) {
        const [bikeModel, isRented] = await BikeSharingSystem.checkBikeAvailability(bikeId);
        setBikeAvailability((prev) => ({ ...prev, [bikeId]: { bikeModel, isRented } }));
      }
    } catch (error) {
      setMessage("Error fetching bike availability: " + (error.message || error));
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this bike sharing system.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect MetaMask Wallet</button>;
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <div className="bike-actions">
          <input
            type="text"
            placeholder="Bike Model"
            value={bikeModel}
            onChange={(e) => setBikeModel(e.target.value)}
          />
          <button onClick={addBike}>Add Bike</button>

          <input
            type="text"
            placeholder="Bike ID"
            value={bikeId}
            onChange={(e) => setBikeId(e.target.value)}
          />
          <button onClick={rentBike}>SHARE Bike</button>
          <button onClick={returnBike}>Return Bike</button>

          <div className="bike-info">
            {Object.keys(bikeAvailability).map((bikeId) => (
              <div key={bikeId}>
                <p>Bike ID: {bikeId}</p>
                <p>Model: {bikeAvailability[bikeId].bikeModel}</p>
                <p>Status: {bikeAvailability[bikeId].isRented ? "Rented" : "Available"}</p>
                <button onClick={() => checkBikeAvailability(bikeId)}>Check Bike Availability</button>
              </div>
            ))}
          </div>
        </div>
        {message && <p><strong>{message}</strong></p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to Bike Sharing System</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: white;
          color: olive green;
          font-family: "Times New Roman", serif;
          border: 10px solid black;
          border-radius: 20px;
          background-image: url("https://i.pinimg.com/originals/67/77/25/677725dec541ac6d103ceb77a512db39.jpg");
          height: 950px;
          width: 1500px;
          opacity: 0.9;
          font-weight: 1000;
          padding: 20px;
        }

        header {
          padding: 10px;
        }

        h1 {
          font-family: "Arial", serif;
          font-size: 60px;
          margin-bottom: 20px;
        }

        .bike-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 20px 30px;
          font-size: 24px;
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        button:hover {
          background-color: #388e3c;
        }
      `}</style>
    </main>
  );
}
