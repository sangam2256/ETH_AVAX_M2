import { useState, useEffect } from "react";
import { ethers } from "ethers";
import AdvancedBikeSharingSystemAbi from "../artifacts/contracts/AdvancedBikeSharingSystem.sol/AdvancedBikeSharingSystem.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [BikeSharingSystem, setBikeSharingSystem] = useState(undefined);
  const [bikeAvailability, setBikeAvailability] = useState({});
  const [message, setMessage] = useState("");
  const [bikeModel, setBikeModel] = useState("");
  const [bikeId, setBikeId] = useState("");
  const [rentalDuration, setRentalDuration] = useState(1); // Default rental duration
  const [ownerEarnings, setOwnerEarnings] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with your contract address
  const BikeSharingSystemABI = AdvancedBikeSharingSystemAbi.abi;

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
        let tx = await BikeSharingSystem.addBike(bikeModel, ethers.utils.parseEther("1")); // default price per hour, change if needed
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
        const bikeDetails = await BikeSharingSystem.checkBikeAvailability(bikeId);
        const pricePerHour = bikeDetails[2]; // extract pricePerHour from response
        let totalCost = pricePerHour.mul(rentalDuration); // calculate total cost based on duration
        let tx = await BikeSharingSystem.rentBike(bikeId, rentalDuration, { value: totalCost });
        await tx.wait();
        checkBikeAvailability(bikeId);
        setMessage("Bike rented successfully!");
        
        // Refresh earnings after renting
        await getOwnerEarnings();
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
        
        // Refresh earnings after returning
        await getOwnerEarnings();
      } catch (error) {
        setMessage("Unable to return bike: " + (error.message || error));
      }
    }
  };
  

  const withdrawEarnings = async () => {
    setMessage("");
    if (BikeSharingSystem) {
      try {
        let tx = await BikeSharingSystem.withdrawEarnings();
        await tx.wait();
        setMessage("Earnings withdrawn successfully!");
      } catch (error) {
        setMessage("Unable to withdraw earnings: " + (error.message || error));
      }
    }
  };

  const checkBikeAvailability = async (bikeId) => {
    try {
      if (BikeSharingSystem) {
        const [bikeModel, isRented, pricePerHour, owner] = await BikeSharingSystem.checkBikeAvailability(bikeId);
        setBikeAvailability((prev) => ({ ...prev, [bikeId]: { bikeModel, isRented, pricePerHour, owner } }));
      }
    } catch (error) {
      setMessage("Error fetching bike availability: " + (error.message || error));
    }
  };

  const getOwnerEarnings = async () => {
    try {
      if (BikeSharingSystem) {
        const earnings = await BikeSharingSystem.earnings(account);
        setOwnerEarnings(ethers.utils.formatEther(earnings));
      }
    } catch (error) {
      setMessage("Error fetching earnings: " + (error.message || error));
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
          <input
            type="number"
            placeholder="Rental Duration (hours)"
            value={rentalDuration}
            onChange={(e) => setRentalDuration(e.target.value)}
          />
          <button onClick={rentBike}>Rent Bike</button>
          <button onClick={returnBike}>Return Bike</button>

          <div className="bike-info">
            {Object.keys(bikeAvailability).map((bikeId) => (
              <div key={bikeId}>
                <p>Bike ID: {bikeId}</p>
                <p>Model: {bikeAvailability[bikeId].bikeModel}</p>
                <p>Price Per Hour: {ethers.utils.formatEther(bikeAvailability[bikeId].pricePerHour)} ETH</p>
                <p>Status: {bikeAvailability[bikeId].isRented ? "Rented" : "Available"}</p>
                <p>Owner: {bikeAvailability[bikeId].owner}</p>
                <button onClick={() => checkBikeAvailability(bikeId)}>Check Bike Availability</button>
              </div>
            ))}
          </div>

          <p>Your Earnings: {ownerEarnings} ETH</p>
          <button onClick={withdrawEarnings}>Withdraw Earnings</button>
        </div>
        {message && <p><strong>{message}</strong></p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
    if (account) {
      getOwnerEarnings();
    }
  }, [account]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to Advance Bike Sharing System</h1>
      </header>
      {initUser()}
      <style jsx>{`
      
         .container {
          text-align: center;
          background-color: white;
          color: black;
          font-family: "Times New Roman", serif;
          border: 10px solid black;
          border-radius: 20px;
          background-image: url("https://i.pinimg.com/originals/41/9b/76/419b764b109196b16cfb7320882c27c7.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          height: 850px;
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

        .task-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 15px 25px;
          font-size: 22px;
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

        
