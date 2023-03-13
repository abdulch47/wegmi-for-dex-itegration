import { useEffect, useState } from "react";
import { BigNumber, ethers } from 'ethers';
import Router02 from './Router02.json';
import { useAccount, useSigner } from "wagmi";
import Token from './Token.json';
import Factory from './Factory.json';
import UniswapV2Pair from './UniswapV2Pair.json';
import { useContractRead } from 'wagmi';
import { _toEscapedUtf8String } from "ethers/lib/utils";

const UniswapV2Router02 = "0x2235b8eDdbE2f2fFF5c3abdcb4ad116c21F5B994";


const MainPool = ({ accounts }) => {
    const isConnected = Boolean(accounts[0]);
    const { data: signer, isError } = useSigner();
    const { address } = useAccount();
    const [toAddress, setToAddress] = useState("");
    const [token1Value, setToken1Value] = useState("0");
    const [token2Value, setToken2Value] = useState("0");

    const [AddressA, setAddressA] = useState("");
    const [AddressB, setAddressB] = useState("");
    const [amountAMin, MinumumAToken] = useState("0");
    const [amountBMin, MinumumBToken] = useState("0");
    const [deadline, setDeadline] = useState(new Date());
    const [liquidity, setLiquidity] = useState("");
    const [factoryAddress, setFactoryAddress] = useState("");
    const [pairAddress, setPairAddress] = useState("");
    const [WETH, setWETH] = useState("");
    const [AmountIn, setAmountIn] = useState("");
    const [Decimals, setTokenDecimals] = useState("");
    // const [AmountOut, setAmountOut] = useState("");
    const [slippagePercantage, setSlippagePercentage] = useState("");

    const setToAddressHandeler = (event) => {
        setToAddress(event.target.value);
    }
    const Token1ValueHandeler = (event) => {
        setToken1Value(event.target.value);
        console.log(token1Value);
    };

    const Token2ValueHandeler = (event) => {
        setToken2Value(event.target.value);
        console.log(token2Value);
    };
    const tokenAHandeler = (event) => {
        setAddressA(event.target.value);
        console.log(AddressA);

    }
    const tokenBHandeler = (event) => {
        setAddressB(event.target.value);
        console.log(AddressB);

    }
    const liquidityHandeler = (event) => {
        setLiquidity(event.target.value);
        console.log(liquidity);

    }
    const setAmountInHandeler = (event) => {
        setAmountIn(event.target.value);
        console.log(AmountIn);
    }
    const slippageHandeler = (event) => {
        setSlippagePercentage(event.target.value);
        console.log(slippagePercantage);
    }

    let contract1;
    let contract2;
    let contract3;
    let contract4;
    let contract5;
    if (signer) {
        contract1 = new ethers.Contract(UniswapV2Router02, Router02, signer);
        contract2 = new ethers.Contract(AddressA, Token, signer);
        contract3 = new ethers.Contract(AddressB, Token, signer);
        contract4 = new ethers.Contract(factoryAddress, Factory, signer);
        contract5 = new ethers.Contract(pairAddress, UniswapV2Pair, signer);
    }

    //add liquidity function
    const AddLiquidity = async () => {
        try {
            await contract2
                ?.approve(UniswapV2Router02, ethers.utils.parseEther(token1Value.toString()))
                .then((allowanceA_Response) => {
                    allowanceA_Response.wait().then(async () => {
                        await contract3
                            ?.approve(UniswapV2Router02, ethers.utils.parseEther(token2Value.toString()))
                            .then((allowanceB_Response) => {
                                allowanceB_Response.wait().then(async () => {
                                    await contract1
                                        ?.addLiquidity(AddressA, AddressB, token1Value, token2Value, amountAMin, amountBMin, toAddress, (((deadline.getTime() / 1000) + 20 * 60).toFixed(0)).toString())
                                        .then((_res) => {
                                            console.log("Liqudity add:", _res)
                                        });
                                });
                            });
                    });
                });


        } catch (error) {
            console.log("error:", error);
        }
    };
    //add liquidity eth function
    const AddLiquidityETH = async () => {
        try {
            await contract3
                ?.approve(UniswapV2Router02, ethers.utils.parseEther(token2Value.toString()))
                .then((allowanceA) => {
                    allowanceA.wait().then(async () => {
                        await contract1
                            ?.addLiquidityETH(AddressB, token2Value, amountAMin, amountBMin, toAddress, (((deadline.getTime() / 1000) + 20 * 60).toFixed(0)).toString(), { value: ethers.utils.parseEther(token1Value.toString()) })
                            .then((response) => {
                                console.log("Add liquidity:", response);
                            });
                    });
                });

        } catch (error) {
            console.log("error:", error);
        }
    };
    //remove liquidity function
    const RemoveLiquidity = async () => {
        console.log("Contract1:", contract1);
        try {
            //it will get the factory address from the router contract
            await contract1
                ?.factory().then(async (_address) => {
                    console.log("Address:", _address)
                    setFactoryAddress(_address)
                    // it will get the pair address of the input tokens from the factory contract
                    await contract4
                        ?.getPair(AddressA, AddressB).then(async (_Address) => {
                            console.log("Address:", _Address);
                            setPairAddress(_Address)
                            //it will get approve of the lp tokens to uniswap contract from pair contract
                            await contract5
                                ?.approve(UniswapV2Router02, ethers.utils.parseEther(liquidity.toString()))
                                .then((liquidityAllowance) => {
                                    liquidityAllowance.wait().then(async () => {
                                        //it will then call removeLiquidity function from the uniswap
                                        await contract1
                                            ?.removeLiquidity(AddressA, AddressB, liquidity, amountAMin, amountBMin, toAddress, (((deadline.getTime() / 1000) + 20 * 60).toFixed(0)).toString())
                                            .then((remove) => {
                                                console.log("Liquidity Removed:", remove);
                                            });
                                    });
                                });
                        });
                });

        } catch (_err) {
            console.log("Error:", _err);
        }
    }
    //remove liquidity ETH function
    const RemoveLiquidityETH = async () => {
        console.log("Contract1:", contract1);
        try {
            //it will get the WETH address from the router contract
            await contract1
                ?.WETH().then(async (_address) => {
                    console.log("Address:", _address)
                    setWETH(_address)
                    await contract1
                        ?.factory().then(async (_fac) => {
                            console.log("Address:", _fac)
                            setFactoryAddress(_fac)
                            await contract4
                                ?.getPair(WETH, AddressB).then(async (_Address) => {
                                    console.log("Address:", _Address)
                                    setPairAddress(_Address)
                                    await contract5
                                        ?.approve(UniswapV2Router02, ethers.utils.parseEther(liquidity.toString()))
                                        .then((Approval) => {
                                            Approval.wait().then(async () => {
                                                await contract1
                                                    ?.removeLiquidityETH(AddressB, liquidity, amountAMin, amountBMin, toAddress, (((deadline.getTime() / 1000) + 20 * 60).toFixed(0)).toString())
                                                    .then((Removed) => {
                                                        console.log("Removed liquidity:", Removed);
                                                    });
                                            });
                                        });
                                });
                        });

                });




        } catch (_err) {
            console.log("Error:", _err);
        }
    }
 //swap exact tokens for tokens function

    const SwapExactTokensForTokens = async () => {
        try {
            const _amount = ethers.utils.parseEther(AmountIn.toString())
            console.log("Amount:", _amount);
            await contract2
                ?.approve(UniswapV2Router02, ethers.utils.parseEther(AmountIn.toString()))
                .then((_app) => {
                    _app.wait().then(async () => {
                        await contract1
                            ?.swapExactTokensForTokens(AmountIn, amountBMin, [AddressA, AddressB], toAddress, (((deadline.getTime() / 1000) + 20 * 60).toFixed(0)).toString())
                            .then((_swap) => {
                                console.log("Swap Tokens:", _swap);
                            })
                    })
                })

        } catch (error) {
            console.log("error:", error);
        }
    };
    //swap eth for exact tokens function
    const SwapETHForExactTokens = async () => {
        try {
            await contract1
                ?.WETH().then(async (_add) => {
                    console.log("Address:", _add)

                    await contract1
                        ?.getAmountsOut(ethers.utils.parseEther(AmountIn.toString()), [_add, AddressA]).then(async (amountOut) => {
                            console.log("Amount out:", amountOut[1].toString())

                            await contract1
                                ?.swapETHForExactTokens(amountOut[1].toString(), [_add, AddressA], toAddress, (((deadline.getTime() / 1000) + 20 * 60).toFixed(0)).toString(), { value: ethers.utils.parseEther(AmountIn.toString()) })
                                .then((Swap) => {
                                    console.log("Swap ETH:", Swap);
                                })
                        })
                })

        } catch (error) {
            console.log("error:", error);
        }
    };
    const SwapExactTokensForTokensSupportingFeeOnTransferTokens = async () => {
        try {
            await contract1
                ?.factory().then(async (Fac) => {
                    console.log("Factory address:", Fac);
                    setFactoryAddress(Fac)
                    await contract4
                        ?.getPair(AddressA, AddressB).then(async (_Pair) => {
                            console.log("Pair address:", _Pair)
                            setPairAddress(_Pair)
                            await contract5
                                ?.getReserves().then(async (_value) => {
                                    // console.log(_value, reserve0, reserve1)
                                    console.log("Values:", _value)
                                    let reserve0 = ethers.BigNumber.from(_value._reserve0)
                                    let reserve1 = ethers.BigNumber.from(_value._reserve1)
                                    
                                    console.log(reserve0, reserve1);
                                    await contract1
                                        ?.getAmountOut(AmountIn, reserve1, reserve0).then(async (AmountOut) => {
                                            console.log("AmountOut:", AmountOut.toString())
                                            const _slippage = (AmountOut.toString() * slippagePercantage.toString()) / 100;
                                            console.log("slippage fee:", _slippage);
                                            const amountOutWithSlippage = AmountOut.toString() - _slippage;
                                            console.log("amountOutWithSlippage:", amountOutWithSlippage)
                                            await contract2
                                                ?.approve(UniswapV2Router02, ethers.utils.parseEther(AmountIn.toString()))
                                                .then((_APP) => {
                                                    _APP.wait().then(async () => {
                                                        await contract1
                                                            ?.swapExactTokensForTokensSupportingFeeOnTransferTokens(AmountIn , amountBMin, [AddressA, AddressB], toAddress, (((deadline.getTime() / 1000) + 20 * 60).toFixed(0)).toString())
                                                            .then((Swapped) => {
                                                                console.log("Swapping:", Swapped);
                                                            })
                                                    })
                                                })


                                        })

                                })
                        })
                })

        } catch (error) {
            console.log("error:", error);
        }
    };
    useEffect(() => {
        const interval = setInterval(() => {
            setDeadline(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [isConnected]);

    return (
        <div>
            <h1>Dencentralize Exchange</h1>
            <p>
                Dex save from the scams and are auto mated market makers
            </p>

            <div>
                <div>
                    <input type="text" placeholder="To Address"
                        value={toAddress} onChange={setToAddressHandeler} />
                    <input type="text" placeholder="Token A " value={AddressA} onChange={tokenAHandeler} />
                    <input type="text" placeholder="Token B" value={AddressB} onChange={tokenBHandeler} />
                    <input type="text" placeholder="AmountIn" value={AmountIn} onChange={setAmountInHandeler} />
                    <input type="number" placeholder="Slippage" value={slippagePercantage} onChange={slippageHandeler} />
                    {/* <input type="text" placeholder="AmountB" value={token2Value} onChange={Token2ValueHandeler} /> */}

                    <button onClick={SwapExactTokensForTokensSupportingFeeOnTransferTokens}>Swap Tokens</button>
                </div>
            </div>

        </div>
    );
};

export default MainPool;
