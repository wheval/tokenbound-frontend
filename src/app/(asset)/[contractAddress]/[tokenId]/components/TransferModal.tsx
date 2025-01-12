import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { CheckIcon, XIcon } from "@public/icons";

import { useTokenBoundSDK } from "@hooks/index";
import { Modal } from "ui/modal";
import { Spinner } from "ui/spinner";

type Props = {
  openModal: boolean;
  closeModal: () => void;
  abbreviation: string;
  name: string;
  balance: string;
  src: string;
  tokenBoundAddress: string;
  contractAddress: string;
  decimal: number;
};

const TransferModal = ({
  closeModal,
  openModal,
  balance,
  name,
  tokenBoundAddress,
  abbreviation,
  src,
  contractAddress,
  decimal,
}: Props) => {
  const [transferDetails, setTransferDetails] = useState({
    recipientWalletAddress: "",
    amount: "",
  });
  const { tokenbound } = useTokenBoundSDK();

  const [tokenTransferredSuccessfully, setTokenTransferredSuccessfully] =
    useState<boolean | null>(null);
  const [disableSendBtn, setDisableSendBtn] = useState("enableButton");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "amount") {
      const enteredAmount = parseFloat(value);
      if (value === "." && transferDetails.amount === "") {
        newValue = "0.";
      } else if (isNaN(enteredAmount)) {
        newValue = "";
      } else {
        const availableBalance = parseFloat(balance);
        if (enteredAmount > availableBalance) {
          newValue = balance.toString();
        }
      }
    }

    setTransferDetails((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };
  const closeTransferModal = () => {
    closeModal();
    setTransferDetails({
      amount: "",
      recipientWalletAddress: "",
    });
    setTokenTransferredSuccessfully(null);
  };

  const transferERC20Assets = async () => {
    try {
      if (tokenbound) {
        setTokenTransferredSuccessfully(false);
        const status = await tokenbound.transferERC20({
          tbaAddress: tokenBoundAddress,
          contractAddress: contractAddress,
          recipient: transferDetails.recipientWalletAddress,
          amount: (+transferDetails.amount * decimal).toString(),
        });
        setTokenTransferredSuccessfully(status);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.log("there was an error transferring the assets:", error);
      }
    }
  };

  useEffect(() => {
    if (!transferDetails.amount || !transferDetails.recipientWalletAddress) {
      setDisableSendBtn("disableButton");
    } else {
      setDisableSendBtn("enableButton");
    }
    if (tokenTransferredSuccessfully === false) {
      setDisableSendBtn("disableButton");
    }
  }, [tokenTransferredSuccessfully, transferDetails]);

  return (
    <Modal type="erc20" closeModal={closeTransferModal} openModal={openModal}>
      <>
        {tokenTransferredSuccessfully ? (
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="flex w-full items-end justify-end">
              <button onClick={closeTransferModal}>
                <XIcon />
              </button>
            </div>
            <div className="flex h-[7rem] w-[7rem] items-center justify-center rounded-full bg-deep-blue text-white">
              <CheckIcon />
            </div>
            <h3 className="font-bold">Completed</h3>
            <p>Transaction successful🎉</p>
            <button
              className={`w-full rounded-[8px] bg-deep-blue p-[.8rem] text-white`}
              onClick={closeTransferModal}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <h3 className="text-[1.5em]">Send</h3>
              <button onClick={closeTransferModal}>
                <XIcon />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="mb-2 text-[1em]">Asset</h4>
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="h-[2.2rem] w-[2.2rem] rounded-full">
                      <Image
                        alt=""
                        src={src}
                        width={10}
                        height={10}
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <p className="uppercase">{abbreviation}</p>
                      <p className="text-[.875em] text-[#5a5a5a]">{name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div>
                      <p>{balance}</p>
                    </div>
                  </div>
                </div>
              </div>
              <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="walletAddress">Wallet Address</label>
                  <input
                    required
                    type="text"
                    id="walletAddress"
                    name="recipientWalletAddress"
                    placeholder="Enter Wallet Address"
                    value={transferDetails.recipientWalletAddress}
                    onChange={handleInputChange}
                    className="rounded-[8px] border-[1px] border-solid border-[#7A7A7A] p-[.8rem]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="amount">Amount</label>
                  <input
                    required
                    className="rounded-[8px] border-[1px] border-solid border-[#7A7A7A] p-[.8rem]"
                    type="text"
                    id="amount"
                    name="amount"
                    value={transferDetails.amount}
                    onChange={handleInputChange}
                    placeholder="Enter Amount"
                  />
                </div>
                <button
                  disabled={disableSendBtn === "disableButton"}
                  onClick={(e) => {
                    e.preventDefault();
                    transferERC20Assets();
                  }}
                  className={`w-full rounded-[8px] bg-deep-blue p-[.8rem] text-white ${
                    disableSendBtn === "disableButton"
                      ? "!cursor-not-allowed opacity-50"
                      : "!cursor-pointer opacity-100"
                  }`}
                >
                  {tokenTransferredSuccessfully === false ? (
                    <span className="flex justify-center gap-2">
                      <span>sending</span>
                      <Spinner />
                    </span>
                  ) : (
                    <>send &rarr;</>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </>
    </Modal>
  );
};

export default TransferModal;
