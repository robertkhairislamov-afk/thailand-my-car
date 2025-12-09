import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers';

// Check if testnet mode
const IS_TESTNET = import.meta.env.VITE_BSC_TESTNET === 'true';

// Network configurations
const MAINNET = {
  chainId: 56,
  chainIdHex: '0x38',
  name: 'BNB Smart Chain',
  rpc: 'https://bsc-dataseed.binance.org/',
  explorer: 'https://bscscan.com/',
  usdt: '0x55d398326f99059fF775485246999027B3197955',
  usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
};

const TESTNET = {
  chainId: 97,
  chainIdHex: '0x61',
  name: 'BNB Smart Chain Testnet',
  rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  explorer: 'https://testnet.bscscan.com/',
  // Our custom Test USDT on BSC Testnet
  usdt: '0xa683Bc18223b203ef613b29eE4f0A32a262B3B1D',
  // Use same token for USDC in testnet
  usdc: '0xa683Bc18223b203ef613b29eE4f0A32a262B3B1D',
};

const NETWORK = IS_TESTNET ? TESTNET : MAINNET;

// Export network config
export const BSC_CHAIN_ID = NETWORK.chainId;
export const BSC_CHAIN_ID_HEX = NETWORK.chainIdHex;
export const USDT_CONTRACT = NETWORK.usdt;
export const USDC_CONTRACT = NETWORK.usdc;
export const IS_BSC_TESTNET = IS_TESTNET;
export const BSC_EXPLORER = NETWORK.explorer;

// ERC-20 ABI (minimal for transfer)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

// BSC Network config for MetaMask
const BSC_NETWORK = {
  chainId: NETWORK.chainIdHex,
  chainName: NETWORK.name,
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: [NETWORK.rpc],
  blockExplorerUrls: [NETWORK.explorer]
};

export interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface BalanceInfo {
  usdt: string;
  usdc: string;
  bnb: string;
}

class BSCService {
  private provider: BrowserProvider | null = null;

  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    // @ts-ignore
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Get provider
  private async getProvider(): Promise<BrowserProvider> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }
    // @ts-ignore
    this.provider = new BrowserProvider(window.ethereum);
    return this.provider;
  }

  // Check and switch to BSC network
  async ensureBSCNetwork(): Promise<boolean> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    try {
      // @ts-ignore
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (chainId === BSC_CHAIN_ID_HEX) {
        return true;
      }

      // Try to switch to BSC
      try {
        // @ts-ignore
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID_HEX }]
        });
        return true;
      } catch (switchError: any) {
        // Chain not added, try to add it
        if (switchError.code === 4902) {
          // @ts-ignore
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_NETWORK]
          });
          return true;
        }
        throw switchError;
      }
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      throw new Error('Failed to switch to BSC network');
    }
  }

  // Get user's token balances
  async getBalances(address: string): Promise<BalanceInfo> {
    const provider = await this.getProvider();

    // Get BNB balance
    const bnbBalance = await provider.getBalance(address);

    // Get USDT balance
    const usdtContract = new Contract(USDT_CONTRACT, ERC20_ABI, provider);
    const usdtBalance = await usdtContract.balanceOf(address);

    // Get USDC balance
    const usdcContract = new Contract(USDC_CONTRACT, ERC20_ABI, provider);
    const usdcBalance = await usdcContract.balanceOf(address);

    return {
      bnb: formatUnits(bnbBalance, 18),
      usdt: formatUnits(usdtBalance, 18), // USDT on BSC has 18 decimals
      usdc: formatUnits(usdcBalance, 18)  // USDC on BSC has 18 decimals
    };
  }

  // Transfer USDT to platform wallet
  async transferUSDT(
    toAddress: string,
    amount: number
  ): Promise<TransferResult> {
    try {
      // Ensure BSC network
      await this.ensureBSCNetwork();

      const provider = await this.getProvider();
      const signer = await provider.getSigner();

      // Create USDT contract instance
      const usdtContract = new Contract(USDT_CONTRACT, ERC20_ABI, signer);

      // Convert amount to wei (USDT on BSC has 18 decimals)
      const amountWei = parseUnits(amount.toString(), 18);

      // Check balance
      const balance = await usdtContract.balanceOf(await signer.getAddress());
      if (balance < amountWei) {
        return {
          success: false,
          error: `Insufficient USDT balance. You have ${formatUnits(balance, 18)} USDT`
        };
      }

      // Execute transfer
      const tx = await usdtContract.transfer(toAddress, amountWei);

      // Wait for confirmation
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Transfer error:', error);

      // Handle user rejection
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        return {
          success: false,
          error: 'Transaction rejected by user'
        };
      }

      return {
        success: false,
        error: error.message || 'Transfer failed'
      };
    }
  }

  // Transfer USDC to platform wallet
  async transferUSDC(
    toAddress: string,
    amount: number
  ): Promise<TransferResult> {
    try {
      // Ensure BSC network
      await this.ensureBSCNetwork();

      const provider = await this.getProvider();
      const signer = await provider.getSigner();

      // Create USDC contract instance
      const usdcContract = new Contract(USDC_CONTRACT, ERC20_ABI, signer);

      // Convert amount to wei (USDC on BSC has 18 decimals)
      const amountWei = parseUnits(amount.toString(), 18);

      // Check balance
      const balance = await usdcContract.balanceOf(await signer.getAddress());
      if (balance < amountWei) {
        return {
          success: false,
          error: `Insufficient USDC balance. You have ${formatUnits(balance, 18)} USDC`
        };
      }

      // Execute transfer
      const tx = await usdcContract.transfer(toAddress, amountWei);

      // Wait for confirmation
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Transfer error:', error);

      // Handle user rejection
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        return {
          success: false,
          error: 'Transaction rejected by user'
        };
      }

      return {
        success: false,
        error: error.message || 'Transfer failed'
      };
    }
  }

  // Get BSCScan link for transaction
  getTxLink(txHash: string): string {
    return `${BSC_EXPLORER}tx/${txHash}`;
  }

  // Check if testnet
  isTestnet(): boolean {
    return IS_TESTNET;
  }

  // Get network name
  getNetworkName(): string {
    return NETWORK.name;
  }
}

export const bscService = new BSCService();
export default bscService;
