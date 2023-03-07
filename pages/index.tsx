import {
	Box,
	Flex,
	Image,
	Heading,
	Input,
	Text,
	Button,
	HStack,
	Stack,
	Skeleton,
	Icon,
	useToast,
	Link,
	SlideFade,
	useBoolean,
	useClipboard,
	VStack,
	useInterval,
	Center,
} from "@chakra-ui/react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { IoMdArrowForward } from "react-icons/io";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { BsArrowRight } from "react-icons/bs";
import { HiCheck } from "react-icons/hi";
import { AiFillGift } from "react-icons/ai";
import { BiFirstPage, BiLastPage, BiLinkExternal } from "react-icons/bi";
import { useEffect, useState, useCallback } from "react";
import { MdContentCopy } from "react-icons/md";
import axios from "axios";
import Web3 from "web3";
import abi from "../abi/erc20.json";
import {
	ArrowForwardIcon,
	CheckCircleIcon,
	InfoOutlineIcon,
} from "@chakra-ui/icons";
import { spidex, getContract, isTest } from "./../config/spidex";
import { EVMChainConfig } from "../types/type";
import { isMobile, toShortAddress, isMetaMaskInstalled } from "../utils/common";
import moment from "moment";
import React from "react";

export default function Home() {
	const toast = useToast();

	const [connect, setConnect] = useBoolean(false);
	const [chain, setChain] = useState<EVMChainConfig>();
	const [selectedChainId, setSelectedChainId] = useState<string>();
	const [address, setAddress] = useState<string>();
	const [spxAmount, setSpxAmount] = useState<string>("0");
	const [usdcAmount, setUSDCAmount] = useState<string>("0");
	const [loaing, setLoading] = useBoolean(false);
	const [isLoaded, setIsLoaded] = useBoolean(false);
	const [isHover, setIsHover] = useBoolean(false);
	const [isChecked, setIsChecked] = useBoolean(false);
	const [list, setList] = useState<any[]>([]);
	const [page, setPage] = useState<number>(1);
	const [ref, setRef] = useState<number>(1);
	const [totalPage, setTotalPage] = useState<number>(1);
	const [isPhone, setIsPhone] = useBoolean(false);
	const [isTestnet, setIsTest] = useBoolean(false);

	const { onCopy, setValue, hasCopied } = useClipboard(address || "");

	const getTokenUrl = "/api/faucet";
	const getListurl = "/api/faucet/history";

	const onChange = useCallback(() => {
		const { ethereum }: any = window;
		ethereum.on("accountsChanged", (accounts: any) => {
			setAddress(accounts[0]);
		});
		ethereum.on("chainChanged", (chainId: string) => {
			setSelectedChainId(chainId);
		});
	}, []);

	const getConnect = async () => {
		if (!isMetaMaskInstalled()) {
			toast({
				title: "Connect Error",
				position: "bottom-left",
				description: "Please Install MetaMask.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		const { ethereum }: any = window;
		console.log("connect wallet", selectedChainId, chain?.chainId);

		ethereum?.enable().then((res: string) => {
			setAddress(res[0]);
		});
		ethereum?.chainId !== chain?.chainId
			? await ethereum?.request?.({
					method: "wallet_addEthereumChain",
					params: [chain],
			  })
			: setSelectedChainId(chain?.chainId);
	};

	const getList = useCallback(async () => {
		setIsLoaded.on();
		const result: any = await axios.get(getListurl, { params: { ref: ref } });
		setIsLoaded.off();
		if (result && result.data && result.data.length > 0) {
			setList(result.data);
			setTotalPage(result.data[0].total);
		}
	}, [page, setIsLoaded]);

	const getTokens = async () => {
		setLoading.on();
		const result: any = await axios.post(getTokenUrl, { address: address });
		setLoading.off();
		if (result.data.code == 0) {
			toast({
				title: "Collection Success.",
				position: "bottom-left",
				description: "We have sent funds 1SPX and 1000USDC to your account.",
				status: "success",
				duration: 5000,
				isClosable: true,
			});
			setPage(1);
			getList();
		} else {
			toast({
				title: "Collection failure",
				position: "bottom-left",
				description: result.data.msg,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	const getBalance = useCallback(() => {
		console.log(address, selectedChainId, chain?.chainId);
		if (address && selectedChainId && selectedChainId === chain?.chainId) {
			const { ethereum }: any = window;
			const web3 = new Web3(ethereum);
			web3.eth.getBalance(address).then((balance) => {
				const amount = parseFloat(balance) / Math.pow(10, 18);
				setSpxAmount(String(amount.toFixed(2)));
			});

			const contract = new web3.eth.Contract(
				abi as any,
				getContract(location.host)
			);
			contract.methods
				.balanceOf(address)
				.call()
				.then((balance: string) => {
					const amount = parseFloat(balance) / Math.pow(10, 6);
					setUSDCAmount(String(amount.toFixed(2)));
				});

			setConnect.on();
			return;
		}
		setConnect.off();
	}, [address, chain?.chainId, selectedChainId, setConnect]);

	useInterval(getBalance, 2000);

	const onAddERC20Token = useCallback(() => {
		if (!connect) {
			return;
		}

		const { ethereum }: any = window;
		ethereum.request({
			method: "wallet_watchAsset",
			params: {
				type: "ERC20",
				options: {
					address: getContract(location.host),
					symbol: "USDC",
					decimals: 6,
					image: "https://testnet.spidex.app/images/icons/USDC.png",
				},
			},
		});
	}, [connect]);

	useEffect(() => {
		const { ethereum }: any = window;
		const spxChain = spidex(location.host);

		ethereum?.enable().then((res: string) => {
			setAddress(res[0]);
		});
		setChain(spxChain as EVMChainConfig);
		setAddress(ethereum?.selectedAddress);
		onChange();
	}, [onChange]);

	const addPage = () => {
		setPage(page + 1);
		setRef(list[list.length - 1].id);
	};

	const subPage = () => {
		setPage(page - 1);
		setRef(list[0].id);
	};

	useEffect(() => {
		getList();
	}, [getList, page]);

	useEffect(() => {
		setValue(address as string);
	}, [address, setValue]);

	useEffect(() => {
		isTest(location.host) ? setIsTest.on() : setIsTest.off();
	}, [setIsTest]);

	useEffect(() => {
		if (isMobile()) {
			setIsPhone.on();
			setIsChecked.on();
		}
	}, [setIsChecked, setIsPhone]);

	return (
		<Box className={styles.container}>
			<Head>
				<title>Spidex testnet faucet</title>
				<meta name="description" content="Spidex testnet faucet" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Box className={styles.card}>
				<Flex flexDir="column" alignItems="center">
					<Flex
						w="full"
						justifyContent="center"
						bg="spxGray.300"
						position="fixed"
						zIndex={99}
					>
						<Flex
							h="70px"
							w="1000px"
							justifyContent="space-between"
							alignItems="center"
						>
							<HStack>
								<Image src="/images/spidex.png" h={8} alt="" />
								<Heading size="md" fontWeight="bold" ml={5} whiteSpace="nowrap">
									Spidex Faucet
								</Heading>
							</HStack>
							<HStack>
								<Box
									borderRadius="full"
									onClick={getConnect}
									cursor="pointer"
									px={3}
									py={2}
									bg="spxGrayButton.300"
									fontWeight="semibold"
									color="spxGray.800"
									_hover={{
										color: "#fff",
									}}
								>
									<Link
										target="_blank"
										href={`https://${
											isTestnet ? "testnet" : "devnet"
										}.spidex.app`}
									>
										<HStack>
											<Icon as={AiFillGift} boxSize={5} />
											<Text ml={3}>Start To Test</Text>
											<Icon as={BiLinkExternal} ml={1} />
										</HStack>
									</Link>
								</Box>
							</HStack>
						</Flex>
					</Flex>

					{!isChecked ? (
						<Center w="full" py={12} bg="#101213" mt="100px">
							<Flex
								w="1000px"
								justifyContent="space-between"
								alignItems="center"
								mt={2}
							>
								<Box
									p={4}
									w="270px"
									h="360px"
									borderRadius="lg"
									cursor="pointer"
									bg="spxGray.200"
									_hover={{
										transform: "scale(1.01)",
										bg: "spxGray.300",
									}}
									transition="all .3s ease"
									boxShadow="lg"
								>
									<Text fontWeight="semibold" fontSize="xl" color="spxGray.800">
										Step1
									</Text>
									<Flex
										position="relative"
										alignItems="center"
										justifyContent="center"
										bg={connect ? "#579e6e" : "spxGray.400"}
										w="full"
										h="70px"
										borderRadius="sm"
										mt={5}
									>
										<Link
											href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
											target="_blank"
										>
											<HStack>
												<Image
													src="/images/metamask-fox.svg"
													boxSize={6}
													alt=""
												/>
												<Box fontWeight="semibold">
													{connect ? "Link Success" : "Link wallet"}
												</Box>
											</HStack>
										</Link>
										{connect ? (
											<Icon
												ml={2}
												as={CheckCircleIcon}
												boxSize={4}
												color="#fff"
												bgColor="#579e6e"
												borderRadius={10}
											/>
										) : null}
									</Flex>
									<Button
										mt={4}
										w="full"
										variant={connect ? "ghost" : "whitePrimary"}
										rounded="md"
										boxShadow="lg"
										bg={connect ? "#34363a" : "#fff"}
										onClick={getConnect}
									>
										{connect ? (
											<HStack>
												<Jazzicon
													diameter={17}
													seed={jsNumberForAddress(address as string)}
												/>
												<Text fontSize="sm">
													{toShortAddress(address as string)}
												</Text>
												<Icon
													ml={2}
													as={hasCopied ? HiCheck : MdContentCopy}
													onClick={onCopy}
												/>
											</HStack>
										) : (
											"Connect"
										)}
									</Button>
									<Flex
										bg="spxGray.300"
										w="full"
										h="75px"
										px={3}
										py={2}
										fontSize="xs"
										borderRadius="lg"
										fontWeight="semibold"
										flexDirection="column"
										mt={4}
										color="spxGray.600"
									>
										<Flex mb="2px" justifyContent="space-between">
											<Text>Your Balance</Text>
											{connect ? (
												<Box
													borderBottomWidth="1px"
													color="spxGray.600"
													borderColor="spxGray.600"
													onClick={onAddERC20Token}
													_hover={{
														color: "spxGray.800",
														borderColor: "spxGray.800",
													}}
												>
													<Flex alignItems="center">
														<Image src="/images/USDC.png" boxSize={3} alt="" />
														<Text ml={1}>Add asset</Text>
													</Flex>
												</Box>
											) : null}
										</Flex>

										<Flex justifyContent="space-between" mt="2px">
											<Text>SPX</Text>
											<Text color="spxGray.800">{spxAmount}</Text>
										</Flex>
										<Flex justifyContent="space-between" mt="2px">
											<HStack position="relative">
												<Text>USDC</Text>
											</HStack>
											<Text color="spxGray.800">{usdcAmount}</Text>
										</Flex>
									</Flex>
									<Flex
										fontSize="sm"
										mt={6}
										alignItems="flex-start"
										color="spxGray.600"
									>
										<Icon as={InfoOutlineIcon} boxSize={4} mt="2px" />
										<Text ml={2} fontSize="sm" lineHeight="17px">
											Install metamask, then create an account, finally connect
										</Text>
									</Flex>
								</Box>
								<Icon as={ArrowForwardIcon} boxSize={5} />
								<Box
									p={4}
									w="270px"
									h="360px"
									bg="spxGray.200"
									borderRadius="lg"
									cursor="pointer"
									_hover={{
										transform: "scale(1.01)",
										bg: "spxGray.300",
									}}
									transition="all .3s ease"
									boxShadow="lg"
								>
									<Text fontWeight="semibold" fontSize="xl" color="spxGray.800">
										Step2
									</Text>
									<Flex
										position="relative"
										alignItems="center"
										justifyContent="center"
										bg="spxGray.400"
										w="full"
										h="70px"
										borderRadius="sm"
										mt={5}
									>
										<HStack>
											<Box fontWeight="semibold" mr={2}>
												Claim
											</Box>
											<Image
												boxSize={6}
												src="/images/spidex.png"
												display="inline-block"
												alt=""
											/>
											<Text color="#fff">+</Text>
											<Image
												boxSize={6}
												src="/images/USDC.png"
												display="inline-block"
												alt=""
											/>
										</HStack>
									</Flex>
									<Button
										mt={4}
										w="full"
										isDisabled={!connect}
										variant={!connect ? "ghost" : "whitePrimary"}
										rounded="md"
										boxShadow="lg"
										isLoading={loaing}
										loadingText="funding"
										bg={!connect ? "spxGray.400" : "#fff"}
										_hover={{ bg: !connect ? "spxGray.400" : "#ffffffcc" }}
										onClick={getTokens}
									>
										<Text>Get Tokens</Text>
									</Button>
									<Flex
										bg="spxGray.300"
										w="full"
										h="75px"
										px={3}
										py={2}
										fontSize="xs"
										borderRadius="lg"
										fontWeight="semibold"
										flexDirection="column"
										mt={4}
										color="spxGray.600"
									>
										<HStack mb="2px" whiteSpace="nowrap">
											<Text>Will Receive</Text>
											{connect ? (
												<>
													<Icon as={ArrowForwardIcon} boxSize={3} />
													<Text color="spxGray.800">
														{toShortAddress(address as string, 15)}
													</Text>
												</>
											) : null}
										</HStack>
										<Flex justifyContent="space-between" mt="2px">
											<Text>SPX</Text>
											<Text color="spxGray.800">1</Text>
										</Flex>
										<Flex justifyContent="space-between" mt="2px">
											<Text>USDC</Text>
											<Text color="spxGray.800">1000</Text>
										</Flex>
									</Flex>
									<Flex
										fontSize="sm"
										mt={6}
										alignItems="flex-start"
										color="spxGray.600"
									>
										<Icon as={InfoOutlineIcon} boxSize={4} mt="2px" />
										<Text ml={2} fontSize="sm" lineHeight="17px">
											One claim per address per day.
										</Text>
									</Flex>
								</Box>
								<Icon as={ArrowForwardIcon} boxSize={5} />
								<Box
									p={4}
									w="270px"
									h="360px"
									bg="spxGray.200"
									borderRadius="lg"
									overflow="hidden"
									cursor="pointer"
									_hover={{
										transform: "scale(1.01)",
										bg: "spxGray.300",
									}}
									transition="all .3s ease"
									boxShadow="lg"
								>
									<Text fontWeight="semibold" fontSize="xl" color="spxGray.800">
										Step3
									</Text>
									<Flex
										position="relative"
										alignItems="center"
										justifyContent="center"
										bg="spxGray.400"
										w="full"
										h="70px"
										borderRadius="sm"
										mt={5}
									>
										<HStack>
											<Image
												ml={3}
												src="/images/block-text.svg"
												borderRadius="sm"
												h="60%"
												w="60%"
												opacity="0.8"
												alt=""
											/>
											<Image
												src="/images/block.svg"
												borderRadius="sm"
												h="50px"
												alt=""
											/>
										</HStack>
									</Flex>
									<Link
										target="_blank"
										href={`https://${
											isTestnet ? "testnet" : "devnet"
										}.spidex.app`}
									>
										<Button
											mt={4}
											w="full"
											isDisabled={parseFloat(usdcAmount) <= 0}
											variant={
												parseFloat(usdcAmount) <= 0 ? "ghost" : "whitePrimary"
											}
											rounded="md"
											boxShadow="lg"
											bg={parseFloat(usdcAmount) <= 0 ? "spxGray.400" : "#fff"}
											_hover={{
												bg:
													parseFloat(usdcAmount) <= 0
														? "spxGray.400"
														: "#ffffffcc",
											}}
										>
											<Text>Start to test</Text>
											<Icon as={BiLinkExternal} ml={1} />
										</Button>
									</Link>

									<Flex
										bg="spxGray.300"
										w="full"
										h="75px"
										px={3}
										py={2}
										fontSize="xs"
										borderRadius="lg"
										fontWeight="semibold"
										flexDirection="column"
										mt={4}
										color="spxGray.600"
									>
										<HStack mb="2px">
											<Icon as={AiFillGift} boxSize={4} />
											<Text fontSize="sm">Airdrop</Text>
										</HStack>
										<Text mt="2px">
											You will get airdrop by completing the test task.
										</Text>
									</Flex>
								</Box>
							</Flex>
						</Center>
					) : (
						<VStack w="full" position="relative" mt="100px">
							<Flex
								position={isPhone ? "relative" : "absolute"}
								top={isPhone ? "0" : "-35px"}
								left={0}
								mb={2}
								justifyContent={isPhone ? "center" : "flex-start"}
								fontWeight="semibold"
								alignItems="center"
								flexFlow="row wrap"
							>
								<Text display="inline-block">
									Enter your address, Receive funds
								</Text>
								<Image
									ml={2}
									mr={2}
									boxSize="20px"
									src="/images/spidex.png"
									display="inline-block"
									alt=""
								/>
								+
								<Image
									ml={2}
									mr={2}
									boxSize="20px"
									src="/images/USDC.png"
									display="inline-block"
									alt=""
								/>
								<Text display="inline-block">from spidex</Text>
							</Flex>
							<Box
								bg="spxGray.200"
								h="185px"
								borderRadius="lg"
								w="full"
								cursor="pointer"
								p={4}
								mt={4}
								pb={6}
								onMouseMove={setIsHover.on}
								onMouseOut={setIsHover.off}
							>
								<Flex alignItems="flex-end" h="62px">
									<Input
										className={isHover ? styles.ani : styles.input}
										borderRadius={0}
										size="xs"
										variant="unstyled"
										p={2}
										pl={0}
										mt={6}
										ml={2}
										fontSize="sm"
										placeholder="Enter Address"
										value={address}
										onChange={(e) => setAddress(e.target.value)}
									/>
								</Flex>
								<Box mt={10}>
									<Button
										variant="whitePrimary"
										rounded="md"
										boxShadow="lg"
										isDisabled={!address}
										onClick={getTokens}
										isLoading={loaing}
										loadingText="Getting"
									>
										<HStack>
											<Text>Get Tokens</Text>
											<Icon as={IoMdArrowForward} boxSize={5} />
										</HStack>
									</Button>
								</Box>
							</Box>
						</VStack>
					)}

					<Flex w="full" justifyContent="center" bg="#101213">
						<Box w="1000px" mt={4} mb={20}>
							<Flex whiteSpace="nowrap" alignItems="center" mt={8}>
								<Text fontSize="lg" fontWeight="bold" mr={3} ml={3}>
									Recent requests
								</Text>
							</Flex>

							<SlideFade offsetY="20px" in>
								<Box
									bg="spxGray.200"
									borderRadius="lg"
									w="full"
									p={4}
									pt={2}
									mt={4}
									mb={4}
									fontSize="sm"
									fontWeight="semibold"
								>
									{isLoaded && (
										<Stack mt={4}>
											<Skeleton
												height="28px"
												isLoaded={isLoaded}
												bg="spxGray.300"
												borderRadius={5}
											/>
											<Skeleton
												height="28px"
												isLoaded={isLoaded}
												bg="spxGray.300"
												borderRadius={5}
											/>
											<Skeleton
												height="28px"
												isLoaded={isLoaded}
												bg="spxGray.300"
												borderRadius={5}
											/>
											<Skeleton
												height="28px"
												isLoaded={isLoaded}
												bg="spxGray.300"
												borderRadius={5}
											/>
											<Skeleton
												height="28px"
												isLoaded={isLoaded}
												bg="spxGray.300"
												borderRadius={5}
											/>
										</Stack>
									)}

									{!isLoaded && list && list.length > 0 ? (
										<Flex flexDirection="column">
											{list.map((item: any, index) => {
												return (
													<Flex
														key={index}
														className={styles.raw}
														pb={2}
														pt={2}
														alignItems="center"
														justifyContent="space-between"
													>
														<HStack>
															<Icon as={BsArrowRight} boxSize={4} />
															<Box
																bg="spxGray.400"
																borderRadius={20}
																display="flex"
																w="100p"
																h="30px"
																alignItems="center"
																ml={3}
															>
																<Image
																	ml={2}
																	mr={1}
																	boxSize="20px"
																	src="/images/spidex.png"
																	display="inline-block"
																	alt=""
																/>
																+
																<Image
																	ml={1}
																	mr={2}
																	boxSize="20px"
																	src="/images/USDC.png"
																	display="inline-block"
																	alt=""
																/>
															</Box>
														</HStack>

														<Text
															ml={3}
															className={styles.address}
															fontWeight="semibold"
															textAlign="center"
														>
															{item.address}
														</Text>
														<Text ml={3} noOfLines={1}>
															{moment(item.ts / 1000).fromNow()}
														</Text>
														<Link
															ml={5}
															textDecoration="underline"
															noOfLines={1}
															href={`https://explorer.${
																isTestnet ? "testnet" : "devnet"
															}.spidex.app/address/${item.address}`}
															target="_blank"
															fontWeight="semibold"
															textAlign="center"
														>
															Scan
														</Link>
													</Flex>
												);
											})}
										</Flex>
									) : (
										<Box p={3} pb={2}></Box>
									)}
								</Box>
							</SlideFade>

							<Flex justifyContent="flex-end" mr={2}>
								<Button
									bg="spxGray.300"
									borderRadius={25}
									p={2}
									h="44px"
									cursor="pointer"
									isDisabled={page === 1}
									onClick={subPage}
								>
									<Icon as={BiFirstPage} w={7} h={7} />
								</Button>
								<Button
									bg="spxGray.300"
									borderRadius={25}
									p={2}
									h="44px"
									ml={3}
									isDisabled={totalPage <= page}
									cursor="pointer"
									onClick={addPage}
								>
									<Icon as={BiLastPage} w={7} h={7} />
								</Button>
							</Flex>
						</Box>
					</Flex>
				</Flex>
			</Box>
		</Box>
	);
}
