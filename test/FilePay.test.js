const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FilePay Contract", function () {
  let FilePay, filePay;
  let MockUSDC, mockUSDC;
  let owner, creator, buyer, feeRecipient;
  let fileId = "test-file-123";
  let filePrice = ethers.parseUnits("5", 6); // 5 USDC

  beforeEach(async function () {
    [owner, creator, buyer, feeRecipient] = await ethers.getSigners();

    // Deploy mock USDC token
    MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    // Deploy FilePay contract
    FilePay = await ethers.getContractFactory("FilePay");
    filePay = await FilePay.deploy(
      await mockUSDC.getAddress(),
      feeRecipient.address
    );
    await filePay.waitForDeployment();

    // Mint USDC to buyer
    await mockUSDC.mint(buyer.address, ethers.parseUnits("1000", 6));
  });

  describe("Deployment", function () {
    it("Should set the correct USDC token address", async function () {
      expect(await filePay.usdcToken()).to.equal(await mockUSDC.getAddress());
    });

    it("Should set the correct fee recipient", async function () {
      expect(await filePay.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the correct platform fee", async function () {
      expect(await filePay.platformFee()).to.equal(250); // 2.5%
    });

    it("Should set the correct owner", async function () {
      expect(await filePay.owner()).to.equal(owner.address);
    });
  });

  describe("File Registration", function () {
    it("Should allow creators to register files", async function () {
      await expect(filePay.connect(creator).registerFile(fileId, filePrice))
        .to.emit(filePay, "FileRegistered")
        .withArgs(fileId, creator.address, filePrice);

      expect(await filePay.fileCreators(fileId)).to.equal(creator.address);
      expect(await filePay.filePrices(fileId)).to.equal(filePrice);
    });

    it("Should not allow empty file ID", async function () {
      await expect(
        filePay.connect(creator).registerFile("", filePrice)
      ).to.be.revertedWith("File ID cannot be empty");
    });

    it("Should not allow zero price", async function () {
      await expect(
        filePay.connect(creator).registerFile(fileId, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should not allow duplicate file registration", async function () {
      await filePay.connect(creator).registerFile(fileId, filePrice);
      
      await expect(
        filePay.connect(creator).registerFile(fileId, filePrice)
      ).to.be.revertedWith("File already registered");
    });

    it("Should allow creator to update file price", async function () {
      await filePay.connect(creator).registerFile(fileId, filePrice);
      
      const newPrice = ethers.parseUnits("10", 6);
      await filePay.connect(creator).updateFilePrice(fileId, newPrice);
      
      expect(await filePay.filePrices(fileId)).to.equal(newPrice);
    });

    it("Should not allow non-creator to update file price", async function () {
      await filePay.connect(creator).registerFile(fileId, filePrice);
      
      const newPrice = ethers.parseUnits("10", 6);
      await expect(
        filePay.connect(buyer).updateFilePrice(fileId, newPrice)
      ).to.be.revertedWith("Only creator can update price");
    });
  });

  describe("Payment Creation", function () {
    beforeEach(async function () {
      await filePay.connect(creator).registerFile(fileId, filePrice);
      await mockUSDC.connect(buyer).approve(await filePay.getAddress(), filePrice);
    });

    it("Should allow buyers to create payments", async function () {
      const tx = await filePay.connect(buyer).createPayment(fileId);
      const receipt = await tx.wait();
      
      // Find the PaymentCreated event
      const event = receipt.logs.find(log => {
        try {
          const parsed = filePay.interface.parseLog(log);
          return parsed.name === "PaymentCreated";
        } catch {
          return false;
        }
      });
      
      expect(event).to.not.be.undefined;
      
      const parsedEvent = filePay.interface.parseLog(event);
      const paymentId = parsedEvent.args[0];
      
      const payment = await filePay.getPayment(paymentId);
      expect(payment.fileId).to.equal(fileId);
      expect(payment.creator).to.equal(creator.address);
      expect(payment.buyer).to.equal(buyer.address);
      expect(payment.amount).to.equal(filePrice);
      expect(payment.completed).to.be.false;
    });

    it("Should not allow payment for unregistered file", async function () {
      await expect(
        filePay.connect(buyer).createPayment("nonexistent-file")
      ).to.be.revertedWith("File not registered");
    });

    it("Should not allow creator to buy their own file", async function () {
      await expect(
        filePay.connect(creator).createPayment(fileId)
      ).to.be.revertedWith("Cannot buy your own file");
    });

    it("Should transfer USDC from buyer to contract", async function () {
      const initialBuyerBalance = await mockUSDC.balanceOf(buyer.address);
      const initialContractBalance = await mockUSDC.balanceOf(await filePay.getAddress());
      
      await filePay.connect(buyer).createPayment(fileId);
      
      const finalBuyerBalance = await mockUSDC.balanceOf(buyer.address);
      const finalContractBalance = await mockUSDC.balanceOf(await filePay.getAddress());
      
      expect(finalBuyerBalance).to.equal(initialBuyerBalance - filePrice);
      expect(finalContractBalance).to.equal(initialContractBalance + filePrice);
    });
  });

  describe("Payment Completion", function () {
    let paymentId;

    beforeEach(async function () {
      await filePay.connect(creator).registerFile(fileId, filePrice);
      await mockUSDC.connect(buyer).approve(await filePay.getAddress(), filePrice);
      
      const tx = await filePay.connect(buyer).createPayment(fileId);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = filePay.interface.parseLog(log);
          return parsed.name === "PaymentCreated";
        } catch {
          return false;
        }
      });
      
      paymentId = filePay.interface.parseLog(event).args[0];
    });

    it("Should allow buyer to complete payment", async function () {
      const initialCreatorBalance = await mockUSDC.balanceOf(creator.address);
      const initialFeeRecipientBalance = await mockUSDC.balanceOf(feeRecipient.address);
      
      await expect(filePay.connect(buyer).completePayment(paymentId))
        .to.emit(filePay, "PaymentCompleted");
      
      const payment = await filePay.getPayment(paymentId);
      expect(payment.completed).to.be.true;
      
      // Check fund distribution
      const platformFee = (filePrice * 250n) / 10000n; // 2.5%
      const creatorAmount = filePrice - platformFee;
      
      const finalCreatorBalance = await mockUSDC.balanceOf(creator.address);
      const finalFeeRecipientBalance = await mockUSDC.balanceOf(feeRecipient.address);
      
      expect(finalCreatorBalance).to.equal(initialCreatorBalance + creatorAmount);
      expect(finalFeeRecipientBalance).to.equal(initialFeeRecipientBalance + platformFee);
    });

    it("Should not allow non-buyer to complete payment", async function () {
      await expect(
        filePay.connect(creator).completePayment(paymentId)
      ).to.be.revertedWith("Only buyer can complete payment");
    });

    it("Should not allow double completion", async function () {
      await filePay.connect(buyer).completePayment(paymentId);
      
      await expect(
        filePay.connect(buyer).completePayment(paymentId)
      ).to.be.revertedWith("Payment already completed");
    });

    it("Should validate payment correctly", async function () {
      expect(await filePay.isPaymentValid(paymentId)).to.be.false;
      
      await filePay.connect(buyer).completePayment(paymentId);
      
      expect(await filePay.isPaymentValid(paymentId)).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      const newFee = 500; // 5%
      
      await expect(filePay.connect(owner).updatePlatformFee(newFee))
        .to.emit(filePay, "PlatformFeeUpdated")
        .withArgs(250, newFee);
      
      expect(await filePay.platformFee()).to.equal(newFee);
    });

    it("Should not allow platform fee above maximum", async function () {
      await expect(
        filePay.connect(owner).updatePlatformFee(1500) // 15%
      ).to.be.revertedWith("Fee too high");
    });

    it("Should not allow non-owner to update platform fee", async function () {
      await expect(
        filePay.connect(creator).updatePlatformFee(500)
      ).to.be.revertedWithCustomError(filePay, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update fee recipient", async function () {
      const newRecipient = buyer.address;
      
      await expect(filePay.connect(owner).updateFeeRecipient(newRecipient))
        .to.emit(filePay, "FeeRecipientUpdated")
        .withArgs(feeRecipient.address, newRecipient);
      
      expect(await filePay.feeRecipient()).to.equal(newRecipient);
    });

    it("Should not allow zero address as fee recipient", async function () {
      await expect(
        filePay.connect(owner).updateFeeRecipient(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient address");
    });

    it("Should allow owner to pause contract", async function () {
      await filePay.connect(owner).pause();
      
      await expect(
        filePay.connect(creator).registerFile("new-file", filePrice)
      ).to.be.revertedWithCustomError(filePay, "EnforcedPause");
    });

    it("Should allow owner to unpause contract", async function () {
      await filePay.connect(owner).pause();
      await filePay.connect(owner).unpause();
      
      // Should work normally after unpause
      await expect(
        filePay.connect(creator).registerFile("new-file", filePrice)
      ).to.not.be.reverted;
    });

    it("Should allow emergency withdrawal", async function () {
      // Send some USDC to contract
      await mockUSDC.connect(buyer).transfer(await filePay.getAddress(), ethers.parseUnits("100", 6));
      
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      const withdrawAmount = ethers.parseUnits("50", 6);
      
      await filePay.connect(owner).emergencyWithdraw(await mockUSDC.getAddress(), withdrawAmount);
      
      const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + withdrawAmount);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero platform fee correctly", async function () {
      await filePay.connect(owner).updatePlatformFee(0);
      
      await filePay.connect(creator).registerFile(fileId, filePrice);
      await mockUSDC.connect(buyer).approve(await filePay.getAddress(), filePrice);
      
      const tx = await filePay.connect(buyer).createPayment(fileId);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = filePay.interface.parseLog(log);
          return parsed.name === "PaymentCreated";
        } catch {
          return false;
        }
      });
      
      const paymentId = filePay.interface.parseLog(event).args[0];
      
      const initialCreatorBalance = await mockUSDC.balanceOf(creator.address);
      const initialFeeRecipientBalance = await mockUSDC.balanceOf(feeRecipient.address);
      
      await filePay.connect(buyer).completePayment(paymentId);
      
      const finalCreatorBalance = await mockUSDC.balanceOf(creator.address);
      const finalFeeRecipientBalance = await mockUSDC.balanceOf(feeRecipient.address);
      
      expect(finalCreatorBalance).to.equal(initialCreatorBalance + filePrice);
      expect(finalFeeRecipientBalance).to.equal(initialFeeRecipientBalance);
    });

    it("Should handle very small amounts correctly", async function () {
      const smallPrice = 1n; // 1 wei of USDC
      
      await filePay.connect(creator).registerFile(fileId, smallPrice);
      await mockUSDC.connect(buyer).approve(await filePay.getAddress(), smallPrice);
      
      const tx = await filePay.connect(buyer).createPayment(fileId);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = filePay.interface.parseLog(log);
          return parsed.name === "PaymentCreated";
        } catch {
          return false;
        }
      });
      
      const paymentId = filePay.interface.parseLog(event).args[0];
      
      await expect(filePay.connect(buyer).completePayment(paymentId))
        .to.not.be.reverted;
    });
  });
});

// Mock USDC contract for testing
const MockUSDCSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
`;
