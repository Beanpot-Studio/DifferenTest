import { ethers } from 'ethers';
import { ref } from 'vue';

// Contract ABI for the NFT badge contract
const BADGE_CONTRACT_ABI = [
  "function mintBadge(address student, string memory badgeId, string memory metadata) public returns (uint256)",
  "function isBadgeClaimed(string memory badgeId) public view returns (bool)",
  "function owner() public view returns (address)"
];

// Contract address (replace with your deployed contract address)
const BADGE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // TODO: Replace with actual contract address

class BlockchainService {
  static provider = null;
  static contract = null;
  static isInitialized = ref(false);
  static userAddress = null;

  static async initialize() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use blockchain features');
      }

      // Initialize provider (using MetaMask or similar)
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access and get user's address
      const accounts = await this.provider.send("eth_requestAccounts", []);
      this.userAddress = accounts[0];
      
      // Get the signer
      const signer = await this.provider.getSigner();
      
      // Initialize contract with proper address validation
      if (!ethers.isAddress(BADGE_CONTRACT_ADDRESS)) {
        throw new Error('Invalid contract address');
      }

      this.contract = new ethers.Contract(
        BADGE_CONTRACT_ADDRESS,
        BADGE_CONTRACT_ABI,
        signer
      );
      
      this.isInitialized.value = true;
      return true;
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      throw error;
    }
  }

  static async mintBadge(badgeId, metadata) {
    try {
      if (!this.isInitialized.value) {
        await this.initialize();
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      if (!this.userAddress) {
        throw new Error('No wallet address available');
      }

      // Check if badge is already claimed
      const isClaimed = await this.contract.isBadgeClaimed(badgeId);
      if (isClaimed) {
        return {
          success: false,
          message: 'Badge already claimed'
        };
      }

      // Mint the badge
      const tx = await this.contract.mintBadge(
        this.userAddress,
        badgeId,
        JSON.stringify(metadata)
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId: receipt.logs[0].topics[3] // Extract token ID from event
      };
    } catch (error) {
      console.error('Error minting badge:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async isBadgeClaimed(badgeId) {
    try {
      if (!this.isInitialized.value) {
        await this.initialize();
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.isBadgeClaimed(badgeId);
    } catch (error) {
      console.error('Error checking badge claim status:', error);
      return false;
    }
  }
}

export default BlockchainService; 