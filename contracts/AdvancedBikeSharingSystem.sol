// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract AdvancedBikeSharingSystem {
    struct Bike {
        uint bikeId;
        string bikeModel;
        address owner;
        bool isRented;
        uint pricePerHour;
    }

    struct Rental {
        uint bikeId;
        uint startTime;
        uint rentalDuration;
        bool isReturned;
        uint totalCost;
    }

    mapping(uint => Bike) public bikes;
    mapping(address => mapping(uint => Rental)) public rentals; // User rentals
    mapping(address => uint) public earnings;  // Owner earnings
    uint public bikeCount;

    event BikeAdded(uint bikeId, string bikeModel, address owner, uint pricePerHour);
    event BikeRented(address user, uint bikeId, uint rentalDuration, uint totalCost);
    event BikeReturned(address user, uint bikeId, uint totalCost, bool lateFeeCharged);

    // Add a new bike with a specific rental price per hour
    function addBike(string memory bikeModel, uint pricePerHour) public {
        require(bytes(bikeModel).length > 0, "Bike model cannot be empty");
        require(pricePerHour > 0, "Price per hour must be greater than zero");

        bikeCount++;
        bikes[bikeCount] = Bike(bikeCount, bikeModel, msg.sender, false, pricePerHour);

        emit BikeAdded(bikeCount, bikeModel, msg.sender, pricePerHour);
    }

    // Rent a bike for a specified duration (in hours)
    function rentBike(uint bikeId, uint rentalDuration) public payable {
        Bike storage bike = bikes[bikeId];
        require(bike.bikeId != 0, "Bike does not exist");
        require(!bike.isRented, "Bike is already rented");
        require(rentalDuration > 0, "Rental duration must be greater than zero");

        uint totalCost = bike.pricePerHour * rentalDuration;
        require(msg.value >= totalCost, "Insufficient payment for rental");

        bike.isRented = true;
        rentals[msg.sender][bikeId] = Rental(bikeId, block.timestamp, rentalDuration, false, totalCost);

        // Transfer payment to bike owner
        earnings[bike.owner] += totalCost;

        emit BikeRented(msg.sender, bikeId, rentalDuration, totalCost);
    }

    // Return the bike and check for late fees
    function returnBike(uint bikeId) public {
        Rental storage rental = rentals[msg.sender][bikeId];
        Bike storage bike = bikes[bikeId];

        require(rental.bikeId != 0, "Rental does not exist");
        require(!rental.isReturned, "Bike has already been returned");

        // Calculate if bike is returned late
        uint endTime = rental.startTime + (rental.rentalDuration * 1 hours);
        bool isLate = block.timestamp > endTime;
        uint lateFee = 0;

        if (isLate) {
            uint lateHours = (block.timestamp - endTime) / 1 hours;
            lateFee = lateHours * bike.pricePerHour;
            earnings[bike.owner] += lateFee;
        }

        rental.isReturned = true;
        bike.isRented = false;

        emit BikeReturned(msg.sender, bikeId, rental.totalCost + lateFee, isLate);
    }

    // Allow bike owners to withdraw their earnings
    function withdrawEarnings() public {
        uint balance = earnings[msg.sender];
        require(balance > 0, "No earnings available to withdraw");

        earnings[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }

    // View bike details and availability
    function checkBikeAvailability(uint bikeId) public view returns (string memory bikeModel, bool isRented, uint pricePerHour, address owner) {
        Bike storage bike = bikes[bikeId];
        require(bike.bikeId != 0, "Bike does not exist");

        return (bike.bikeModel, bike.isRented, bike.pricePerHour, bike.owner);
    }

    // Internal function to ensure bike state consistency
    function internalCheck(uint bikeId) internal view {
        Bike storage bike = bikes[bikeId];
        assert(bike.bikeId > 0);
        assert(bike.isRented == false || bike.isRented == true);
    }
}
