const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("InapayRegistry", function () {
  async function deployRegistryFixture() {
    const [sender, receiver] = await ethers.getSigners();
    const InapayRegistry = await ethers.getContractFactory("InapayRegistry");
    const registry = await InapayRegistry.deploy();

    return { registry, sender, receiver };
  }

  it("records a payment receipt and emits the event", async function () {
    const { registry, sender, receiver } = await deployRegistryFixture();
    const token = ethers.ZeroAddress;
    const amount = ethers.parseEther("0.01");
    const paymentRef = ethers.id("inapay-payment-001");

    await expect(
      registry.connect(sender).recordPayment(
        receiver.address,
        token,
        amount,
        paymentRef,
      ),
    )
      .to.emit(registry, "PaymentRecorded")
      .withArgs(
        1,
        sender.address,
        receiver.address,
        token,
        amount,
        paymentRef,
        anyValue,
      );

    const payment = await registry.payments(1);

    expect(payment.id).to.equal(1);
    expect(payment.sender).to.equal(sender.address);
    expect(payment.receiver).to.equal(receiver.address);
    expect(payment.token).to.equal(token);
    expect(payment.amount).to.equal(amount);
    expect(payment.paymentRef).to.equal(paymentRef);
    expect(payment.timestamp).to.be.greaterThan(0);
    expect(await registry.paymentCount()).to.equal(1);
  });

  it("rejects zero receiver", async function () {
    const { registry } = await deployRegistryFixture();

    await expect(
      registry.recordPayment(
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        1,
        ethers.id("invalid-receiver"),
      ),
    ).to.be.revertedWith("Invalid receiver");
  });

  it("rejects zero amount", async function () {
    const { registry, receiver } = await deployRegistryFixture();

    await expect(
      registry.recordPayment(
        receiver.address,
        ethers.ZeroAddress,
        0,
        ethers.id("invalid-amount"),
      ),
    ).to.be.revertedWith("Invalid amount");
  });
});
