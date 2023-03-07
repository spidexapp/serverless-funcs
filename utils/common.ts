export const toShortAddress = (address: string, maxLength = 16) => {
	if (!address) {
		address = "";
	}
	const tmpArr = address.split(".");
	const halfLength = Math.floor(maxLength / 2);
	const realAccount = tmpArr[0];
	if (realAccount.length <= maxLength) {
		return address;
	}
	return `${realAccount.substr(0, halfLength)}...${realAccount.substr(
		-halfLength
	)}${tmpArr[1] ? `.${tmpArr[1]}` : ""}`;
};

export const isMobile = () => {
	try {
    document.createEvent("TouchEvent"); return true;
  } catch(e) {
    return false; 
  }
};

export const isMetaMaskInstalled = () => {
  const {ethereum}: any = window
  return Boolean(ethereum && ethereum.isMetaMask)
}
