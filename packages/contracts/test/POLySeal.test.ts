import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { MockUSDC, SessionPay } from "../typechain-types";

const { ethers } = hre;

describe("POLySeal Contracts", function () {
  let mockUSDC: MockUSDC;
  let sessionPay: SessionPay;
  let owner: SignerWithAddress;
  let payer: SignerWithAddress;
  let provider: SignerWithAddress;
  let other: SignerWithAddress;

  const USDC_AMOUNT = 10n * 10n ** 6n; // 10 USDC (6 decimals)
  const REQUEST_ID = ethers.keccak256(ethers.toUtf8Bytes("test-request-1"));
  const MODEL = "gpt-4o-mini";
  const INPUT_HASH = ethers.keccak256(ethers.toUtf8Bytes("test input data"));
  const OUTPUT_REF = "ipfs://Qm123...";

  beforeEach(async function () {
    [owner, payer, provider, other] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = (await MockUSDCFactory.deploy()) as unknown as MockUSDC;
    await mockUSDC.waitForDeployment();

    // Deploy SessionPay
    const SessionPayFactory = await ethers.getContractFactory("SessionPay");
    sessionPay = (await SessionPayFactory.deploy(owner.address)) as unknown as SessionPay;
    await sessionPay.waitForDeployment();

    // Mint USDC to payer and approve SessionPay
    await mockUSDC.mint(payer.address, USDC_AMOUNT * 10n); // Mint 100 USDC
    await mockUSDC.connect(payer).approve(await sessionPay.getAddress(), USDC_AMOUNT * 10n);
  });

  describe("MockUSDC", function () {
    it("Should have correct decimals (6)", async function () {
      expect(await mockUSDC.decimals()).to.equal(6);
    });

    it("Should have correct name and symbol", async function () {
      expect(await mockUSDC.name()).to.equal("Mock USDC");
      expect(await mockUSDC.symbol()).to.equal("mUSDC");
    });

    it("Should allow owner to mint tokens", async function () {
      const mintAmount = 1000n * 10n ** 6n; // 1000 USDC
      await mockUSDC.mint(other.address, mintAmount);
      expect(await mockUSDC.balanceOf(other.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = 1000n * 10n ** 6n;
      await expect(
        mockUSDC.connect(other).mint(other.address, mintAmount)
      ).to.be.revertedWithCustomError(mockUSDC, "OwnableUnauthorizedAccount");
    });

    it("Should allow users to burn their own tokens", async function () {
      const mintAmount = 1000n * 10n ** 6n;
      await mockUSDC.mint(other.address, mintAmount);
      
      const burnAmount = 100n * 10n ** 6n;
      await mockUSDC.connect(other).burn(burnAmount);
      
      expect(await mockUSDC.balanceOf(other.address)).to.equal(mintAmount - burnAmount);
    });
  });

  describe("SessionPay", function () {
    describe("Session Management", function () {
      it("Should open a new session successfully", async function () {
        const tx = await sessionPay.connect(payer).openSession(
          provider.address,
          await mockUSDC.getAddress(),
          USDC_AMOUNT,
          REQUEST_ID,
          MODEL,
          INPUT_HASH
        );

        // Get the block timestamp
        const receipt = await tx.wait();
        const block = await ethers.provider.getBlock(receipt!.blockNumber);
        
        await expect(tx)
          .to.emit(sessionPay, "SessionOpened")
          .withArgs(
            REQUEST_ID,
            payer.address,
            provider.address,
            await mockUSDC.getAddress(),
            USDC_AMOUNT,
            MODEL,
            INPUT_HASH,
            block!.timestamp
          );

        // Check session details
        const session = await sessionPay.getSession(REQUEST_ID);
        expect(session.payer).to.equal(payer.address);
        expect(session.provider).to.equal(provider.address);
        expect(session.token).to.equal(await mockUSDC.getAddress());
        expect(session.amount).to.equal(USDC_AMOUNT);
        expect(session.settled).to.equal(false);
        expect(session.model).to.equal(MODEL);
        expect(session.inputHash).to.equal(INPUT_HASH);

        // Check token transfer
        expect(await mockUSDC.balanceOf(await sessionPay.getAddress())).to.equal(USDC_AMOUNT);
      });

      it("Should not allow opening session with invalid parameters", async function () {
        // Invalid provider
        await expect(
          sessionPay.connect(payer).openSession(
            ethers.ZeroAddress,
            await mockUSDC.getAddress(),
            USDC_AMOUNT,
            REQUEST_ID,
            MODEL,
            INPUT_HASH
          )
        ).to.be.revertedWithCustomError(sessionPay, "InvalidProvider");

        // Invalid token
        await expect(
          sessionPay.connect(payer).openSession(
            provider.address,
            ethers.ZeroAddress,
            USDC_AMOUNT,
            REQUEST_ID,
            MODEL,
            INPUT_HASH
          )
        ).to.be.revertedWithCustomError(sessionPay, "InvalidToken");

        // Invalid amount
        await expect(
          sessionPay.connect(payer).openSession(
            provider.address,
            await mockUSDC.getAddress(),
            0,
            REQUEST_ID,
            MODEL,
            INPUT_HASH
          )
        ).to.be.revertedWithCustomError(sessionPay, "InvalidAmount");
      });

      it("Should not allow duplicate session IDs", async function () {
        // Open first session
        await sessionPay.connect(payer).openSession(
          provider.address,
          await mockUSDC.getAddress(),
          USDC_AMOUNT,
          REQUEST_ID,
          MODEL,
          INPUT_HASH
        );

        // Try to open duplicate session
        await expect(
          sessionPay.connect(payer).openSession(
            provider.address,
            await mockUSDC.getAddress(),
            USDC_AMOUNT,
            REQUEST_ID,
            MODEL,
            INPUT_HASH
          )
        ).to.be.revertedWithCustomError(sessionPay, "SessionExists");
      });
    });

    describe("Session Settlement", function () {
      beforeEach(async function () {
        // Open a session for each test
        await sessionPay.connect(payer).openSession(
          provider.address,
          await mockUSDC.getAddress(),
          USDC_AMOUNT,
          REQUEST_ID,
          MODEL,
          INPUT_HASH
        );
      });

      it("Should allow provider to confirm success and receive payment", async function () {
        const providerBalanceBefore = await mockUSDC.balanceOf(provider.address);

        await expect(
          sessionPay.connect(provider).confirmSuccess(REQUEST_ID, OUTPUT_REF)
        )
          .to.emit(sessionPay, "SessionSettled")
          .withArgs(
            REQUEST_ID,
            payer.address,
            provider.address,
            await mockUSDC.getAddress(),
            USDC_AMOUNT,
            OUTPUT_REF
          );

        // Check session is settled
        const session = await sessionPay.getSession(REQUEST_ID);
        expect(session.settled).to.equal(true);
        expect(session.outputRef).to.equal(OUTPUT_REF);

        // Check payment transferred
        const providerBalanceAfter = await mockUSDC.balanceOf(provider.address);
        expect(providerBalanceAfter - providerBalanceBefore).to.equal(USDC_AMOUNT);
      });

      it("Should not allow non-provider to confirm success", async function () {
        await expect(
          sessionPay.connect(other).confirmSuccess(REQUEST_ID, OUTPUT_REF)
        ).to.be.revertedWithCustomError(sessionPay, "OnlyProvider");
      });

      it("Should not allow confirming success twice", async function () {
        await sessionPay.connect(provider).confirmSuccess(REQUEST_ID, OUTPUT_REF);

        await expect(
          sessionPay.connect(provider).confirmSuccess(REQUEST_ID, OUTPUT_REF)
        ).to.be.revertedWithCustomError(sessionPay, "SessionAlreadySettled");
      });

      it("Should not allow confirming success for non-existent session", async function () {
        const invalidRequestId = ethers.keccak256(ethers.toUtf8Bytes("invalid"));
        
        await expect(
          sessionPay.connect(provider).confirmSuccess(invalidRequestId, OUTPUT_REF)
        ).to.be.revertedWithCustomError(sessionPay, "SessionNotFound");
      });
    });

    describe("Refund Mechanism", function () {
      beforeEach(async function () {
        await sessionPay.connect(payer).openSession(
          provider.address,
          await mockUSDC.getAddress(),
          USDC_AMOUNT,
          REQUEST_ID,
          MODEL,
          INPUT_HASH
        );
      });

      it("Should allow payer to refund after delay period", async function () {
        const payerBalanceBefore = await mockUSDC.balanceOf(payer.address);

        // Fast forward time past refund delay (15 minutes)
        await time.increase(16 * 60); // 16 minutes

        await expect(
          sessionPay.connect(payer).refund(REQUEST_ID)
        )
          .to.emit(sessionPay, "SessionRefunded")
          .withArgs(REQUEST_ID, payer.address, await mockUSDC.getAddress(), USDC_AMOUNT);

        // Check session is settled
        const session = await sessionPay.getSession(REQUEST_ID);
        expect(session.settled).to.equal(true);

        // Check refund transferred
        const payerBalanceAfter = await mockUSDC.balanceOf(payer.address);
        expect(payerBalanceAfter - payerBalanceBefore).to.equal(USDC_AMOUNT);
      });

      it("Should not allow refund before delay period", async function () {
        await expect(
          sessionPay.connect(payer).refund(REQUEST_ID)
        ).to.be.revertedWithCustomError(sessionPay, "RefundTooSoon");
      });

      it("Should not allow non-payer to refund", async function () {
        await time.increase(16 * 60);

        await expect(
          sessionPay.connect(other).refund(REQUEST_ID)
        ).to.be.revertedWithCustomError(sessionPay, "OnlyPayer");
      });

      it("Should not allow refund after settlement", async function () {
        // Provider settles first
        await sessionPay.connect(provider).confirmSuccess(REQUEST_ID, OUTPUT_REF);

        await time.increase(16 * 60);

        await expect(
          sessionPay.connect(payer).refund(REQUEST_ID)
        ).to.be.revertedWithCustomError(sessionPay, "SessionAlreadySettled");
      });
    });

    describe("Owner Functions", function () {
      it("Should allow owner to update refund delay", async function () {
        const newDelay = 30 * 60; // 30 minutes

        await expect(sessionPay.connect(owner).setRefundDelay(newDelay))
          .to.emit(sessionPay, "RefundDelayUpdated")
          .withArgs(15 * 60, newDelay);

        expect(await sessionPay.refundDelay()).to.equal(newDelay);
      });

      it("Should not allow setting refund delay longer than 7 days", async function () {
        const tooLongDelay = 8 * 24 * 60 * 60; // 8 days

        await expect(
          sessionPay.connect(owner).setRefundDelay(tooLongDelay)
        ).to.be.revertedWithCustomError(sessionPay, "RefundDelayTooLong");
      });

      it("Should not allow non-owner to update refund delay", async function () {
        await expect(
          sessionPay.connect(other).setRefundDelay(30 * 60)
        ).to.be.revertedWithCustomError(sessionPay, "OwnableUnauthorizedAccount");
      });

      it("Should allow owner to pause and unpause", async function () {
        await sessionPay.connect(owner).pause();
        expect(await sessionPay.paused()).to.equal(true);

        // Should not allow operations when paused
        await expect(
          sessionPay.connect(payer).openSession(
            provider.address,
            await mockUSDC.getAddress(),
            USDC_AMOUNT,
            REQUEST_ID,
            MODEL,
            INPUT_HASH
          )
        ).to.be.revertedWithCustomError(sessionPay, "EnforcedPause");

        await sessionPay.connect(owner).unpause();
        expect(await sessionPay.paused()).to.equal(false);
      });
    });

    describe("View Functions", function () {
      it("Should correctly report session existence", async function () {
        expect(await sessionPay.sessionExists(REQUEST_ID)).to.equal(false);

        await sessionPay.connect(payer).openSession(
          provider.address,
          await mockUSDC.getAddress(),
          USDC_AMOUNT,
          REQUEST_ID,
          MODEL,
          INPUT_HASH
        );

        expect(await sessionPay.sessionExists(REQUEST_ID)).to.equal(true);
      });

      it("Should correctly report settlement status", async function () {
        await sessionPay.connect(payer).openSession(
          provider.address,
          await mockUSDC.getAddress(),
          USDC_AMOUNT,
          REQUEST_ID,
          MODEL,
          INPUT_HASH
        );

        expect(await sessionPay.isSettled(REQUEST_ID)).to.equal(false);

        await sessionPay.connect(provider).confirmSuccess(REQUEST_ID, OUTPUT_REF);

        expect(await sessionPay.isSettled(REQUEST_ID)).to.equal(true);
      });

      it("Should correctly report refund availability", async function () {
        await sessionPay.connect(payer).openSession(
          provider.address,
          await mockUSDC.getAddress(),
          USDC_AMOUNT,
          REQUEST_ID,
          MODEL,
          INPUT_HASH
        );

        expect(await sessionPay.canRefund(REQUEST_ID)).to.equal(false);

        await time.increase(16 * 60); // 16 minutes

        expect(await sessionPay.canRefund(REQUEST_ID)).to.equal(true);

        // After settlement, should not be refundable
        await sessionPay.connect(provider).confirmSuccess(REQUEST_ID, OUTPUT_REF);
        expect(await sessionPay.canRefund(REQUEST_ID)).to.equal(false);
      });
    });
  });
});