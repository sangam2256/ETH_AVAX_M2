// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract BikeSharingSystem {
    struct Bike {
        uint bikeId;
        string bikeModel;  // E.g., Mountain, Road, Hybrid
        bool isRented;
    }

    mapping(uint => Bike) public bikes;
    mapping(address => mapping(uint => bool)) public rentedBikes;
    uint public bikeCount;

    event BikeAdded(uint bikeId, string bikeModel);
    event BikeRented(address user, uint bikeId);
    event BikeReturned(address user, uint bikeId);

    function addBike(string memory bikeModel) public {
        require(bytes(bikeModel).length > 0, "Bike model cannot be empty");

        bikeCount++;
        bikes[bikeCount] = Bike(bikeCount, bikeModel, false);

        emit BikeAdded(bikeCount, bikeModel);
    }

    function rentBike(uint bikeId) public {
        Bike storage bike = bikes[bikeId];

        // Ensure that the bike exists
        require(bike.bikeId != 0, "Bike does not exist");

        // Ensure that the bike is not already rented
        require(!bike.isRented, "Bike is already rented");

        // Ensure that the user has not already rented this bike
        require(!rentedBikes[msg.sender][bikeId], "Bike already rented by you");

        // Mark the bike as rented and record the rental
        bike.isRented = true;
        rentedBikes[msg.sender][bikeId] = true;

        emit BikeRented(msg.sender, bikeId);
    }

    function returnBike(uint bikeId) public {
        Bike storage bike = bikes[bikeId];

        // Ensure that the bike exists
        require(bike.bikeId != 0, "Bike does not exist");

        // Ensure that the user has rented this bike
        require(rentedBikes[msg.sender][bikeId], "Bike was not rented by you");

        // Mark the bike as available and remove the rental record
        bike.isRented = false;
        rentedBikes[msg.sender][bikeId] = false;

        emit BikeReturned(msg.sender, bikeId);
    }

    function checkBikeAvailability(uint bikeId) public view returns (string memory bikeModel, bool isRented) {
        Bike storage bike = bikes[bikeId];

        // Ensure that the bike exists
        require(bike.bikeId != 0, "Bike does not exist");

        // Return the bike details
        return (bike.bikeModel, bike.isRented);
    }

    function attemptRentBike(uint bikeId) public {
        Bike storage bike = bikes[bikeId];

        // Check if the bike exists
        if (bike.bikeId == 0) {
            revert("Bike does not exist");
        }

        // Check if the bike is already rented
        if (bike.isRented) {
            revert("Bike is already rented");
        }

        // Check if the user has already rented this bike
        if (rentedBikes[msg.sender][bikeId]) {
            revert("Bike already rented by you");
        }

        // Mark the bike as rented and record the rental
        bike.isRented = true;
        rentedBikes[msg.sender][bikeId] = true;

        emit BikeRented(msg.sender, bikeId);
    }

    // Internal function to ensure bike state consistency
    function internalCheck(uint bikeId) internal view {
        Bike storage bike = bikes[bikeId];
        assert(bike.bikeId > 0);  // Assert the bike ID should always be positive
        assert(bike.isRented == false || bike.isRented == true);  // Assert that isRented is either true or false
    }
}
